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

export function ThemeToggle() {
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
      className="rounded p-2 text-stone-500 transition hover:bg-stone-900/5 hover:text-stone-700 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
    >
      <SlBulb aria-hidden />
    </button>
  );
}
