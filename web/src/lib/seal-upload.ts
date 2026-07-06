/**
 * 印影アップロードの検証（純粋関数）。ルートハンドラと分離してテスト可能にする。
 */

/** 印影の許可 mime（ラスタ画像のみ。SVG はスクリプト混入リスクのため除外）。 */
export const SEAL_MIME_ALLOWLIST: readonly string[] = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

/** 印影の最大バイト数（数十KB想定。上限 2MB）。 */
export const SEAL_MAX_BYTES = 2 * 1024 * 1024;

export type SealValidation = { ok: true } | { ok: false; error: string };

/** mime とサイズを検証する。 */
export function validateSealFile(mimeType: string, byteSize: number): SealValidation {
  if (!SEAL_MIME_ALLOWLIST.includes(mimeType)) {
    return { ok: false, error: "対応していない画像形式です（png / jpeg / webp / gif）" };
  }
  if (byteSize <= 0) {
    return { ok: false, error: "空のファイルです" };
  }
  if (byteSize > SEAL_MAX_BYTES) {
    return { ok: false, error: "ファイルが大きすぎます（上限 2MB）" };
  }
  return { ok: true };
}
