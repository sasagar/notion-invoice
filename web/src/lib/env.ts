import process from "node:process";

// サーバ起動時・スクリプト実行時に .env を読み込む（本番は実環境変数を使う）。
// 環境変数を読む各サーバモジュールは、これを最初に import して順序を保証する。
try {
  process.loadEnvFile();
} catch {
  // .env が無い場合は無視
}
