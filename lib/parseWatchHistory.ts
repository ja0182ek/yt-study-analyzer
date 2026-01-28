import { WatchHistoryEntry, ParsedHistory } from '@/types';

/**
 * Google Takeout からエクスポートされた watch-history.html をパースする
 *
 * HTMLの構造:
 * <div class="content-cell mdl-cell mdl-cell--6-col mdl-typography--body-1">
 *   Watched <a href="https://www.youtube.com/watch?v=VIDEO_ID">動画タイトル</a>
 *   <br>
 *   チャンネル名
 *   <br>
 *   日付（例: Jan 15, 2025, 3:30:45 PM JST）
 * </div>
 */
export function parseWatchHistory(htmlContent: string): ParsedHistory {
  const entries: WatchHistoryEntry[] = [];

  // 正規表現で content-cell 内のデータを抽出
  // YouTubeの動画リンクパターン
  const videoLinkRegex = /Watched\s*<a[^>]*href="https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^"&]+)"[^>]*>([^<]+)<\/a>/gi;

  // content-cell ブロック全体を取得
  const cellRegex = /<div[^>]*class="[^"]*content-cell[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;

  let cellMatch;
  while ((cellMatch = cellRegex.exec(htmlContent)) !== null) {
    const cellContent = cellMatch[1];

    // "Watched" または "を視聴しました" を含むエントリのみ処理（広告視聴などは除外）
    if (!cellContent.includes('Watched') && !cellContent.includes('を視聴しました')) {
      continue;
    }

    // 動画IDとタイトルを抽出（英語形式と日本語形式の両方に対応）
    // 英語形式: Watched <a href="...">タイトル</a>
    // 日本語形式: <a href="...">タイトル</a> を視聴しました
    const videoMatchEn = /Watched\s*<a[^>]*href="https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^"&]+)"[^>]*>([^<]+)<\/a>/i.exec(cellContent);
    const videoMatchJa = /<a[^>]*href="https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^"&]+)"[^>]*>([^<]+)<\/a>\s*を視聴しました/i.exec(cellContent);
    const videoMatch = videoMatchEn || videoMatchJa;

    if (!videoMatch) {
      continue;
    }

    const videoId = videoMatch[1];
    const title = decodeHtmlEntities(videoMatch[2]);

    // チャンネル名と日付を抽出
    // <br> タグで分割してテキストを取得
    const brSplit = cellContent.split(/<br\s*\/?>/i);

    let channelName = 'Unknown Channel';
    let watchedAt = new Date();

    // 通常、チャンネル名は2番目の<br>の後
    // 日付は最後の<br>の後
    if (brSplit.length >= 2) {
      // チャンネル名（リンクがある場合とない場合がある）
      const channelPart = brSplit[1];
      const channelLinkMatch = /<a[^>]*>([^<]+)<\/a>/i.exec(channelPart);
      if (channelLinkMatch) {
        channelName = decodeHtmlEntities(channelLinkMatch[1].trim());
      } else {
        // リンクがない場合はテキストをそのまま使用
        const plainText = channelPart.replace(/<[^>]*>/g, '').trim();
        if (plainText) {
          channelName = decodeHtmlEntities(plainText);
        }
      }
    }

    // 日付を探す（最後のテキストブロック）
    for (let i = brSplit.length - 1; i >= 0; i--) {
      const part = brSplit[i].replace(/<[^>]*>/g, '').trim();
      const parsedDate = parseYouTubeDate(part);
      if (parsedDate) {
        watchedAt = parsedDate;
        break;
      }
    }

    entries.push({
      videoId,
      title,
      channelName,
      watchedAt,
    });
  }

  return {
    entries,
    totalCount: entries.length,
  };
}

/**
 * HTMLエンティティをデコード
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  };

  return text.replace(/&[^;]+;/g, (match) => {
    if (entities[match]) {
      return entities[match];
    }
    // 数値エンティティの処理
    const numMatch = /&#(\d+);/.exec(match);
    if (numMatch) {
      return String.fromCharCode(parseInt(numMatch[1], 10));
    }
    return match;
  });
}

/**
 * YouTube Takeoutの日付形式をパース
 * 例: "Jan 15, 2025, 3:30:45 PM JST"
 *     "2025年1月15日 15:30:45 JST"
 */
function parseYouTubeDate(dateString: string): Date | null {
  if (!dateString || dateString.length < 10) {
    return null;
  }

  // 英語形式: "Jan 15, 2025, 3:30:45 PM JST"
  const englishPattern = /^([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4}),?\s+(\d{1,2}):(\d{2}):?(\d{2})?\s*(AM|PM)?\s*([\w\/]+)?$/i;
  const englishMatch = englishPattern.exec(dateString.trim());

  if (englishMatch) {
    const monthMap: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };

    const month = monthMap[englishMatch[1].toLowerCase()];
    const day = parseInt(englishMatch[2], 10);
    const year = parseInt(englishMatch[3], 10);
    let hour = parseInt(englishMatch[4], 10);
    const minute = parseInt(englishMatch[5], 10);
    const second = englishMatch[6] ? parseInt(englishMatch[6], 10) : 0;
    const ampm = englishMatch[7]?.toUpperCase();

    if (ampm === 'PM' && hour !== 12) {
      hour += 12;
    } else if (ampm === 'AM' && hour === 12) {
      hour = 0;
    }

    if (month !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day, hour, minute, second);
    }
  }

  // 日本語形式: "2025年1月15日 15:30:45"
  const japanesePattern = /^(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{2}):?(\d{2})?/;
  const japaneseMatch = japanesePattern.exec(dateString.trim());

  if (japaneseMatch) {
    const year = parseInt(japaneseMatch[1], 10);
    const month = parseInt(japaneseMatch[2], 10) - 1;
    const day = parseInt(japaneseMatch[3], 10);
    const hour = parseInt(japaneseMatch[4], 10);
    const minute = parseInt(japaneseMatch[5], 10);
    const second = japaneseMatch[6] ? parseInt(japaneseMatch[6], 10) : 0;

    return new Date(year, month, day, hour, minute, second);
  }

  // スラッシュ区切り形式: "2026/01/26 18:49:23 JST"
  const slashPattern = /^(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2}):?(\d{2})?\s*([\w\/]+)?$/;
  const slashMatch = slashPattern.exec(dateString.trim());

  if (slashMatch) {
    const year = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10) - 1;
    const day = parseInt(slashMatch[3], 10);
    const hour = parseInt(slashMatch[4], 10);
    const minute = parseInt(slashMatch[5], 10);
    const second = slashMatch[6] ? parseInt(slashMatch[6], 10) : 0;

    return new Date(year, month, day, hour, minute, second);
  }

  // ISO形式やその他の形式を試す
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }

  return null;
}

/**
 * 直近N日間のエントリをフィルタリング
 */
export function filterRecentEntries(entries: WatchHistoryEntry[], days: number): WatchHistoryEntry[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  cutoffDate.setHours(0, 0, 0, 0);

  return entries.filter(entry => entry.watchedAt >= cutoffDate);
}

/**
 * 日付ごとに視聴データを集計
 */
export function groupByDate(entries: WatchHistoryEntry[]): Map<string, WatchHistoryEntry[]> {
  const grouped = new Map<string, WatchHistoryEntry[]>();

  entries.forEach(entry => {
    const dateKey = entry.watchedAt.toISOString().split('T')[0];
    const existing = grouped.get(dateKey) || [];
    existing.push(entry);
    grouped.set(dateKey, existing);
  });

  return grouped;
}
