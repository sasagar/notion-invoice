/**
 * Notion のプロパティを、型が変わっても壊れないよう安全に読み取る抽出関数群。
 * すべて unknown を受け取り、想定外の形なら既定値を返す（null 非安全アクセスを排除）。
 */

export type NotionPage = {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, unknown>;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** SDK レスポンスを緩い NotionPage 構造に正規化する。 */
export function asNotionPage(v: unknown): NotionPage {
  const p = asRecord(v);
  return {
    id: asString(p?.["id"]),
    created_time: asString(p?.["created_time"]),
    last_edited_time: asString(p?.["last_edited_time"]),
    properties: asRecord(p?.["properties"]) ?? {},
  };
}

function joinRichText(arr: unknown): string {
  if (!Array.isArray(arr)) {
    return "";
  }
  return arr.map((t) => asString(asRecord(t)?.["plain_text"])).join("");
}

/** title / rich_text / status / select を文字列化する。 */
export function plainText(prop: unknown): string {
  const p = asRecord(prop);
  if (!p) {
    return "";
  }
  switch (p["type"]) {
    case "title":
      return joinRichText(p["title"]);
    case "rich_text":
      return joinRichText(p["rich_text"]);
    case "status":
      return asString(asRecord(p["status"])?.["name"]);
    case "select":
      return asString(asRecord(p["select"])?.["name"]);
    default:
      return "";
  }
}

/** number / formula(number) / rollup(number|array) から数値を取り出す。 */
export function numberValue(prop: unknown, fallback = 0): number {
  const p = asRecord(prop);
  if (!p) {
    return fallback;
  }
  switch (p["type"]) {
    case "number":
      return typeof p["number"] === "number" ? p["number"] : fallback;
    case "formula": {
      const f = asRecord(p["formula"]);
      return f?.["type"] === "number" && typeof f["number"] === "number" ? f["number"] : fallback;
    }
    case "rollup": {
      const r = asRecord(p["rollup"]);
      if (!r) {
        return fallback;
      }
      if (r["type"] === "number") {
        return typeof r["number"] === "number" ? r["number"] : fallback;
      }
      if (r["type"] === "array" && Array.isArray(r["array"])) {
        const first = r["array"].find(Boolean);
        return first ? numberValue(first, fallback) : fallback;
      }
      return fallback;
    }
    default:
      return fallback;
  }
}

/** rollup(array) の各要素を plainText 化した配列（空要素除外）。 */
export function rollupTextList(prop: unknown): string[] {
  const p = asRecord(prop);
  if (p?.["type"] !== "rollup") {
    return [];
  }
  const r = asRecord(p["rollup"]);
  const arr = r?.["array"];
  if (!Array.isArray(arr)) {
    return [];
  }
  return arr.map((el) => plainText(el)).filter((t) => t.length > 0);
}

/** date プロパティの start（無ければ null）。 */
export function dateStart(prop: unknown): string | null {
  const p = asRecord(prop);
  if (p?.["type"] !== "date") {
    return null;
  }
  const d = asRecord(p["date"]);
  return typeof d?.["start"] === "string" ? (d["start"] as string) : null;
}

/** checkbox の真偽（無ければ false）。 */
export function checkbox(prop: unknown): boolean {
  const p = asRecord(prop);
  return p?.["type"] === "checkbox" && p["checkbox"] === true;
}

/** relation の id 配列。 */
export function relationIds(prop: unknown): string[] {
  const p = asRecord(prop);
  if (p?.["type"] !== "relation" || !Array.isArray(p["relation"])) {
    return [];
  }
  return p["relation"].map((r) => asString(asRecord(r)?.["id"])).filter((id) => id.length > 0);
}

/** files プロパティ先頭の URL（file / external, 無ければ null）。 */
export function firstFileUrl(prop: unknown): string | null {
  const p = asRecord(prop);
  if (p?.["type"] !== "files" || !Array.isArray(p["files"])) {
    return null;
  }
  const first = asRecord(p["files"][0]);
  if (!first) {
    return null;
  }
  const file = asRecord(first["file"]);
  if (typeof file?.["url"] === "string") {
    return file["url"] as string;
  }
  const external = asRecord(first["external"]);
  if (typeof external?.["url"] === "string") {
    return external["url"] as string;
  }
  return null;
}
