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
  const [inProgress, setInProgress] = useState(false);

  const handleEvent = useCallback(e => {
    if (e.type === 'loadstart') {
      setInProgress(true);
    } else if (e.type === 'loadend') {
      setInProgress(false);
    }
  }, []);

  const addListener = useCallback(
    xhr => {
      xhr.addEventListener('loadstart', handleEvent);
      xhr.addEventListener('loadend', handleEvent);
    },
    [handleEvent],
  );

  const downloadPdf = useCallback(() => {
    const xhr = new XMLHttpRequest();
    addListener(xhr);
    xhr.open('GET', apiPath, true);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
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
  }, [apiPath, fileName, addListener]);

  return { inProgress, downloadPdf };
};

export default usePdfDownload;
