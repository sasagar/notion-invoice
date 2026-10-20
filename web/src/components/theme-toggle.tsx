"use client";

import { useEffect, useState } from "react";
import { SlBulb } from "react-icons/sl";

function apply(theme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // localStorage 不可環境は無視
  }
}

/** withLabel=true でサイドバー用の「アイコン + 文言」表示にする。 */
export function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    apply(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="テーマ切替"
      className={`flex min-h-11 min-w-11 items-center gap-3 rounded p-2 text-stone-500 transition hover:bg-stone-900/5 hover:text-stone-700 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200 ${withLabel ? "w-full px-3 text-sm" : "justify-center"}`}
    >
      <SlBulb aria-hidden />
      {withLabel && <span>{theme === "dark" ? "ライトモード" : "ダークモード"}</span>}
    </button>
  );
}
