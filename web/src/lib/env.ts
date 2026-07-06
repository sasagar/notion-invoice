import process from "node:process";

// サーバ起動時・スクリプト実行時に .env を読み込む（本番は実環境変数を使う）。
try {
  process.loadEnvFile();
} catch {
  // .env が無い場合は無視
}

// outbound fetch の計測（診断用・サーバ専用）。
// - 失敗時: URL と error(cause) をログ
// - siteverify: レスポンスの status/content-type/本文(先頭)をログ（clone で非破壊）
const originalFetch = globalThis.fetch;
if (
  typeof originalFetch === "function" &&
  !Object.prototype.hasOwnProperty.call(globalThis, "__fetchInstrumented")
) {
  Object.defineProperty(globalThis, "__fetchInstrumented", { value: true });
  globalThis.fetch = (async (...args: Parameters<typeof fetch>) => {
    const input = args[0];
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    try {
      const res = await originalFetch(...args);
      if (url.includes("siteverify")) {
        res
          .clone()
          .text()
          .then((t) =>
            console.error(
              "[siteverify]",
              res.status,
              res.headers.get("content-type"),
              "|",
              t.slice(0, 300),
            ),
          )
          .catch(() => {});
      }
      return res;
    } catch (error) {
      console.error("[fetch-error]", url, error);
      throw error;
    }
  }) as typeof fetch;
  console.error("[env] fetch instrumentation active");
}
