/**
 * 請求書データを AI エージェントへ公開する MCP サーバー（ツール定義）。
 * リクエストごとに認証済み userId を束縛して生成する（ステートレス運用）。
 *
 * - 読み取り（請求書の一覧/詳細/PDF）は data/backend 経由で Notion/SQLite 両対応。
 * - マスタ参照・書き込みは SQLite モード専用（guardMutation の 409 と同じ理由）。
 * - 削除系ツールは意図的に提供しない（取り消せない操作は画面から行う）。
 */
import process from "node:process";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getFullInvoice, isSqliteBackend, listInvoicePage } from "@/lib/data/backend";
import { db } from "@/lib/db";
import { firstInvoiceIssue, INVOICE_STATUSES, invoiceSchema } from "@/lib/invoice-schema";
import { customerSchema, firstIssue, itemSchema } from "@/lib/master-schemas";
import { agentWriteDenialReason } from "@/lib/mcp/policy";
import {
  createCustomer,
  createInvoice,
  createItem,
  duplicateInvoice,
  getInvoiceEditorById,
  getInvoiceEditorByNumber,
  isDuplicateNumberError,
  listAccountRecords,
  listActiveCustomerRecords,
  listCustomerRecords,
  listItems,
  updateInvoiceById,
  updateInvoiceStatus,
} from "@/lib/repository";
import { renderFittedPdf } from "@/pdf";

const SQLITE_ONLY = "この操作は SQLite モード（DATA_BACKEND=sqlite）でのみ利用できます";
const DUPLICATE_NUMBER = "この請求書番号は既に使われています";

/** JSON をテキストとして返す成功結果。 */
function ok(data: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

/** ツールエラー（isError=true で AI に失敗理由を伝える）。 */
function fail(message: string): CallToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}

/** 書き込み時の番号重複を 409 相当のメッセージに変換する。 */
function runWrite(fn: () => CallToolResult): CallToolResult {
  try {
    return fn();
  } catch (e) {
    if (isDuplicateNumberError(e)) {
      return fail(DUPLICATE_NUMBER);
    }
    throw e;
  }
}

const readOnly = { readOnlyHint: true, openWorldHint: false } as const;
const write = { readOnlyHint: false, destructiveHint: false, openWorldHint: false } as const;

/** userId に束縛した MCP サーバーを生成する。 */
export function createInvoiceMcpServer(userId: string): McpServer {
  const server = new McpServer(
    { name: "bktsk-notion-invoice", version: "0.1.0" },
    {
      instructions:
        "日本語の請求書・見積書管理ツール。金額は税抜単価×数量から自動計算されるため、" +
        "合計値は渡さない。書き込みは SQLite モードのみ。既存請求書の更新には " +
        "get_invoice_for_edit で id と現在値を取得してから update_invoice を呼ぶ。",
    },
  );

  // --- 読み取り（両バックエンド） ---

  server.registerTool(
    "list_invoices",
    {
      title: "請求書一覧",
      description: "請求書を発行日の新しい順にページ単位で取得する（合計金額付き）。",
      inputSchema: {
        page: z.number().int().min(1).default(1),
        perPage: z.number().int().min(1).max(100).default(20),
      },
      annotations: readOnly,
    },
    async ({ page, perPage }) => ok(await listInvoicePage(userId, page, perPage)),
  );

  server.registerTool(
    "get_invoice",
    {
      title: "請求書詳細",
      description: "請求書番号で、明細行・金額内訳・顧客・自社情報を含む完全なデータを取得する。",
      inputSchema: { invoiceNumber: z.string().min(1) },
      annotations: readOnly,
    },
    async ({ invoiceNumber }) => {
      const full = await getFullInvoice(userId, invoiceNumber, { lenientRelations: true });
      return full ? ok(full) : fail(`請求書 ${invoiceNumber} が見つかりません`);
    },
  );

  server.registerTool(
    "get_invoice_pdf",
    {
      title: "PDF 出力",
      description: "請求書または見積書の PDF を生成して返す。",
      inputSchema: {
        invoiceNumber: z.string().min(1),
        kind: z.enum(["invoice", "estimate"]).default("invoice"),
      },
      annotations: readOnly,
    },
    async ({ invoiceNumber, kind }) => {
      const full = await getFullInvoice(userId, invoiceNumber);
      if (!full) {
        return fail(`請求書 ${invoiceNumber} が見つかりません`);
      }
      const buffer = await renderFittedPdf(kind, full);
      const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
      return {
        content: [
          {
            type: "resource",
            resource: {
              uri: new URL(`/api/print/${kind}/${encodeURIComponent(invoiceNumber)}`, base).href,
              mimeType: "application/pdf",
              blob: Buffer.from(buffer).toString("base64"),
            },
          },
        ],
      };
    },
  );

  // --- マスタ参照（SQLite のみ） ---

  server.registerTool(
    "list_customers",
    {
      title: "顧客一覧",
      description: "顧客マスタを取得する。請求書作成時の customerId に使う。",
      inputSchema: { includeArchived: z.boolean().default(false) },
      annotations: readOnly,
    },
    async ({ includeArchived }) => {
      if (!isSqliteBackend()) {
        return fail(SQLITE_ONLY);
      }
      return ok(
        includeArchived ? listCustomerRecords(db, userId) : listActiveCustomerRecords(db, userId),
      );
    },
  );

  server.registerTool(
    "list_accounts",
    {
      title: "自社一覧",
      description: "自社（発行元）マスタを取得する。請求書作成時の accountId に使う。",
      annotations: readOnly,
    },
    async () => (isSqliteBackend() ? ok(listAccountRecords(db, userId)) : fail(SQLITE_ONLY)),
  );

  server.registerTool(
    "list_items",
    {
      title: "項目一覧",
      description: "項目マスタ（項目名と税抜単価）を取得する。明細行の itemIds に使う。",
      annotations: readOnly,
    },
    async () => (isSqliteBackend() ? ok(listItems(db, userId)) : fail(SQLITE_ONLY)),
  );

  server.registerTool(
    "get_invoice_for_edit",
    {
      title: "請求書の編集用データ",
      description: "請求書番号から、更新に必要な id と入力値（明細行の itemIds 込み）を取得する。",
      inputSchema: { invoiceNumber: z.string().min(1) },
      annotations: readOnly,
    },
    async ({ invoiceNumber }) => {
      if (!isSqliteBackend()) {
        return fail(SQLITE_ONLY);
      }
      const data = getInvoiceEditorByNumber(db, userId, invoiceNumber);
      return data ? ok(data) : fail(`請求書 ${invoiceNumber} が見つかりません`);
    },
  );

  // --- 書き込み（SQLite のみ・削除は提供しない） ---

  server.registerTool(
    "create_invoice",
    {
      title: "請求書作成",
      description: "請求書を新規作成する。番号は一意。日付は YYYY-MM-DD。",
      inputSchema: invoiceSchema,
      annotations: write,
    },
    async (args) => {
      if (!isSqliteBackend()) {
        return fail(SQLITE_ONLY);
      }
      const parsed = invoiceSchema.safeParse(args);
      if (!parsed.success) {
        return fail(firstInvoiceIssue(parsed.error));
      }
      const input = parsed.data;
      return runWrite(() =>
        ok({ id: createInvoice(db, userId, input), invoiceNumber: input.invoiceNumber }),
      );
    },
  );

  server.registerTool(
    "update_invoice",
    {
      title: "請求書更新",
      description:
        "既存請求書を丸ごと置き換える（明細行も全置換）。先に get_invoice_for_edit で現在値を取得すること。",
      inputSchema: z.object({ id: z.string().min(1), invoice: invoiceSchema }),
      annotations: { ...write, idempotentHint: true },
    },
    async ({ id, invoice }) => {
      if (!isSqliteBackend()) {
        return fail(SQLITE_ONLY);
      }
      const parsed = invoiceSchema.safeParse(invoice);
      if (!parsed.success) {
        return fail(firstInvoiceIssue(parsed.error));
      }
      const current = getInvoiceEditorById(db, userId, id);
      if (!current) {
        return fail("請求書が見つかりません");
      }
      const denied = agentWriteDenialReason(current.status, parsed.data.status);
      if (denied) {
        return fail(denied);
      }
      const input = parsed.data;
      return runWrite(() => {
        updateInvoiceById(db, userId, id, input);
        return ok({ id, invoiceNumber: input.invoiceNumber });
      });
    },
  );

  server.registerTool(
    "update_invoice_status",
    {
      title: "ステータス変更",
      description: "請求書のステータスだけを変更する。",
      inputSchema: { id: z.string().min(1), status: z.enum(INVOICE_STATUSES) },
      annotations: { ...write, idempotentHint: true },
    },
    async ({ id, status }) => {
      if (!isSqliteBackend()) {
        return fail(SQLITE_ONLY);
      }
      const current = getInvoiceEditorById(db, userId, id);
      if (!current) {
        return fail("請求書が見つかりません");
      }
      const denied = agentWriteDenialReason(current.status, status);
      if (denied) {
        return fail(denied);
      }
      updateInvoiceStatus(db, userId, id, status);
      return ok({ id, status });
    },
  );

  server.registerTool(
    "duplicate_invoice",
    {
      title: "請求書複製",
      description: "請求書を複製する（番号=元番号-copy、ステータス=ドラフト、発行日/期限は空）。",
      inputSchema: { id: z.string().min(1) },
      annotations: write,
    },
    async ({ id }) => {
      if (!isSqliteBackend()) {
        return fail(SQLITE_ONLY);
      }
      const copied = duplicateInvoice(db, userId, id);
      return copied ? ok(copied) : fail("請求書が見つかりません");
    },
  );

  server.registerTool(
    "create_customer",
    {
      title: "顧客作成",
      description: "顧客マスタを追加する（顧客名か社名のどちらか必須）。",
      inputSchema: customerSchema,
      annotations: write,
    },
    async (args) => {
      if (!isSqliteBackend()) {
        return fail(SQLITE_ONLY);
      }
      const parsed = customerSchema.safeParse(args);
      return parsed.success
        ? ok({ id: createCustomer(db, userId, parsed.data) })
        : fail(firstIssue(parsed.error));
    },
  );

  server.registerTool(
    "create_item",
    {
      title: "項目作成",
      description: "項目マスタ（項目名・税抜単価）を追加する。",
      inputSchema: itemSchema,
      annotations: write,
    },
    async (args) => {
      if (!isSqliteBackend()) {
        return fail(SQLITE_ONLY);
      }
      const parsed = itemSchema.safeParse(args);
      return parsed.success
        ? ok({ id: createItem(db, userId, parsed.data) })
        : fail(firstIssue(parsed.error));
    },
  );

  return server;
}
