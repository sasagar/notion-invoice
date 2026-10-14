import { Document, Page, renderToBuffer, Text } from "@react-pdf/renderer";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { countPdfPages } from "@/pdf/render";

// 既定フォント（Helvetica）だけで描くので、ネットワーク（Web フォント取得）不要。
function pdfWithPages(n: number): Promise<Buffer> {
  const pages = Array.from({ length: n }, (_, i) =>
    createElement(Page, { key: i, size: "A4" }, createElement(Text, null, `page ${i + 1}`)),
  );
  return renderToBuffer(createElement(Document, null, ...pages));
}

describe("countPdfPages", () => {
  it("ページオブジェクトの数を数える（/Pages ツリーは数えない）", async () => {
    expect(countPdfPages(await pdfWithPages(1))).toBe(1);
    expect(countPdfPages(await pdfWithPages(2))).toBe(2);
    expect(countPdfPages(await pdfWithPages(5))).toBe(5);
  });

  it("PDF でないバイト列は 0", () => {
    expect(countPdfPages(new TextEncoder().encode("not a pdf"))).toBe(0);
  });
});
