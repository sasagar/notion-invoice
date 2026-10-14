import { verifyOAuthQueryParams } from "@better-auth/oauth-provider";
import { ConsentForm } from "@/components/oauth-consent-form";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asRow, str } from "@/lib/repository/row";
import { requireSession } from "@/lib/session";

/** oauthClient.redirectUris（JSON 配列またはカンマ区切り）から戻り先ホストを取り出す。 */
function redirectHosts(raw: string): string[] {
  let urls: string[];
  try {
    const parsed: unknown = JSON.parse(raw);
    urls = Array.isArray(parsed) ? parsed.map(String) : [raw];
  } catch {
    urls = raw.split(",");
  }
  return urls
    .filter((u) => u !== "")
    .map((u) => {
      try {
        return new URL(u).host;
      } catch {
        return u;
      }
    });
}

/**
 * MCP クライアントへのアクセス許可の同意画面（oauth-provider の consentPage）。
 * 署名付きクエリを検証し、どのアプリが・どこへ結果を返すのかを示した上で、
 * 利用者が明示的に許可したときだけ認可コードを発行させる。
 */
export default async function OAuthConsentPage({ query }: { query: string }) {
  const session = await requireSession();
  const { secret } = await auth.$context;
  const valid = await verifyOAuthQueryParams(query, secret);
  const clientId = new URLSearchParams(query).get("client_id") ?? "";
  const raw = valid
    ? db.prepare('SELECT name, "redirectUris" FROM oauthClient WHERE "clientId" = ?').get(clientId)
    : undefined;
  const app = raw === undefined ? null : asRow(raw);

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="rounded-lg border border-paper-line bg-white/70 p-8 dark:border-slate-800 dark:bg-slate-900/40">
        <h1 className="mb-6 font-display text-2xl font-bold text-kent-blue-500 dark:text-kent-blue-200">
          アクセスの許可
        </h1>
        {app === null ? (
          <p className="text-sm text-shuiro-600 dark:text-shuiro-400">
            認可リクエストが不正か、期限切れです。接続元のアプリからやり直してください。
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm leading-relaxed">
              <strong className="font-bold">{str(app["name"]) || "名前のないアプリ"}</strong> が、
              {session?.user.email ?? "あなた"}{" "}
              として請求書・顧客・項目マスタの閲覧と作成・更新を行うことを求めています。
            </p>
            <div className="mb-6 rounded-sm border border-paper-line p-3 text-xs dark:border-slate-700">
              <p className="mb-1 font-bold text-stone-500 dark:text-slate-400">許可後の戻り先</p>
              <ul className="font-mono break-all">
                {redirectHosts(str(app["redirectUris"])).map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
            <p className="mb-6 text-xs leading-relaxed text-stone-500 dark:text-slate-400">
              自分で接続操作をしていない場合や、戻り先に心当たりがない場合は拒否してください。
            </p>
            <ConsentForm />
          </>
        )}
      </div>
    </div>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
