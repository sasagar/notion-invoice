"use client";

import { useCallback, useState } from "react";

export type PdfStep = "idle" | "generating" | "downloading" | "complete";

/** PDF を XHR で取得し進捗表示付きでダウンロードするフック。 */
export function usePdfDownload({ apiPath, fileName }: { apiPath: string; fileName: string }) {
  const [step, setStep] = useState<PdfStep>("idle");
  const [progress, setProgress] = useState(0);
  const inProgress = step !== "idle";

  const downloadPdf = useCallback(() => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("loadstart", () => {
      setStep("generating");
      setProgress(0);
    });
    xhr.addEventListener("readystatechange", () => {
      if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
        setStep("downloading");
      }
    });
    xhr.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener("loadend", () => {
      setStep("idle");
      setProgress(0);
    });
    xhr.open("GET", apiPath, true);
    xhr.responseType = "blob";
    xhr.onload = () => {
      if (xhr.status === 200) {
        setStep("complete");
        const blob = new Blob([xhr.response], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    };
    xhr.send();
  }, [apiPath, fileName]);

  return { inProgress, step, progress, downloadPdf };
}
