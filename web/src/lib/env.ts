import process from "node:process";

// サーバ起動時・スクリプト実行時に .env を読み込む（本番は実環境変数を使う）。
// 環境変数を読む各サーバモジュールは、これを最初に import して順序を保証する。
try {
  process.loadEnvFile();
} catch {
  // .env が無い場合は無視
}

// outbound fetch の失敗理由(cause)を可視化する。better-auth 等がエラーの cause を
// 握りつぶすため、サーバから外部への fetch 失敗を原因付きでログに出す（サーバ専用）。
const originalFetch = globalThis.fetch;
if (
  typeof originalFetch === "function" &&
  !Object.prototype.hasOwnProperty.call(globalThis, "__fetchErrorLogged")
) {
  Object.defineProperty(globalThis, "__fetchErrorLogged", { value: true });
  globalThis.fetch = (async (...args: Parameters<typeof fetch>) => {
    try {
      return await originalFetch(...args);
    } catch (error) {
      const input = args[0];
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      console.error("[fetch-error]", url, error);
      throw error;
    }
  }) as typeof fetch;
}
