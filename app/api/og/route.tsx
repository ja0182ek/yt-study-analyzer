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
  const phrase1 = searchParams.get('phrase1') || '';
  const phrase2 = searchParams.get('phrase2') || '';
  const phrase3 = searchParams.get('phrase3') || '';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fef3f8',
          backgroundImage: 'linear-gradient(135deg, #fef3f8 0%, #f0f4ff 100%)',
          padding: '40px',
        }}
      >
        {/* タイトル */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '30px',
          }}
        >
          <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#6b21a8' }}>
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
            borderRadius: '20px',
            padding: '30px 50px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <span style={{ fontSize: '20px', color: '#9333ea', marginBottom: '10px' }}>
            🌟 今週の強化フレーズ
          </span>
          <span style={{ fontSize: '42px', fontWeight: 'bold', color: '#6b21a8' }}>
            &quot;{focusPhrase}&quot;
          </span>
          <span style={{ fontSize: '22px', color: '#666', marginTop: '8px' }}>
            {focusPhraseJapanese}
          </span>
        </div>

        {/* 実績値 */}
        <div
          style={{
            display: 'flex',
            gap: '30px',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#dbeafe',
              borderRadius: '16px',
              padding: '20px 40px',
            }}
          >
            <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#1d4ed8' }}>
              {totalMinutes}
            </span>
            <span style={{ fontSize: '16px', color: '#3b82f6' }}>
              総視聴時間（分）
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#f3e8ff',
              borderRadius: '16px',
              padding: '20px 40px',
            }}
          >
            <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#7c3aed' }}>
              {uniqueWords}
            </span>
            <span style={{ fontSize: '16px', color: '#8b5cf6' }}>
              触れた単語数
            </span>
          </div>
        </div>

        {/* 聞いたフレーズTOP3 */}
        {(phrase1 || phrase2 || phrase3) && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px 40px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}
          >
            <span style={{ fontSize: '18px', color: '#6b7280', marginBottom: '12px' }}>
              👂 聞いたフレーズTOP3
            </span>
            <div style={{ display: 'flex', gap: '20px' }}>
              {phrase1 && (
                <span style={{ fontSize: '18px', color: '#374151', backgroundColor: '#f3f4f6', padding: '8px 16px', borderRadius: '8px' }}>
                  🥇 {phrase1}
                </span>
              )}
              {phrase2 && (
                <span style={{ fontSize: '18px', color: '#374151', backgroundColor: '#f3f4f6', padding: '8px 16px', borderRadius: '8px' }}>
                  🥈 {phrase2}
                </span>
              )}
              {phrase3 && (
                <span style={{ fontSize: '18px', color: '#374151', backgroundColor: '#f3f4f6', padding: '8px 16px', borderRadius: '8px' }}>
                  🥉 {phrase3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
