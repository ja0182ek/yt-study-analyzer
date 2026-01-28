'use client';

import Link from 'next/link';
import { BookOpen, Home } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-800">
              YouTube学習分析
            </span>
          </Link>

          {/* ナビゲーション */}
          <nav className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              ダッシュボード
            </Link>
            <a
              href="#"
              className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium"
              title="HPへ戻る"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">HPへ戻る</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
