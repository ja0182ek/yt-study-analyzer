'use client';

import { useState, useCallback, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

export function FileUploader({ onFileUpload, isLoading }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): boolean => {
    // ファイル形式チェック
    if (!file.name.endsWith('.html') && !file.type.includes('html')) {
      setError('HTMLファイルをアップロードしてください');
      return false;
    }

    // ファイルサイズチェック（10MB）
    if (file.size > 10 * 1024 * 1024) {
      setError('ファイルサイズは10MB以下にしてください');
      return false;
    }

    return true;
  };

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!validateFile(file)) {
        return;
      }

      setUploadedFileName(file.name);

      try {
        await onFileUpload(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ファイルの処理中にエラーが発生しました');
        setUploadedFileName(null);
      }
    },
    [onFileUpload]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8
          transition-colors duration-200 ease-in-out
          ${isDragging
            ? 'border-primary bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 bg-gray-50'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept=".html"
          onChange={handleFileInput}
          disabled={isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
              <p className="text-gray-600">ファイルを解析中...</p>
            </>
          ) : uploadedFileName ? (
            <>
              <CheckCircle className="h-12 w-12 text-primary" />
              <div className="text-center">
                <p className="text-gray-800 font-medium">{uploadedFileName}</p>
                <p className="text-sm text-gray-500 mt-1">
                  別のファイルをアップロードするにはここをクリック
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400" />
              <div className="text-center">
                <p className="text-gray-800 font-medium">
                  watch-history.html をドラッグ&ドロップ
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  またはクリックしてファイルを選択
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mt-4 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 説明 */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">watch-history.html の取得方法:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-blue-700">
              <li>
                <a
                  href="https://takeout.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900"
                >
                  Google Takeout
                </a>
                にアクセス
              </li>
              <li>「YouTube と YouTube Music」を選択</li>
              <li>「すべての YouTube データ」→「履歴」→「視聴履歴」を選択</li>
              <li>形式を「HTML」に設定してエクスポート</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
