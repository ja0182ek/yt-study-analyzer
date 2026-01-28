import { NextRequest, NextResponse } from 'next/server';
import { fetchVideoDurations, uniqueVideoIds } from '@/lib/youtubeApi';
import { VideoDurationResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<VideoDurationResponse>> {
  try {
    const body = await request.json();
    const { videoIds } = body as { videoIds: string[] };

    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No video IDs provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'YouTube API key is not configured' },
        { status: 500 }
      );
    }

    // 重複を除去
    const uniqueIds = uniqueVideoIds(videoIds);

    // 上限チェック（1回のリクエストで最大200件）
    if (uniqueIds.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Too many video IDs. Maximum 200 per request.' },
        { status: 400 }
      );
    }

    const videoInfos = await fetchVideoDurations(uniqueIds, apiKey);

    return NextResponse.json({
      success: true,
      data: videoInfos,
    });
  } catch (error) {
    console.error('Video duration API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch video durations';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
