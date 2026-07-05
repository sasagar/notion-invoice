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
      className="rounded p-2 text-stone-600 hover:bg-stone-200 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <SlBulb aria-hidden />
    </button>
  );
}
