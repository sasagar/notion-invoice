import { guardMutation } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { firstInvoiceIssue, invoiceSchema } from "@/lib/invoice-schema";
import { createInvoice, isDuplicateNumberError } from "@/lib/repository";

// 請求書を新規作成する（番号重複は 409）。
export const POST = async (req: Request): Promise<Response> => {
  const g = await guardMutation(req);
  if (!g.ok) {
    return g.res;
  }
  const body: unknown = await req.json().catch(() => null);
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstInvoiceIssue(parsed.error) }, { status: 400 });
  }
  try {
    const id = createInvoice(db, g.userId, parsed.data);
    return Response.json({ id, invoiceNumber: parsed.data.invoiceNumber });
  } catch (e) {
    if (isDuplicateNumberError(e)) {
      return Response.json({ error: "この請求書番号は既に使われています" }, { status: 409 });
    }
    throw e;
  }
};
