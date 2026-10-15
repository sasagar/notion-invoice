/**
 * MCP の返り値から AI に不要な大きいデータを外す。
 * 印影は SQLite モードでは data URI（数十〜数百 KB）で、1 回の get_invoice が
 * クライアントのトークン上限を超えてしまうため、有無だけを返す。
 */
import type { FullInvoice } from "@/lib/notion/types";

type WithSeal = { sealImageUrl: string | null };

/** sealImageUrl を外し、代わりに印影の有無（hasSealImage）を付ける。 */
export function withoutSealImage<T extends WithSeal>(
  account: T,
): Omit<T, "sealImageUrl"> & { hasSealImage: boolean } {
  const { sealImageUrl, ...rest } = account;
  return { ...rest, hasSealImage: sealImageUrl !== null && sealImageUrl !== "" };
}

/** get_invoice 用: 自社情報の印影だけを外した FullInvoice。 */
export function redactFullInvoice(full: FullInvoice) {
  return { ...full, account: full.account ? withoutSealImage(full.account) : null };
}
