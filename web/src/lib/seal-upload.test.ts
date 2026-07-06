import { describe, expect, test } from "vitest";
import { SEAL_MAX_BYTES, validateSealFile } from "@/lib/seal-upload";

describe("validateSealFile（印影アップロード検証）", () => {
  test("許可 mime は ok（png/jpeg/webp/gif）", () => {
    for (const m of ["image/png", "image/jpeg", "image/webp", "image/gif"]) {
      expect(validateSealFile(m, 1000)).toEqual({ ok: true });
    }
  });
  test("非許可 mime は拒否（svg / pdf / 空）", () => {
    expect(validateSealFile("image/svg+xml", 100).ok).toBe(false);
    expect(validateSealFile("application/pdf", 100).ok).toBe(false);
    expect(validateSealFile("", 100).ok).toBe(false);
  });
  test("空ファイルは拒否", () => {
    expect(validateSealFile("image/png", 0).ok).toBe(false);
  });
  test("上限ちょうどは ok、超過は拒否", () => {
    expect(validateSealFile("image/png", SEAL_MAX_BYTES)).toEqual({ ok: true });
    expect(validateSealFile("image/png", SEAL_MAX_BYTES + 1).ok).toBe(false);
  });
});
