import { NextRequest, NextResponse } from 'next/server';
import { parseWatchHistory } from '@/lib/parseWatchHistory';
import { ParseHistoryResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ParseHistoryResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック（10MB制限）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // ファイル形式チェック
    if (!file.name.endsWith('.html') && !file.type.includes('html')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file format. Please upload an HTML file.' },
        { status: 400 }
      );
    }

    const htmlContent = await file.text();

    // HTMLパース
    const parsedData = parseWatchHistory(htmlContent);

    if (parsedData.entries.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No watch history entries found. Please check if this is a valid YouTube watch history file from Google Takeout.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error('Parse history error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to parse watch history file' },
      { status: 500 }
    );
  }
}
