/**
 * 請求書/見積書 PDF の描画（1 ページに収まる場合は収める）。
 * 通常版が 2 ページ以上になったときだけ上下余白を詰めた版でも描き、ページ数が減るならそちらを採る。
 * 末尾の帯やその余白だけが次ページに落ちるような、わずかなはみ出しを吸収するため。
 */
import { renderToBuffer } from "@react-pdf/renderer";
import type { FullInvoice } from "@/lib/notion/types";
import { EstimateDocument } from "@/pdf/estimate-document";
import { InvoiceDocument } from "@/pdf/invoice-document";

export type PdfKind = "invoice" | "estimate";

/** PDF のページ数（ページオブジェクト `/Type /Page` の数。`/Pages` は数えない）。 */
export function countPdfPages(pdf: Uint8Array): number {
  return (
    Buffer.from(pdf)
      .toString("latin1")
      .match(/\/Type\s*\/Page(?![a-zA-Z])/g) ?? []
  ).length;
}

function render(kind: PdfKind, full: FullInvoice, compact: boolean): Promise<Buffer> {
  const { invoice, customer, account } = full;
  const Doc = kind === "estimate" ? EstimateDocument : InvoiceDocument;
  return renderToBuffer(Doc({ invoice, customer, account, compact }));
}

/** 通常版で描き、複数ページなら詰め版も試してページ数の少ない方を返す。 */
export async function renderFittedPdf(kind: PdfKind, full: FullInvoice): Promise<Buffer> {
  const normal = await render(kind, full, false);
  const normalPages = countPdfPages(normal);
  if (normalPages <= 1) {
    return normal;
  }
  const compact = await render(kind, full, true);
  return countPdfPages(compact) < normalPages ? compact : normal;
}
