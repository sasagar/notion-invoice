"use client";

import { useEffect, useRef } from "react";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        },
      ) => void;
    };
  }
}

/**
 * Cloudflare Turnstile ウィジェット。VITE_TURNSTILE_SITE_KEY 未設定なら
 * 何も描画しない（captcha 無効時＝開発）。トークンは onToken で親へ渡す。
 */
export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!SITE_KEY || !el) {
      return;
    }
    const render = () => {
      if (window.turnstile && el) {
        window.turnstile.render(el, { sitekey: SITE_KEY, callback: onToken });
      }
    };
    if (window.turnstile) {
      render();
      return;
    }
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", render);
    return () => script?.removeEventListener("load", render);
  }, [onToken]);

  if (!SITE_KEY) {
    return null;
  }
  return <div ref={ref} className="my-1" />;
}
