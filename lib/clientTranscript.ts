'use client';

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

interface InnertubeResponse {
  actions?: Array<{
    updateEngagementPanelAction?: {
      content?: {
        transcriptRenderer?: {
          content?: {
            transcriptSearchPanelRenderer?: {
              body?: {
                transcriptSegmentListRenderer?: {
                  initialSegments?: Array<{
                    transcriptSegmentRenderer?: {
                      snippet?: {
                        runs?: Array<{ text: string }>;
                      };
                      startMs?: string;
                      endMs?: string;
                    };
                  }>;
                };
              };
            };
          };
        };
      };
    };
  }>;
}

/**
 * クライアントサイドでYouTube字幕を取得
 * Innertube APIを使用（YouTubeの内部API）
 */
export async function fetchTranscriptClient(videoId: string): Promise<string | null> {
  try {
    // まず動画ページから必要な情報を取得するため、oembedを使用
    // oembedはCORSが許可されている
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const oembedRes = await fetch(oembedUrl);

    if (!oembedRes.ok) {
      console.warn(`Video ${videoId} not found or not embeddable`);
      return null;
    }

    // Innertube APIを使用して字幕を取得
    const innertubeUrl = 'https://www.youtube.com/youtubei/v1/get_transcript?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';

    // paramsをBase64エンコード
    const params = btoa(`\n\x0b${videoId}`);

    const response = await fetch(innertubeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20240101.00.00',
            hl: 'en',
          },
        },
        params: params,
      }),
    });

    if (!response.ok) {
      console.warn(`Innertube API failed for ${videoId}: ${response.status}`);
      return null;
    }

    const data: InnertubeResponse = await response.json();

    // 字幕データを抽出
    const transcriptSegments = extractTranscriptFromInnertube(data);

    if (!transcriptSegments || transcriptSegments.length === 0) {
      console.warn(`No transcript segments found for ${videoId}`);
      return null;
    }

    // テキストを結合
    const transcript = transcriptSegments
      .map(seg => seg.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return transcript || null;
  } catch (error) {
    console.error(`Error fetching transcript for ${videoId}:`, error);
    return null;
  }
}

/**
 * Innertube APIレスポンスから字幕を抽出
 */
function extractTranscriptFromInnertube(data: InnertubeResponse): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];

  try {
    const actions = data.actions || [];

    for (const action of actions) {
      const transcriptRenderer = action.updateEngagementPanelAction?.content?.transcriptRenderer;
      const body = transcriptRenderer?.content?.transcriptSearchPanelRenderer?.body;
      const initialSegments = body?.transcriptSegmentListRenderer?.initialSegments || [];

      for (const segment of initialSegments) {
        const renderer = segment.transcriptSegmentRenderer;
        if (renderer?.snippet?.runs) {
          const text = renderer.snippet.runs.map(run => run.text).join('');
          const startMs = parseInt(renderer.startMs || '0', 10);
          const endMs = parseInt(renderer.endMs || '0', 10);

          segments.push({
            text: text.replace(/\n/g, ' ').trim(),
            start: startMs / 1000,
            duration: (endMs - startMs) / 1000,
          });
        }
      }
    }
  } catch (e) {
    console.error('Error parsing Innertube response:', e);
  }

  return segments;
}

/**
 * 複数の動画の字幕を一括取得（クライアントサイド）
 */
export async function fetchTranscriptsClient(
  videoIds: string[],
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  const concurrency = 3; // 同時実行数

  for (let i = 0; i < videoIds.length; i += concurrency) {
    const batch = videoIds.slice(i, i + concurrency);

    const batchResults = await Promise.all(
      batch.map(async (videoId) => {
        const transcript = await fetchTranscriptClient(videoId);
        return { videoId, transcript };
      })
    );

    for (const { videoId, transcript } of batchResults) {
      results.set(videoId, transcript);
    }

    if (onProgress) {
      onProgress(Math.min(i + concurrency, videoIds.length), videoIds.length);
    }

    // レート制限を避けるため少し待機
    if (i + concurrency < videoIds.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}
