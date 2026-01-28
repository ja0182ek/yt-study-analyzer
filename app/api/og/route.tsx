import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // パラメータを取得
  const focusPhrase = searchParams.get('focusPhrase') || 'Let\'s go!';
  const focusPhraseJapanese = searchParams.get('focusPhraseJapanese') || '行こう！';
  const totalMinutes = searchParams.get('totalMinutes') || '0';
  const uniqueWords = searchParams.get('uniqueWords') || '0';

  // フレーズTOP3
  const phrase1 = searchParams.get('phrase1') || '';
  const phrase2 = searchParams.get('phrase2') || '';
  const phrase3 = searchParams.get('phrase3') || '';

  // 単語TOP3
  const word1 = searchParams.get('word1') || '';
  const word2 = searchParams.get('word2') || '';
  const word3 = searchParams.get('word3') || '';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          backgroundColor: '#fef3f8',
          backgroundImage: 'linear-gradient(135deg, #fef3f8 0%, #f0f4ff 100%)',
          padding: '30px 40px',
        }}
      >
        {/* タイトル */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#6b21a8' }}>
            ✨ お子様のYouTube視聴レポート ✨
          </span>
        </div>

        {/* 今週の強化フレーズ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px 40px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <span style={{ fontSize: '16px', color: '#9333ea', marginBottom: '6px' }}>
            🌟 今週の強化フレーズ
          </span>
          <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#6b21a8' }}>
            &quot;{focusPhrase}&quot;
          </span>
          <span style={{ fontSize: '18px', color: '#666', marginTop: '4px' }}>
            {focusPhraseJapanese}
          </span>
        </div>

        {/* 実績値 */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#dbeafe',
              borderRadius: '12px',
              padding: '16px 32px',
            }}
          >
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#1d4ed8' }}>
              {totalMinutes}
            </span>
            <span style={{ fontSize: '14px', color: '#3b82f6' }}>
              総視聴時間（分）
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#f3e8ff',
              borderRadius: '12px',
              padding: '16px 32px',
            }}
          >
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c3aed' }}>
              {uniqueWords}
            </span>
            <span style={{ fontSize: '14px', color: '#8b5cf6' }}>
              触れた単語数
            </span>
          </div>
        </div>

        {/* 下部エリア：単語TOP3 と フレーズTOP3 を横並び */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {/* 単語TOP3 */}
          {(word1 || word2 || word3) && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px 24px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                minWidth: '280px',
              }}
            >
              <span style={{ fontSize: '16px', color: '#059669', marginBottom: '10px', fontWeight: 'bold' }}>
                📚 単語TOP3
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                {word1 && (
                  <span style={{ fontSize: '18px', color: '#374151', backgroundColor: '#ecfdf5', padding: '6px 16px', borderRadius: '8px' }}>
                    🥇 {word1}
                  </span>
                )}
                {word2 && (
                  <span style={{ fontSize: '18px', color: '#374151', backgroundColor: '#ecfdf5', padding: '6px 16px', borderRadius: '8px' }}>
                    🥈 {word2}
                  </span>
                )}
                {word3 && (
                  <span style={{ fontSize: '18px', color: '#374151', backgroundColor: '#ecfdf5', padding: '6px 16px', borderRadius: '8px' }}>
                    🥉 {word3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* フレーズTOP3 */}
          {(phrase1 || phrase2 || phrase3) && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px 24px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                minWidth: '280px',
              }}
            >
              <span style={{ fontSize: '16px', color: '#6b7280', marginBottom: '10px', fontWeight: 'bold' }}>
                👂 フレーズTOP3
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                {phrase1 && (
                  <span style={{ fontSize: '18px', color: '#374151', backgroundColor: '#f3f4f6', padding: '6px 16px', borderRadius: '8px' }}>
                    🥇 {phrase1}
                  </span>
                )}
                {phrase2 && (
                  <span style={{ fontSize: '18px', color: '#374151', backgroundColor: '#f3f4f6', padding: '6px 16px', borderRadius: '8px' }}>
                    🥈 {phrase2}
                  </span>
                )}
                {phrase3 && (
                  <span style={{ fontSize: '18px', color: '#374151', backgroundColor: '#f3f4f6', padding: '6px 16px', borderRadius: '8px' }}>
                    🥉 {phrase3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
