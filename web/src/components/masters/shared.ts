/**
 * マスタ管理画面の共有: 入力/ボタンのクラス名（台帳デザイン: underline 入力・kent-blue）と
 * 状態変更 fetch ヘルパ。client コンポーネントから import して使う。
 */

export const inputClass =
  "w-full border-b-2 border-paper-line bg-transparent px-0.5 py-1.5 outline-none transition focus:border-kent-blue-500 dark:border-slate-700 dark:focus:border-kent-blue-300";

export const labelClass =
  "flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400";

export const primaryBtn =
  "rounded-sm bg-kent-blue-500 px-4 py-2 text-sm text-white transition hover:bg-kent-blue-600 disabled:opacity-50";

export const subtleBtn =
  "rounded-sm border border-paper-line px-4 py-2 text-sm text-stone-600 transition hover:border-kent-blue-400 hover:text-kent-blue-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300";

export const dangerBtn =
  "rounded-sm px-4 py-2 text-sm text-shuiro-600 transition hover:bg-shuiro-50 disabled:opacity-50 dark:text-shuiro-400 dark:hover:bg-shuiro-950/30";

export type MutateResult = { ok: true } | { ok: false; error: string };

async function errorFrom(res: Response, fallback: string): Promise<string> {
  const j = (await res.json().catch(() => ({}))) as { error?: string };
  return j.error ?? fallback;
}

/** JSON ボディの POST/PUT。成功可否と失敗時の日本語メッセージを返す。 */
export async function jsonMutate(
  url: string,
  method: "POST" | "PUT",
  body: unknown,
): Promise<MutateResult> {
  const res = await fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return res.ok ? { ok: true } : { ok: false, error: await errorFrom(res, "保存に失敗しました") };
}

/** DELETE。 */
export async function jsonDelete(url: string): Promise<MutateResult> {
  const res = await fetch(url, { method: "DELETE", credentials: "include" });
  return res.ok ? { ok: true } : { ok: false, error: await errorFrom(res, "削除に失敗しました") };
}

/** 印影を POST /api/files へアップロードし、file id を返す。 */
export async function uploadSeal(
  file: File,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/files", { method: "POST", credentials: "include", body: fd });
  if (!res.ok) {
    return { ok: false, error: await errorFrom(res, "アップロードに失敗しました") };
  }
  const j = (await res.json()) as { id?: string };
  return typeof j.id === "string"
    ? { ok: true, id: j.id }
    : { ok: false, error: "アップロードに失敗しました" };
}
