import { fileURLToPath } from "node:url";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "waku/config";

// ネイティブモジュール(better-sqlite3)は __filename を参照するため、
// サーバ側環境(rsc/ssr)でバンドルせず外部化する。
const serverExternal = ["better-sqlite3"];

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
