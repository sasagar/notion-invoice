'use client';

import { useState, useCallback } from 'react';

/**
 * PDFダウンロード用のカスタムフック
 * @param {Object} options - オプション
 * @param {string} options.apiPath - PDF取得APIのパス
 * @param {string} options.fileName - ダウンロードファイル名
 * @returns {Object} { inProgress, downloadPdf }
 */
const usePdfDownload = ({ apiPath, fileName }) => {
  // ステップ: 'idle' | 'generating' | 'downloading' | 'complete'
  const [step, setStep] = useState('idle');
  const [progress, setProgress] = useState(0);

  const inProgress = step !== 'idle';

  const downloadPdf = useCallback(() => {
    const xhr = new XMLHttpRequest();

    // リクエスト開始 → 生成中
    xhr.addEventListener('loadstart', () => {
      setStep('generating');
      setProgress(0);
    });

    // レスポンスヘッダー受信 → ダウンロード開始
    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
        setStep('downloading');
      }
    });

    // ダウンロード進捗
    xhr.addEventListener('progress', e => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setProgress(percent);
      }
    });

    // 完了
    xhr.addEventListener('loadend', () => {
      setStep('idle');
      setProgress(0);
    });

    xhr.open('GET', apiPath, true);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        setStep('complete');
        const blob = new Blob([xhr.response], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    };
    xhr.send();
  }, [apiPath, fileName]);

  return { inProgress, step, progress, downloadPdf };
};

export default usePdfDownload;
