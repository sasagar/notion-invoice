import { Link } from "waku";

/** 表示するページ番号（先頭・末尾・現在の前後 2 ページ。間は省略記号）。 */
export function pageWindow(current: number, totalPages: number): (number | "gap")[] {
  const keep = new Set([1, totalPages]);
  for (let n = current - 2; n <= current + 2; n++) {
    if (n >= 1 && n <= totalPages) {
      keep.add(n);
    }
  }
  const sorted = [...keep].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((n, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined && n - prev > 1) {
      out.push("gap");
    }
    out.push(n);
  });
  return out;
}

export function Pagination({
  current,
  totalPages,
  query = "",
}: {
  current: number;
  totalPages: number;
  /** 絞り込み条件（先頭の ? 付き）。ページを移っても条件を保つ。 */
  query?: string;
}) {
  if (totalPages <= 1) {
    return null;
  }
  const linkBase =
    "flex min-h-10 min-w-10 items-center justify-center rounded-sm border border-paper-line px-3 font-mono text-sm dark:border-slate-700";
  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-1" aria-label="ページ">
      {pageWindow(current, totalPages).map((n, i) =>
        n === "gap" ? (
          <span key={`gap${i}`} className="px-1 text-stone-400">
            …
          </span>
        ) : (
          <Link
            key={n}
            to={`/invoice/list/${n}${query}`}
            aria-current={n === current ? "page" : undefined}
            className={
              n === current
                ? `${linkBase} border-kent-blue-500 bg-kent-blue-500 text-white`
                : `${linkBase} hover:border-kent-blue-300 hover:text-kent-blue-600 dark:hover:border-kent-blue-700 dark:hover:text-kent-blue-200`
            }
          >
            {n}
          </Link>
        ),
      )}
    </nav>
  );
}
