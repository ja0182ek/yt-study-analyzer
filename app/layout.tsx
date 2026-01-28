import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'YouTube学習分析 - お子さまの英語学習を可視化',
  description:
    'YouTube視聴履歴から英語学習の進捗を分析。Dolch Words（基本語彙）の習得状況、視聴時間の推移、頻出単語・フレーズを可視化します。',
  keywords: ['YouTube', '英語学習', '子供', 'Dolch Words', '視聴履歴', '分析'],
  authors: [{ name: 'YouTube学習分析' }],
  openGraph: {
    title: 'YouTube学習分析',
    description: 'お子さまのYouTube英語学習を可視化',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
