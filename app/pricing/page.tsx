'use client';

import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: '無料プラン',
    price: '¥0',
    period: '',
    description: '基本的な分析機能をお試しください',
    features: [
      '直近7日間の視聴分析',
      '基本的な単語カウント',
      '聞いたフレーズTOP5',
      'X共有機能',
    ],
    priceId: null,
    buttonText: '現在のプラン',
    highlighted: false,
  },
  {
    name: 'プレミアムプラン',
    price: '¥980',
    period: '/月',
    description: 'AI分析で学習効果を最大化',
    features: [
      '無制限の視聴分析',
      'Gemini AIによる詳細分析',
      '今週の強化フレーズ提案',
      '親向け語りかけアドバイス',
      'テーマ別語彙分析',
      '習得フレーズレポート',
      '学習進捗トラッキング',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_xxxxx',
    buttonText: 'プレミアムに登録',
    highlighted: true,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (priceId: string | null) => {
    if (!priceId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            料金プラン
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            お子様のYouTube視聴からの英語学習効果を最大限に引き出すプランをお選びください
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl p-8 shadow-lg ${
                plan.highlighted
                  ? 'ring-2 ring-purple-500 relative'
                  : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    おすすめ
                  </span>
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {plan.name}
              </h2>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-800">
                  {plan.price}
                </span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
              <p className="text-gray-600 mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.priceId)}
                disabled={!plan.priceId || loading}
                className={`w-full py-3 px-6 rounded-full font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-100 text-gray-600 cursor-default'
                } ${loading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {loading ? '処理中...' : plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-purple-600 hover:text-purple-700">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
