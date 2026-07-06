import "../styles.css";

import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { NavigationPending, NavigationProgress } from "@/components/navigation-progress";

// 初回描画前に localStorage / OS 設定から .dark を付与し、テーマ切替の
// ちらつきを防ぐ。
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <NavigationProgress />
      <title>BKTSK Notion Invoice</title>
      <meta name="description" content="Notion 連携の請求書・見積書の管理と PDF 出力" />
      <meta name="robots" content="noindex" />
      <link rel="icon" type="image/jpeg" href="/icon.jpg" />
      <link rel="apple-touch-icon" href="/apple-icon.jpg" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;700;900&family=BIZ+UDPGothic:wght@400;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        precedence="font"
      />
      <script
        // biome-ignore lint: テーマ初期化スクリプト
        dangerouslySetInnerHTML={{ __html: themeInit }}
      />
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <NavigationPending>{children}</NavigationPending>
      </main>
      <Footer />
    </div>
  );
}

export const getConfig = async () => ({ render: "static" as const });
