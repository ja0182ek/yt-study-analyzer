'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (sessionId) {
      // セッションの検証（オプション）
      setStatus('success');
    } else {
      setStatus('error');
    }
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">処理中...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <span className="text-6xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            エラーが発生しました
          </h1>
          <p className="text-gray-600 mb-6">
            決済処理中にエラーが発生しました。再度お試しください。
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-full transition-colors"
          >
            料金ページに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
        <div className="text-green-500 mb-4">
          <CheckCircle className="h-16 w-16 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          ご登録ありがとうございます！
        </h1>
        <div className="flex items-center justify-center gap-2 text-purple-600 mb-4">
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">プレミアムプラン</span>
        </div>
        <p className="text-gray-600 mb-6">
          プレミアム機能がご利用いただけるようになりました。
          AIによる詳細分析や学習アドバイスをお楽しみください。
        </p>
        <Link
          href="/"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-full transition-colors"
        >
          分析を始める →
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
