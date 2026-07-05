import { describe, expect, test } from "vitest";
import { decryptSecret, encryptSecret } from "@/lib/crypto/credentials";

describe("AES-256-GCM 資格情報暗号化", () => {
  test("往復で平文が復元される", () => {
    const plain = "secret_ntn_1234567890-値/記号=+";
    expect(decryptSecret(encryptSecret(plain))).toBe(plain);
  });

  test("同じ平文でも毎回異なる暗号文（ランダムIV）", () => {
    const a = encryptSecret("same");
    const b = encryptSecret("same");
    expect(a).not.toBe(b);
    expect(decryptSecret(a)).toBe("same");
    expect(decryptSecret(b)).toBe("same");
  });

  test("改ざんされた暗号文は復号に失敗する", () => {
    const enc = encryptSecret("tamper-me");
    const buf = Buffer.from(enc, "base64");
    buf[buf.length - 1] = buf[buf.length - 1]! ^ 0xff; // 末尾1バイト反転
    expect(() => decryptSecret(buf.toString("base64"))).toThrow();
  });

  test("空文字も扱える", () => {
    expect(decryptSecret(encryptSecret(""))).toBe("");
  });
});
