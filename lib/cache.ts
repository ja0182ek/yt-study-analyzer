'use client';

import { AnalysisReport as AnalysisReportType, WeeklyAdvice } from '@/types';

const CACHE_VERSION = 'v1';
const TRANSCRIPT_CACHE_KEY = `yt-analyzer-transcripts-${CACHE_VERSION}`;
const ANALYSIS_CACHE_KEY = `yt-analyzer-analysis-${CACHE_VERSION}`;
const CACHE_EXPIRY_DAYS = 7; // キャッシュの有効期限（日数）

interface TranscriptCache {
  [videoId: string]: {
    transcript: string;
    cachedAt: number;
  };
}

interface AnalysisCache {
  hash: string; // 動画IDリストのハッシュ
  report: AnalysisReportType;
  weeklyAdvice: WeeklyAdvice | null;
  cachedAt: number;
}

/**
 * 文字列のシンプルなハッシュを生成
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

/**
 * キャッシュが有効期限内かチェック
 */
function isExpired(cachedAt: number): boolean {
  const now = Date.now();
  const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return (now - cachedAt) > expiryMs;
}

/**
 * 字幕キャッシュを取得
 */
export function getTranscriptCache(): TranscriptCache {
  if (typeof window === 'undefined') return {};

  try {
    const cached = localStorage.getItem(TRANSCRIPT_CACHE_KEY);
    if (!cached) return {};

    const data: TranscriptCache = JSON.parse(cached);

    // 期限切れのエントリを削除
    const cleaned: TranscriptCache = {};
    for (const [videoId, entry] of Object.entries(data)) {
      if (!isExpired(entry.cachedAt)) {
        cleaned[videoId] = entry;
      }
    }

    return cleaned;
  } catch {
    return {};
  }
}

/**
 * 字幕をキャッシュに保存
 */
export function saveTranscriptToCache(videoId: string, transcript: string): void {
  if (typeof window === 'undefined') return;

  try {
    const cache = getTranscriptCache();
    cache[videoId] = {
      transcript,
      cachedAt: Date.now(),
    };

    // キャッシュサイズを制限（最大500件）
    const entries = Object.entries(cache);
    if (entries.length > 500) {
      // 古いものから削除
      entries.sort((a, b) => a[1].cachedAt - b[1].cachedAt);
      const toKeep = entries.slice(-500);
      const newCache: TranscriptCache = {};
      for (const [id, entry] of toKeep) {
        newCache[id] = entry;
      }
      localStorage.setItem(TRANSCRIPT_CACHE_KEY, JSON.stringify(newCache));
    } else {
      localStorage.setItem(TRANSCRIPT_CACHE_KEY, JSON.stringify(cache));
    }
  } catch (e) {
    console.warn('Failed to save transcript to cache:', e);
  }
}

/**
 * キャッシュから字幕を取得
 */
export function getTranscriptFromCache(videoId: string): string | null {
  const cache = getTranscriptCache();
  const entry = cache[videoId];

  if (entry && !isExpired(entry.cachedAt)) {
    return entry.transcript;
  }

  return null;
}

/**
 * 複数の動画IDからキャッシュ済みとキャッシュなしを分ける
 */
export function splitByCache(videoIds: string[]): {
  cached: Map<string, string>;
  uncached: string[];
} {
  const cache = getTranscriptCache();
  const cached = new Map<string, string>();
  const uncached: string[] = [];

  for (const videoId of videoIds) {
    const entry = cache[videoId];
    if (entry && !isExpired(entry.cachedAt)) {
      cached.set(videoId, entry.transcript);
    } else {
      uncached.push(videoId);
    }
  }

  return { cached, uncached };
}

/**
 * 分析結果をキャッシュに保存
 */
export function saveAnalysisToCache(
  videoIds: string[],
  report: AnalysisReportType,
  weeklyAdvice: WeeklyAdvice | null
): void {
  if (typeof window === 'undefined') return;

  try {
    const hash = simpleHash(videoIds.sort().join(','));
    const data: AnalysisCache = {
      hash,
      report,
      weeklyAdvice,
      cachedAt: Date.now(),
    };
    localStorage.setItem(ANALYSIS_CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save analysis to cache:', e);
  }
}

/**
 * キャッシュから分析結果を取得
 */
export function getAnalysisFromCache(videoIds: string[]): {
  report: AnalysisReportType;
  weeklyAdvice: WeeklyAdvice | null;
} | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(ANALYSIS_CACHE_KEY);
    if (!cached) return null;

    const data: AnalysisCache = JSON.parse(cached);
    const hash = simpleHash(videoIds.sort().join(','));

    // ハッシュが一致し、期限内であればキャッシュを返す
    if (data.hash === hash && !isExpired(data.cachedAt)) {
      return {
        report: data.report,
        weeklyAdvice: data.weeklyAdvice,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * キャッシュをクリア
 */
export function clearCache(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(TRANSCRIPT_CACHE_KEY);
    localStorage.removeItem(ANALYSIS_CACHE_KEY);
  } catch (e) {
    console.warn('Failed to clear cache:', e);
  }
}

/**
 * キャッシュの統計を取得
 */
export function getCacheStats(): {
  transcriptCount: number;
  hasAnalysisCache: boolean;
} {
  if (typeof window === 'undefined') {
    return { transcriptCount: 0, hasAnalysisCache: false };
  }

  const transcriptCache = getTranscriptCache();
  const analysisCache = localStorage.getItem(ANALYSIS_CACHE_KEY);

  return {
    transcriptCount: Object.keys(transcriptCache).length,
    hasAnalysisCache: !!analysisCache,
  };
}
