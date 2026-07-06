import { guardMutation } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { customerSchema, firstIssue } from "@/lib/master-schemas";
import { createCustomer } from "@/lib/repository";

// 顧客マスタを作成する。
export const POST = async (req: Request): Promise<Response> => {
  const g = await guardMutation(req);
  if (!g.ok) {
    return g.res;
  }
  const body: unknown = await req.json().catch(() => null);
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const id = createCustomer(db, g.userId, parsed.data);
  return Response.json({ id });
};
