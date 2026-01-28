import { NextRequest, NextResponse } from 'next/server';
import { TranscriptResponse } from '@/types';

// Invidious インスタンスのリスト（フォールバック用）
const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://invidious.jing.rocks',
  'https://yt.artemislena.eu',
  'https://invidious.privacyredirect.com',
];

interface InvidiousCaptionTrack {
  label: string;
  language_code: string;
  url: string;
}

interface InvidiousCaption {
  start: number;
  end: number;
  text: string;
}

/**
 * Invidious APIを使用して字幕を取得
 */
async function fetchTranscriptFromInvidious(videoId: string): Promise<string | null> {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      // まず字幕トラック一覧を取得
      const captionsUrl = `${instance}/api/v1/captions/${videoId}`;
      const captionsRes = await fetch(captionsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(10000), // 10秒タイムアウト
      });

      if (!captionsRes.ok) {
        console.warn(`Invidious ${instance} returned ${captionsRes.status} for captions list`);
        continue;
      }

      const captionsData = await captionsRes.json();
      const captions: InvidiousCaptionTrack[] = captionsData.captions || [];

      if (captions.length === 0) {
        console.warn(`No captions available for ${videoId} on ${instance}`);
        return null; // この動画には字幕がない
      }

      // 英語字幕を優先、なければ最初の字幕を使用
      const englishTrack = captions.find(
        (c) => c.language_code === 'en' || c.language_code.startsWith('en-')
      );
      const track = englishTrack || captions[0];

      // 字幕の内容を取得（JSON形式）
      const subtitleUrl = `${instance}${track.url}&format=json3`;
      const subtitleRes = await fetch(subtitleUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!subtitleRes.ok) {
        console.warn(`Failed to fetch subtitle content from ${instance}`);
        continue;
      }

      const subtitleData = await subtitleRes.json();
      const events = subtitleData.events || [];

      // テキストを抽出して結合
      const texts: string[] = [];
      for (const event of events) {
        if (event.segs) {
          const segText = event.segs
            .map((seg: { utf8?: string }) => seg.utf8 || '')
            .join('')
            .trim();
          if (segText) {
            texts.push(segText);
          }
        }
      }

      if (texts.length === 0) {
        continue;
      }

      const transcript = texts
        .join(' ')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      console.log(`Successfully fetched transcript for ${videoId} from ${instance}`);
      return transcript;
    } catch (error) {
      console.warn(`Invidious instance ${instance} failed:`, error);
      continue;
    }
  }

  return null;
}

export async function POST(request: NextRequest): Promise<NextResponse<TranscriptResponse>> {
  try {
    const body = await request.json();
    const { videoId } = body as { videoId: string };

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'No video ID provided' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid video ID format' },
        { status: 400 }
      );
    }

    const transcript = await fetchTranscriptFromInvidious(videoId);

    if (!transcript) {
      return NextResponse.json(
        { success: false, error: 'Transcript not available for this video' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { videoId, transcript },
    });
  } catch (error) {
    console.error('Transcript API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
}

// 複数動画の字幕を一括取得
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { videoIds } = body as { videoIds: string[] };

    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No video IDs provided' },
        { status: 400 }
      );
    }

    const limitedIds = videoIds.slice(0, 20);
    const results: { videoId: string; transcript: string | null; error?: string }[] = [];

    // 同時実行数を制限（Invidiousインスタンスへの負荷軽減）
    const concurrencyLimit = 3;
    for (let i = 0; i < limitedIds.length; i += concurrencyLimit) {
      const batch = limitedIds.slice(i, i + concurrencyLimit);

      const batchResults = await Promise.all(
        batch.map(async (videoId) => {
          try {
            const transcript = await fetchTranscriptFromInvidious(videoId);
            if (transcript) {
              return { videoId, transcript };
            }
            return { videoId, transcript: null, error: 'Transcript not available' };
          } catch {
            return { videoId, transcript: null, error: 'Failed to fetch transcript' };
          }
        })
      );

      results.push(...batchResults);

      // レート制限を避けるため待機
      if (i + concurrencyLimit < limitedIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Bulk transcript API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transcripts' },
      { status: 500 }
    );
  }
}
