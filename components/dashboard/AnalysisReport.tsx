'use client';

import { BookOpen, MessageSquare, Sparkles, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { AnalysisReport as AnalysisReportType, WeeklyAdvice } from '@/types';

interface AnalysisReportProps {
  report: AnalysisReportType;
  weeklyAdvice: WeeklyAdvice | null;
  stats?: {
    totalMinutes: number;
    uniqueWords: number;
  };
}

export function AnalysisReport({ report, weeklyAdvice, stats }: AnalysisReportProps) {
  // Twitter共有用のテキストを生成
  const generateShareText = () => {
    return encodeURIComponent(
      `ただ動画を見てるだけだと思ってたのに、こんなに英語を浴びてたなんて…！😭\n\n` +
      `#YouTube学習分析 #おうち英語 #子供英語`
    );
  };

  // 共有ページURLを生成
  const generateSharePageUrl = () => {
    if (typeof window === 'undefined') return '';

    const params = new URLSearchParams();
    if (weeklyAdvice) {
      params.set('focusPhrase', weeklyAdvice.focusPhrase);
      params.set('focusPhraseJapanese', weeklyAdvice.focusPhraseJapanese);
    }
    if (stats) {
      params.set('totalMinutes', stats.totalMinutes.toString());
      params.set('uniqueWords', stats.uniqueWords.toString());
    }
    // 聞いたフレーズTOP3
    if (report.topPhrases[0]) params.set('phrase1', report.topPhrases[0].phrase);
    if (report.topPhrases[1]) params.set('phrase2', report.topPhrases[1].phrase);
    if (report.topPhrases[2]) params.set('phrase3', report.topPhrases[2].phrase);

    return `${window.location.origin}/share?${params.toString()}`;
  };

  const handleTwitterShare = () => {
    const text = generateShareText();
    const sharePageUrl = generateSharePageUrl();
    const shareUrl = encodeURIComponent(sharePageUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`,
      '_blank',
      'width=550,height=420'
    );
  };

  return (
    <div className="space-y-6">
      {/* 今週の強化フレーズ（最上部に大きく表示） */}
      {weeklyAdvice && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-3">
            <Sparkles className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-gray-600 text-sm mb-2">
            今週、お子様が最も耳にした魔法の言葉は
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-purple-700 mb-2">
            &quot;{weeklyAdvice.focusPhrase}&quot;
          </p>
          <p className="text-gray-500 text-sm mb-4">
            {weeklyAdvice.focusPhraseJapanese}
          </p>

          {/* 親御さんへのヒント */}
          <div className="mt-6 bg-white rounded-lg p-4 text-left max-w-xl mx-auto">
            <p className="text-purple-600 font-medium mb-2 text-sm">
              💡 親御さんへのヒント
            </p>
            <p className="text-gray-700 text-sm mb-3">
              🎯 {weeklyAdvice.interestAnalysis}
            </p>
            <p className="text-gray-600 text-sm">
              💬 {weeklyAdvice.conversationTip}
            </p>
          </div>

          {/* Twitter共有ボタン */}
          <button
            onClick={handleTwitterShare}
            className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-sm font-medium transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>結果をシェア</span>
          </button>
        </div>
      )}

      {/* 統計サマリー */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-primary">
            {report.totalWords.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">総単語数</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">
            {report.uniqueWords.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">ユニーク単語数</p>
        </div>
      </div>

      {/* 頻出単語 TOP10 */}
      <Card title="頻出単語 TOP10" subtitle="字幕に最も多く登場した単語">
        <div className="flex items-start space-x-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="text-sm text-gray-600">
            お子さまがよく聞いている英単語です
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-2 text-left text-sm font-semibold text-gray-600 w-12">順位</th>
                <th className="py-2 px-2 text-left text-sm font-semibold text-gray-600">単語</th>
                <th className="py-2 px-2 text-left text-sm font-semibold text-gray-600">カテゴリ</th>
                <th className="py-2 px-2 text-right text-sm font-semibold text-gray-600">回数</th>
              </tr>
            </thead>
            <tbody>
              {report.topWords.map((word, index) => (
                <tr
                  key={word.word}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-2 text-lg font-bold text-gray-400">{index + 1}</td>
                  <td className="py-3 px-2 text-gray-800 font-medium">{word.word}</td>
                  <td className="py-3 px-2 text-gray-700 text-sm">
                    {word.category ? (
                      <span>{word.categoryEmoji} {word.category}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-500 font-mono text-sm">
                    {word.count.toLocaleString()}回
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 聞いたフレーズ TOP5 👂 */}
      <Card title="聞いたフレーズ TOP5 👂" subtitle="動画でよく流れていた表現">
        <div className="flex items-start space-x-2 mb-4">
          <MessageSquare className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <p className="text-sm text-gray-600">
            お子さまが実際によく耳にしていたフレーズです
          </p>
        </div>
        {report.topPhrases.length > 0 ? (
          <div className="space-y-4">
            {report.topPhrases.map((phrase, index) => (
              <div
                key={phrase.phrase}
                className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </span>
                  <span className="text-gray-800 font-bold text-lg">
                    &quot;{phrase.phrase}&quot;
                  </span>
                </div>
                <div className="ml-10 space-y-2">
                  {phrase.category && (
                    <div className="text-gray-700 text-sm">
                      {phrase.categoryEmoji} {phrase.category}
                    </div>
                  )}
                  {phrase.meaning && (
                    <div className="text-gray-800 text-sm">
                      <span className="font-medium text-gray-600">日本語訳：</span>
                      {phrase.meaning}
                    </div>
                  )}
                  {phrase.scene && (
                    <div className="text-gray-500 text-sm">
                      <span className="font-medium">背景：</span>
                      {phrase.scene}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            フレーズデータがありません
          </p>
        )}

        {/* Twitter共有ボタン（フレーズセクション下部） */}
        <div className="mt-4 text-center">
          <button
            onClick={handleTwitterShare}
            className="inline-flex items-center space-x-2 px-4 py-2 border border-sky-500 text-sky-600 hover:bg-sky-50 rounded-full text-sm font-medium transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>聞いたフレーズをシェア</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
