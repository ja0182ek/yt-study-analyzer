'use client';

import { useState, useCallback } from 'react';
import { FileUploader } from '@/components/dashboard/FileUploader';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { VocabPieChart } from '@/components/dashboard/VocabPieChart';
import { AnalysisReport } from '@/components/dashboard/AnalysisReport';
import { Card } from '@/components/ui/Card';
import { analyzeTranscripts } from '@/lib/transcriptAnalyzer';
import {
  WatchHistoryEntry,
  WeeklyChartData,
  VideoInfo,
  AnalysisReport as AnalysisReportType,
  WeeklyAdvice,
} from '@/types';
import { BarChart3, FileText, AlertTriangle, Clock, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<WatchHistoryEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyChartData[]>([]);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReportType | null>(null);
  const [stats, setStats] = useState<{
    totalVideos: number;
    totalMinutes: number;
    analyzedVideos: number;
    uniqueWords: number;
  } | null>(null);
  const [weeklyAdvice, setWeeklyAdvice] = useState<WeeklyAdvice | null>(null);

  // 直近7日間の日付リストを生成
  const getLast7Days = (): string[] => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  // 日付を曜日に変換
  const formatDayOfWeek = (dateStr: string): string => {
    const date = new Date(dateStr);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return days[date.getDay()];
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setLoadingStatus('ファイルを解析中...');

    try {
      // Step 1: HTMLをパース
      const formData = new FormData();
      formData.append('file', file);

      const parseResponse = await fetch('/api/parse-history', {
        method: 'POST',
        body: formData,
      });

      const parseResult = await parseResponse.json();

      if (!parseResult.success) {
        throw new Error(parseResult.error || 'Failed to parse history');
      }

      const parsedEntries: WatchHistoryEntry[] = parseResult.data.entries.map(
        (e: { videoId: string; title: string; channelName: string; watchedAt: string }) => ({
          ...e,
          watchedAt: new Date(e.watchedAt),
        })
      );

      setEntries(parsedEntries);

      // 直近7日間のエントリをフィルタリング
      const last7Days = getLast7Days();
      const cutoffDate = new Date(last7Days[0]);
      cutoffDate.setHours(0, 0, 0, 0);

      const recentEntries = parsedEntries.filter(
        (entry) => entry.watchedAt >= cutoffDate
      );

      // ユニークな動画IDを取得
      const uniqueVideoIds = [...new Set(recentEntries.map((e) => e.videoId))];

      setLoadingStatus(`動画情報を取得中... (${uniqueVideoIds.length}件)`);

      // Step 2: 動画の長さを取得
      let videoInfoMap = new Map<string, VideoInfo>();

      if (uniqueVideoIds.length > 0) {
        try {
          const durationResponse = await fetch('/api/video-duration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoIds: uniqueVideoIds.slice(0, 200) }),
          });

          const durationResult = await durationResponse.json();

          if (durationResult.success && durationResult.data) {
            durationResult.data.forEach((info: VideoInfo) => {
              videoInfoMap.set(info.videoId, info);
            });
          }
        } catch (apiError) {
          console.warn('Failed to fetch video durations, using estimates:', apiError);
          // API失敗時は推定値を使用（1動画あたり平均5分と仮定）
        }
      }

      // 日別の視聴時間を計算
      const dailyStats = new Map<string, { minutes: number; videos: number }>();

      // 初期化
      last7Days.forEach((day) => {
        dailyStats.set(day, { minutes: 0, videos: 0 });
      });

      // エントリを日別に集計
      recentEntries.forEach((entry) => {
        const dateKey = entry.watchedAt.toISOString().split('T')[0];
        const existing = dailyStats.get(dateKey);

        if (existing) {
          const videoInfo = videoInfoMap.get(entry.videoId);
          const durationMinutes = videoInfo
            ? Math.round(videoInfo.duration / 60)
            : 5; // デフォルト5分

          existing.minutes += durationMinutes;
          existing.videos += 1;
          dailyStats.set(dateKey, existing);
        }
      });

      // グラフ用データに変換
      const chartData: WeeklyChartData[] = last7Days.map((day) => {
        const stats = dailyStats.get(day) || { minutes: 0, videos: 0 };
        return {
          day: formatDayOfWeek(day),
          minutes: stats.minutes,
          videos: stats.videos,
        };
      });

      setWeeklyData(chartData);

      // 統計情報
      const totalMinutes = chartData.reduce((sum, d) => sum + d.minutes, 0);
      const totalVideos = chartData.reduce((sum, d) => sum + d.videos, 0);

      // Step 3: 字幕を取得して分析（Invidious API経由）
      setLoadingStatus('字幕を取得中...');

      const transcriptsToAnalyze: string[] = [];
      const videoIdsForTranscript = uniqueVideoIds.slice(0, 20);

      if (videoIdsForTranscript.length > 0) {
        try {
          const transcriptResponse = await fetch('/api/transcript', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoIds: videoIdsForTranscript }),
          });

          const transcriptResult = await transcriptResponse.json();

          if (transcriptResult.success && transcriptResult.data) {
            transcriptResult.data.forEach(
              (item: { videoId: string; transcript: string | null }) => {
                if (item.transcript) {
                  transcriptsToAnalyze.push(item.transcript);
                }
              }
            );
          }

          console.log(`Fetched ${transcriptsToAnalyze.length} transcripts from ${videoIdsForTranscript.length} videos`);
        } catch (transcriptError) {
          console.warn('Failed to fetch transcripts:', transcriptError);
        }
      }

      // 字幕が取得できなかった場合、動画タイトルをフォールバックとして使用
      if (transcriptsToAnalyze.length === 0) {
        console.log('No transcripts available, using video titles as fallback');
        const titleTexts = parsedEntries
          .slice(0, 100)
          .map((entry) => entry.title)
          .join(' ');
        transcriptsToAnalyze.push(titleTexts);
      }

      setLoadingStatus('字幕を分析中...');

      // 字幕分析（単語分析用）
      const report = analyzeTranscripts(transcriptsToAnalyze);

      // Step 4: AIによるフレーズ分析（動画タイトルベース）
      setLoadingStatus('フレーズを分析中...');

      try {
        // 動画タイトルを収集（最大100件）
        const videoTitles = parsedEntries
          .slice(0, 100)
          .map((entry) => entry.title);

        const phraseResponse = await fetch('/api/analyze-phrases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titles: videoTitles }),
        });

        const phraseResult = await phraseResponse.json();

        if (phraseResult.success && phraseResult.data) {
          // AIで生成されたフレーズでレポートを更新
          report.topPhrases = phraseResult.data.slice(0, 5).map(
            (p: {
              phrase: string;
              japanese: string;
              background: string;
              category: string;
              categoryEmoji: string;
            }) => ({
              phrase: p.phrase,
              count: 1, // AI分析では頻度カウントなし
              category: p.category,
              categoryEmoji: p.categoryEmoji,
              meaning: p.japanese,
              scene: p.background,
            })
          );
        }
      } catch (phraseError) {
        console.warn('Failed to analyze phrases with AI:', phraseError);
        // フォールバック: デフォルトフレーズを使用
      }

      // Step 5: Gemini AIによる「今週の強化フレーズ」生成
      setLoadingStatus('学習アドバイスを生成中...');

      try {
        // 動画タイトルとチャンネル名、頻出単語、聞いたフレーズを収集
        const videoTitles = parsedEntries.slice(0, 50).map((entry) => entry.title);
        const channelNames = parsedEntries.slice(0, 50).map((entry) => entry.channelName);
        const topWordsList = report.topWords.slice(0, 20).map((w) => w.word);

        // 聞いたフレーズTOP5をGeminiに渡す
        const topPhrasesList = report.topPhrases.slice(0, 5).map((p) => ({
          phrase: p.phrase,
          meaning: p.meaning,
        }));

        const adviceResponse = await fetch('/api/generate-advice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titles: videoTitles,
            channelNames: channelNames,
            topWords: topWordsList,
            topPhrases: topPhrasesList,
          }),
        });

        const adviceResult = await adviceResponse.json();

        if (adviceResult.success && adviceResult.data) {
          setWeeklyAdvice(adviceResult.data);
        }
      } catch (adviceError) {
        console.warn('Failed to generate advice with Gemini:', adviceError);
        // フォールバックはAPI側で処理される
      }

      setAnalysisReport(report);

      setStats({
        totalVideos,
        totalMinutes,
        analyzedVideos: transcriptsToAnalyze.length,
        uniqueWords: report.uniqueWords,
      });

      setLoadingStatus('');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoadingStatus('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="container-app section-spacing">
      {/* ヒーローセクション */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          YouTube学習分析
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Google Takeoutからエクスポートした視聴履歴をアップロードして、
          お子さまの英語学習状況を分析しましょう。
        </p>
      </div>

      {/* ファイルアップロード */}
      <Card className="mb-8">
        <FileUploader onFileUpload={handleFileUpload} isLoading={isLoading} />
        {loadingStatus && (
          <p className="text-center text-primary mt-4">{loadingStatus}</p>
        )}
      </Card>

      {/* エラー表示 */}
      {error && (
        <div className="mb-8 flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* 統計サマリー */}
      {stats && (
        <div className="flex justify-center gap-4 mb-8">
          <Card className="text-center card-hover px-8">
            <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-800">{stats.totalMinutes}</p>
            <p className="text-sm text-gray-500">総視聴時間（分）</p>
          </Card>
          <Card className="text-center card-hover px-8">
            <BookOpen className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-800">{stats.uniqueWords.toLocaleString()}</p>
            <p className="text-sm text-gray-500">触れた単語数（種類）</p>
          </Card>
        </div>
      )}

      {/* グラフセクション */}
      {weeklyData.length > 0 && (
        <div className="mb-8">
          {/* 週間視聴時間グラフ */}
          <Card
            title="直近7日間の視聴時間"
            subtitle="日別の視聴時間（分）"
            className="card-hover"
          >
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-sm text-gray-500">
                棒グラフは各日の視聴時間を示しています
              </span>
            </div>
            <WeeklyChart data={weeklyData} />
          </Card>
        </div>
      )}

      {/* 分析レポート */}
      {analysisReport && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>詳細分析レポート</span>
          </h2>
          <AnalysisReport report={analysisReport} weeklyAdvice={weeklyAdvice} stats={stats ? { totalMinutes: stats.totalMinutes, uniqueWords: stats.uniqueWords } : undefined} />
        </div>
      )}

      {/* 初期状態の説明 */}
      {!stats && !isLoading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            視聴履歴をアップロードして開始
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Google Takeoutからダウンロードした watch-history.html
            ファイルをアップロードすると、分析が始まります。
          </p>
        </div>
      )}
    </div>
  );
}
