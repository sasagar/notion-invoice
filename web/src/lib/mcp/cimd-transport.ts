/**
 * CIMD のメタデータ文書取得に、失敗時の診断ログを付ける。
 *
 * 取得そのものは公式の Node 用トランスポート（DNS を 1 回だけ解決・公開アドレスのみ・
 * 接続先固定・リダイレクト不追従）に任せ、ここでは前後を記録するだけ（SSRF 対策は変えない）。
 * 本番 CT で、取得が 5 秒でタイムアウトする事象が一度だけ再現せずに起きたため、
 * 次に起きたときの手がかり（所要時間・エラー・このプロセスから見た DNS の順序）を残す。
 */
import { lookup } from "node:dns/promises";
import type { ClientMetadataResourceFetch } from "@better-auth/oauth-provider";

/** 成功でもこれより遅ければ記録する（プラグインのタイムアウトは 5 秒）。 */
const SLOW_MS = 2000;

type Logger = (message: string) => void;

function describeError(e: unknown): string {
  if (!(e instanceof Error)) {
    return String(e);
  }
  const code = (e as { code?: unknown }).code;
  const cause = e.cause instanceof Error ? ` cause=${e.cause.message}` : "";
  return `${e.name}: ${e.message}${typeof code === "string" ? ` code=${code}` : ""}${cause}`;
}

/** 取得先ホストを、トランスポートと同じ方式（all + verbatim）で引いた順序。記録専用。 */
async function dnsOrder(url: string): Promise<string> {
  try {
    const addrs = await lookup(new URL(url).hostname, { all: true, verbatim: true });
    return addrs.map((a) => a.address).join(", ");
  } catch (e) {
    return `lookup failed (${describeError(e)})`;
  }
}

/** トランスポートを包み、失敗・遅延時にログを出すトランスポートを返す。 */
export function withCimdFetchDiagnostics(
  transport: ClientMetadataResourceFetch,
  log: Logger = (m) => console.error(m),
): ClientMetadataResourceFetch {
  return async (input, init) => {
    const url = input instanceof Request ? input.url : String(input);
    const started = Date.now();
    try {
      const res = await transport(input, init);
      const ms = Date.now() - started;
      if (ms >= SLOW_MS) {
        log(`[cimd] slow fetch ${url} status=${res.status} ${ms}ms dns=[${await dnsOrder(url)}]`);
      }
      return res;
    } catch (e) {
      const ms = Date.now() - started;
      log(
        `[cimd] fetch failed ${url} after ${ms}ms: ${describeError(e)} dns=[${await dnsOrder(url)}]`,
      );
      throw e;
    }
  };
}
