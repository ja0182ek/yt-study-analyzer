// 視聴履歴の動画エントリ
export interface WatchHistoryEntry {
  videoId: string;
  title: string;
  channelName: string;
  watchedAt: Date;
}

// パース結果
export interface ParsedHistory {
  entries: WatchHistoryEntry[];
  totalCount: number;
}

// 動画情報（YouTube API から取得）
export interface VideoInfo {
  videoId: string;
  title: string;
  duration: number; // 秒単位
  channelTitle: string;
}

// 日別視聴時間
export interface DailyWatchTime {
  date: string; // YYYY-MM-DD
  totalSeconds: number;
  videoCount: number;
}

// 語彙レベル
export type VocabLevel = 'Pre-K' | 'K' | '1st' | '2nd' | '3rd' | 'Noun' | 'Other';

// 語彙レベル分布
export interface VocabDistribution {
  level: VocabLevel;
  count: number;
  percentage: number;
}

// 単語頻度
export interface WordFrequency {
  word: string;
  count: number;
  level: VocabLevel;
  category?: string;
  categoryEmoji?: string;
}

// カテゴリ別単語
export type WordCategory = 'colors' | 'animals' | 'food' | 'bodyParts' | 'family' | 'princess' | 'vehicles' | 'nature' | 'toys' | 'feelings' | 'actions' | 'size';

export interface CategoryWords {
  category: WordCategory;
  label: string;
  emoji: string;
  words: WordFrequency[];
}

// フレーズ頻度
export interface PhraseFrequency {
  phrase: string;
  count: number;
  category?: string;
  categoryEmoji?: string;
  meaning?: string;
  scene?: string;
}

// 分析レポート
export interface AnalysisReport {
  topWords: WordFrequency[];
  categoryWords: CategoryWords[];
  topPhrases: PhraseFrequency[];
  vocabDistribution: VocabDistribution[];
  totalWords: number;
  uniqueWords: number;
  advice: string[];
}

// API レスポンス型
export interface ParseHistoryResponse {
  success: boolean;
  data?: ParsedHistory;
  error?: string;
}

export interface VideoDurationResponse {
  success: boolean;
  data?: VideoInfo[];
  error?: string;
}

export interface TranscriptResponse {
  success: boolean;
  data?: {
    videoId: string;
    transcript: string;
  };
  error?: string;
}

// 週間チャート用データ
export interface WeeklyChartData {
  day: string;
  minutes: number;
  videos: number;
}

// 円グラフ用データ
export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

// 今週の強化フレーズ（Gemini AI生成）
export interface WeeklyAdvice {
  focusPhrase: string;        // 今週の強化フレーズ（英語）
  focusPhraseJapanese: string; // 日本語訳
  interestAnalysis: string;   // お子様の興味分析
  conversationTip: string;    // 具体的な語りかけ案
}
