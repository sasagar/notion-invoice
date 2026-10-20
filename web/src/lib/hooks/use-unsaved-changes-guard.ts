"use client";

import { useCallback, useEffect, useRef } from "react";

const MESSAGE = "保存していない変更があります。このページを離れますか？";

/**
 * 未保存の変更があるあいだ、タブを閉じる・再読み込み・アプリ内リンクでの移動の前に確認する。
 * Waku の Link は遷移を止める API を持たないため、document のキャプチャ段階でクリックを
 * 先取りし、キャンセルされたら React 側（Link の onClick）へ届く前に止める。
 *
 * 戻り値:
 * - confirmLeave(): ボタンなどコードから離れる前に呼ぶ（離れてよければ true）。
 * - allowLeave(): 保存成功後の遷移など、確認なしで離れるときに呼ぶ。
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const bypassRef = useRef(false);

  const shouldWarn = () => dirtyRef.current && !bypassRef.current;

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldWarn()) {
        e.preventDefault();
      }
    };
    const onClickCapture = (e: MouseEvent) => {
      if (!shouldWarn() || e.defaultPrevented || e.button !== 0) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return; // 新しいタブで開く操作はこのページを離れない
      }
      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank") {
        return;
      }
      if (anchor.origin !== window.location.origin || anchor.hasAttribute("download")) {
        return;
      }
      if (!window.confirm(MESSAGE)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClickCapture, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  const confirmLeave = useCallback(() => !shouldWarn() || window.confirm(MESSAGE), []);
  const allowLeave = useCallback(() => {
    bypassRef.current = true;
  }, []);

  return { confirmLeave, allowLeave };
}
