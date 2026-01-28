'use client';

import { BookOpen } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* ロゴとコピーライト */}
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-sm text-gray-600">
              &copy; {currentYear} YouTube学習分析. All rights reserved.
            </span>
          </div>

          {/* リンク */}
          <div className="flex items-center space-x-6">
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-primary transition-colors"
            >
              プライバシーポリシー
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-primary transition-colors"
            >
              利用規約
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-primary transition-colors"
            >
              お問い合わせ
            </a>
          </div>
        </div>

        {/* 注意書き */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            このツールはGoogle Takeoutからエクスポートされた視聴履歴を分析します。
            データはブラウザ内で処理され、サーバーには保存されません（YouTube API経由の動画情報取得を除く）。
          </p>
        </div>
      </div>
    </footer>
  );
}
