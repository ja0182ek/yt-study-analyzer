import { NextRequest, NextResponse } from 'next/server';
import { TranscriptResponse } from '@/types';

interface SupadataTranscriptResponse {
  content: string;
  lang?: string;
  segments?: Array<{
    text: string;
    start: number;
    end: number;
  }>;
}

/**
 * Supadata APIを使用して字幕を取得
 */
async function fetchTranscriptFromSupadata(videoId: string, apiKey: string): Promise<string | null> {
  try {
    const url = `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=true`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
      signal: AbortSignal.timeout(30000), // 30秒タイムアウト
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`No transcript available for ${videoId}`);
        return null;
      }
      console.error(`Supadata API error for ${videoId}: ${response.status}`);
      return null;
    }

    const data: SupadataTranscriptResponse = await response.json();

    if (!data.content) {
      console.warn(`Empty transcript content for ${videoId}`);
      return null;
    }

    // テキストをクリーンアップ
    const transcript = data.content
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log(`Successfully fetched transcript for ${videoId} (${transcript.length} chars)`);
    return transcript;
  } catch (error) {
    console.error(`Error fetching transcript for ${videoId}:`, error);
    return null;
  }
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

    const apiKey = process.env.SUPADATA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Supadata API key is not configured' },
        { status: 500 }
      );
    }

    const transcript = await fetchTranscriptFromSupadata(videoId, apiKey);

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

    const apiKey = process.env.SUPADATA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Supadata API key is not configured' },
        { status: 500 }
      );
    }

    const limitedIds = videoIds.slice(0, 20);
    const results: { videoId: string; transcript: string | null; error?: string }[] = [];

    // 同時実行数を制限（API負荷軽減）
    const concurrencyLimit = 5;
    for (let i = 0; i < limitedIds.length; i += concurrencyLimit) {
      const batch = limitedIds.slice(i, i + concurrencyLimit);

      const batchResults = await Promise.all(
        batch.map(async (videoId) => {
          try {
            const transcript = await fetchTranscriptFromSupadata(videoId, apiKey);
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
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    const successCount = results.filter(r => r.transcript).length;
    console.log(`Fetched ${successCount}/${limitedIds.length} transcripts successfully`);

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
