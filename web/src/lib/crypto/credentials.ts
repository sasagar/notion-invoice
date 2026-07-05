import "@/lib/env";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import process from "node:process";

const IV_LEN = 12; // GCM 推奨 96bit
const TAG_LEN = 16;

const DEV_KEY = "dev-only-insecure-crypto-key";
const KNOWN_INSECURE = new Set([DEV_KEY, "change-me-exactly-32-bytes-000000"]);

// 開発鍵へのフォールバックは NODE_ENV=development/test のみ許可（fail-closed）。
// staging/未設定/独自値では CRYPTO_KEY 未設定なら起動失敗させ、公開既知鍵で
// 本物の秘密を暗号化してしまう事故を防ぐ。
const nodeEnv = process.env.NODE_ENV;
const allowDevKey = nodeEnv === "development" || nodeEnv === "test";

const rawKey = process.env.CRYPTO_KEY;
if (!rawKey && !allowDevKey) {
  throw new Error("CRYPTO_KEY is required. Generate one with: openssl rand -base64 32");
}
if (rawKey && !allowDevKey && (rawKey.length < 32 || KNOWN_INSECURE.has(rawKey))) {
  throw new Error("CRYPTO_KEY must be a 32+ char secret and not a known placeholder");
}

// CRYPTO_KEY(任意長のパスフレーズ)から scrypt で 32バイト鍵を導出する。
const key = scryptSync(rawKey ?? DEV_KEY, "notion-invoice-cred-v1", 32);

/**
 * 平文を AES-256-GCM で暗号化し base64(iv|tag|ciphertext) を返す。
 * レコードごとにランダム IV を用いる（IV 使い回しなし）。
 */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

/**
 * encryptSecret の逆。改ざんされていれば GCM 認証タグ検証で例外になる。
 */
export function decryptSecret(stored: string): string {
  const buf = Buffer.from(stored, "base64");
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const enc = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
