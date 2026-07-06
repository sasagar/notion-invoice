"use client";

import type { ReactNode } from "react";
import { useNavigationStatus_UNSTABLE as useNavigationStatus } from "waku/router/client";

/** クライアント遷移中に上部へ表示するグローバルな進捗バー。 */
export function NavigationProgress() {
  const { pending } = useNavigationStatus();
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-1 overflow-hidden transition-opacity duration-150 ${
        pending ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full w-full origin-left bg-kent-blue-500 shadow-[0_0_10px_1px] shadow-kent-blue-400/70"
        style={pending ? { animation: "nav-progress 1.1s ease-in-out infinite" } : undefined}
      />
    </div>
  );
}

/**
 * 遷移中はメイン領域を減光し、操作を止めてローディングを可視化する。
 * Waku の Link 遷移は useTransition ベースで、遷移中は旧画面が残るため
 * 明示的な減光がないと「固まって見える」。
 */
export function NavigationPending({ children }: { children: ReactNode }) {
  const { pending } = useNavigationStatus();
  return (
    <div
      aria-busy={pending}
      className={`transition-opacity duration-150 ${
        pending ? "pointer-events-none opacity-40" : "opacity-100"
      }`}
    >
      {children}
    </div>
  );
}
