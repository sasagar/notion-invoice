import { fileURLToPath } from "node:url";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "waku/config";

// ネイティブモジュール(better-sqlite3)は __filename を参照するため、
// サーバ側環境(rsc/ssr)でバンドルせず外部化する。
// @react-pdf/renderer は rsc 環境でバンドルすると react が react-server 条件で
// 解決され、内部で参照する client 版 React の internals が undefined になって
// PDF 生成が "Cannot read properties of undefined (reading 'S')" で落ちる。
// 外部化して実行時に Node の既定条件で解決させる。
const serverExternal = ["better-sqlite3", "@react-pdf/renderer"];

export default defineConfig({
  vite: {
    environments: {
      rsc: { resolve: { external: serverExternal } },
      ssr: { resolve: { external: serverExternal } },
    },
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    plugins: [tailwindcss(), react(), babel({ presets: [reactCompilerPreset()] })],
  },
});
