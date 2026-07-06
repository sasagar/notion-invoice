"use client";

import { CgSpinnerTwo } from "react-icons/cg";
import { SlCloudDownload } from "react-icons/sl";
import { usePdfDownload } from "@/lib/hooks/use-pdf-download";
import type { Account, Customer } from "@/lib/notion/types";

function fileNameFor(
  kind: "請求書" | "見積書",
  number: string,
  customer: Customer | null,
  account: Account | null,
) {
  const cust = `${customer?.companyName ?? ""}${customer?.honorific ?? ""}`;
  return `${cust}_${kind}_${account?.slug ?? ""}_${number}.pdf`;
}

function DownloadButton({
  apiPath,
  fileName,
  label,
  variant,
}: {
  apiPath: string;
  fileName: string;
  label: string;
  variant: "solid" | "outline";
}) {
  const { inProgress, step, progress, downloadPdf } = usePdfDownload({
    apiPath,
    fileName,
  });
  const palette =
    variant === "solid"
      ? "border-kent-blue-500 bg-kent-blue-500 text-white hover:bg-kent-blue-600 disabled:bg-kent-blue-800/70"
      : "border-kent-blue-400 bg-transparent text-kent-blue-600 hover:bg-kent-blue-50 disabled:opacity-60 dark:text-kent-blue-200 dark:hover:bg-kent-blue-950/40";
  return (
    <button
      type="button"
      onClick={downloadPdf}
      disabled={inProgress}
      className={`flex w-fit items-center gap-2 rounded-sm border px-3 py-1.5 text-sm transition disabled:cursor-progress ${palette}`}
    >
      <SlCloudDownload aria-hidden /> {label}
      {step === "generating" && (
        <>
          <CgSpinnerTwo className="animate-spin" aria-hidden />
          <span className="text-xs">生成中…</span>
        </>
      )}
      {step === "downloading" && (
        <>
          <CgSpinnerTwo className="animate-spin" aria-hidden />
          <span className="font-mono text-xs tabular-nums">{progress}%</span>
        </>
      )}
      {step === "complete" && <span className="text-xs">完了!</span>}
    </button>
  );
}

export function PdfDownload({
  number,
  customer,
  account,
}: {
  number: string;
  customer: Customer | null;
  account: Account | null;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <DownloadButton
        apiPath={`/api/print/invoice/${number}`}
        fileName={fileNameFor("請求書", number, customer, account)}
        label="請求書ダウンロード"
        variant="solid"
      />
      <DownloadButton
        apiPath={`/api/print/estimate/${number}`}
        fileName={fileNameFor("見積書", number, customer, account)}
        label="見積書ダウンロード"
        variant="outline"
      />
    </div>
  );
}
