import { auth } from "@/lib/auth";

// /api/auth/* の全メソッドを better-auth のハンドラへ委譲（default = catch-all）。
export default async function handler(req: Request): Promise<Response> {
  return auth.handler(req);
}
