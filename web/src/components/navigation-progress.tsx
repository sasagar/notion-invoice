"use client";

import { useNavigationStatus_UNSTABLE as useNavigationStatus } from "waku/router/client";

/** クライアント遷移中に上部へ表示するグローバルな進捗バー。 */
export function NavigationProgress() {
  const { pending } = useNavigationStatus();
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 transition-opacity duration-200 ${
        pending ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full origin-left bg-kent-blue-400"
        style={pending ? { animation: "nav-progress 1s ease-in-out infinite" } : undefined}
      />
    </div>
  );
}
