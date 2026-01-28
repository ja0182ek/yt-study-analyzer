import { Metadata } from 'next';
import Link from 'next/link';

interface SharePageProps {
  searchParams: Promise<{
    focusPhrase?: string;
    focusPhraseJapanese?: string;
    totalMinutes?: string;
    uniqueWords?: string;
    word1?: string;
    word2?: string;
    word3?: string;
    phrase1?: string;
    phrase2?: string;
    phrase3?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SharePageProps): Promise<Metadata> {
  const params = await searchParams;
  const focusPhrase = params.focusPhrase || "Let's go!";
  const totalMinutes = params.totalMinutes || '0';
  const uniqueWords = params.uniqueWords || '0';

  // OG画像URLを構築
  const ogParams = new URLSearchParams();
  if (params.focusPhrase) ogParams.set('focusPhrase', params.focusPhrase);
  if (params.focusPhraseJapanese) ogParams.set('focusPhraseJapanese', params.focusPhraseJapanese);
  if (params.totalMinutes) ogParams.set('totalMinutes', params.totalMinutes);
  if (params.uniqueWords) ogParams.set('uniqueWords', params.uniqueWords);
  // 単語TOP3
  if (params.word1) ogParams.set('word1', params.word1);
  if (params.word2) ogParams.set('word2', params.word2);
  if (params.word3) ogParams.set('word3', params.word3);
  // フレーズTOP3
  if (params.phrase1) ogParams.set('phrase1', params.phrase1);
  if (params.phrase2) ogParams.set('phrase2', params.phrase2);
  if (params.phrase3) ogParams.set('phrase3', params.phrase3);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const ogImageUrl = `${baseUrl}/api/og?${ogParams.toString()}`;

  return {
    title: '✨ お子様のYouTube視聴レポート ✨',
    description: `今週の強化フレーズ: "${focusPhrase}" | 視聴時間: ${totalMinutes}分 | 触れた単語数: ${uniqueWords}種類`,
    openGraph: {
      title: '✨ お子様のYouTube視聴レポート ✨',
      description: `今週の強化フレーズ: "${focusPhrase}" | 視聴時間: ${totalMinutes}分 | 触れた単語数: ${uniqueWords}種類`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'YouTube学習分析レポート',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '✨ お子様のYouTube視聴レポート ✨',
      description: `今週の強化フレーズ: "${focusPhrase}"`,
      images: [ogImageUrl],
    },
  };
}

export default async function SharePage({ searchParams }: SharePageProps) {
  const params = await searchParams;
  const focusPhrase = params.focusPhrase || "Let's go!";
  const focusPhraseJapanese = params.focusPhraseJapanese || '行こう！';
  const totalMinutes = params.totalMinutes || '0';
  const uniqueWords = params.uniqueWords || '0';

  // 単語TOP3
  const words = [params.word1, params.word2, params.word3].filter(Boolean);
  // フレーズTOP3
  const phrases = [params.phrase1, params.phrase2, params.phrase3].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold text-purple-700 mb-6">
          ✨ お子様のYouTube視聴レポート ✨
        </h1>

        <div className="bg-purple-50 rounded-xl p-6 mb-6">
          <p className="text-sm text-purple-600 mb-2">🌟 今週の強化フレーズ</p>
          <p className="text-3xl font-bold text-purple-800 mb-2">
            &quot;{focusPhrase}&quot;
          </p>
          <p className="text-gray-600">{focusPhraseJapanese}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-blue-600">{totalMinutes}</p>
            <p className="text-sm text-gray-500">総視聴時間（分）</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-purple-600">{uniqueWords}</p>
            <p className="text-sm text-gray-500">触れた単語数</p>
          </div>
        </div>

        {/* 単語TOP3 と フレーズTOP3 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {words.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium mb-2">📚 単語TOP3</p>
              <div className="space-y-1">
                {words.map((word, i) => (
                  <p key={word} className="text-gray-700">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {word}
                  </p>
                ))}
              </div>
            </div>
          )}
          {phrases.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium mb-2">👂 フレーズTOP3</p>
              <div className="space-y-1">
                {phrases.map((phrase, i) => (
                  <p key={phrase} className="text-gray-700 text-sm">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {phrase}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <Link
          href="/"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-full transition-colors"
        >
          自分も分析してみる →
        </Link>
      </div>
    </div>
  );
}
