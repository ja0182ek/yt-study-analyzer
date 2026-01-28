import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript-plus';
import { TranscriptResponse } from '@/types';

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

    // 動画IDのバリデーション
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid video ID format' },
        { status: 400 }
      );
    }

    try {
      // youtube-transcript ライブラリを使用して字幕を取得
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

      if (!transcriptItems || transcriptItems.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No transcript available for this video' },
          { status: 404 }
        );
      }

      // 字幕テキストを結合
      const transcript = transcriptItems
        .map(item => item.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      return NextResponse.json({
        success: true,
        data: {
          videoId,
          transcript,
        },
      });
    } catch (transcriptError) {
      // 字幕が利用できない場合のエラー処理
      console.error('Transcript fetch error:', transcriptError);

      return NextResponse.json(
        {
          success: false,
          error: 'Transcript not available. The video may not have captions.',
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Transcript API error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
}

// 複数動画の字幕を一括取得するエンドポイント
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

    // 上限チェック（一度に最大20件）
    const limitedIds = videoIds.slice(0, 20);

    const results: { videoId: string; transcript: string | null; error?: string }[] = [];

    // 並列で取得（ただし同時実行数を制限）
    const concurrencyLimit = 5;
    for (let i = 0; i < limitedIds.length; i += concurrencyLimit) {
      const batch = limitedIds.slice(i, i + concurrencyLimit);

      const batchResults = await Promise.all(
        batch.map(async (videoId) => {
          try {
            const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
            const transcript = transcriptItems
              .map(item => item.text)
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();

            return { videoId, transcript };
          } catch {
            return { videoId, transcript: null, error: 'Transcript not available' };
          }
        })
      );

      results.push(...batchResults);
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
