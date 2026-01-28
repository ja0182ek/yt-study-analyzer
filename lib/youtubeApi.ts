import { VideoInfo } from '@/types';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * ISO 8601 duration形式（PT4M13S等）を秒に変換
 */
export function parseDuration(duration: string): number {
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(duration);
  if (!match) {
    return 0;
  }

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * 秒を「時間:分:秒」形式に変換
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * YouTube Data API v3 から動画情報を取得
 * @param videoIds 動画IDの配列（最大50件ずつ）
 * @param apiKey YouTube API Key
 */
export async function fetchVideoDurations(
  videoIds: string[],
  apiKey: string
): Promise<VideoInfo[]> {
  if (!apiKey) {
    throw new Error('YouTube API Key is not configured');
  }

  const results: VideoInfo[] = [];
  const batchSize = 50; // YouTube APIの制限

  // 50件ずつバッチ処理
  for (let i = 0; i < videoIds.length; i += batchSize) {
    const batch = videoIds.slice(i, i + batchSize);
    const ids = batch.join(',');

    const url = `${YOUTUBE_API_BASE}/videos?part=contentDetails,snippet&id=${ids}&key=${apiKey}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('YouTube API Error:', errorData);

        if (response.status === 403) {
          throw new Error('YouTube API quota exceeded or API key invalid');
        }
        throw new Error(`YouTube API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.items) {
        data.items.forEach((item: {
          id: string;
          snippet?: { title?: string; channelTitle?: string };
          contentDetails?: { duration?: string };
        }) => {
          results.push({
            videoId: item.id,
            title: item.snippet?.title || 'Unknown Title',
            channelTitle: item.snippet?.channelTitle || 'Unknown Channel',
            duration: parseDuration(item.contentDetails?.duration || 'PT0S'),
          });
        });
      }
    } catch (error) {
      console.error(`Failed to fetch batch starting at ${i}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * 動画IDから重複を除去
 */
export function uniqueVideoIds(videoIds: string[]): string[] {
  return [...new Set(videoIds)];
}

/**
 * API呼び出しコスト計算（クォータ管理用）
 * videos.list は 1 ユニット/リクエスト
 * 1日の上限は通常 10,000 ユニット
 */
export function calculateApiCost(videoCount: number): {
  requests: number;
  units: number;
  estimatedPercentage: number;
} {
  const batchSize = 50;
  const requests = Math.ceil(videoCount / batchSize);
  const units = requests; // videos.list は 1 ユニット/リクエスト
  const dailyQuota = 10000;

  return {
    requests,
    units,
    estimatedPercentage: (units / dailyQuota) * 100,
  };
}
