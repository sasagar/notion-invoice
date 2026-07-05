import { Client } from "@notionhq/client";
import { getCredentials } from "@/lib/credentials";

// api_key:db_id ごとに data_source_id を解決キャッシュ（毎回の databases.retrieve を回避）。
const dataSourceCache = new Map<string, string>();

function asRecord(v: unknown): Record<string, unknown> | null {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;
}

async function resolveDataSourceId(
  notion: Client,
  cacheKey: string,
  dbId: string,
): Promise<string> {
  const cached = dataSourceCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const database = await notion.databases.retrieve({ database_id: dbId });
  const sources = asRecord(database)?.["data_sources"];
  const first = Array.isArray(sources) ? asRecord(sources[0]) : null;
  const id = typeof first?.["id"] === "string" ? (first["id"] as string) : dbId;
  dataSourceCache.set(cacheKey, id);
  return id;
}

export type NotionContext = { notion: Client; dataSourceId: string };

/** ユーザーの資格情報から Notion クライアントと data_source_id を得る。 */
export async function getNotionClient(userId: string): Promise<NotionContext> {
  const creds = getCredentials(userId);
  if (!creds) {
    throw new Error("Notion 資格情報が未設定です。設定画面から登録してください。");
  }
  const notion = new Client({ auth: creds.apiKey });
  const dataSourceId = await resolveDataSourceId(
    notion,
    `${creds.apiKey}:${creds.dbId}`,
    creds.dbId,
  );
  return { notion, dataSourceId };
}
