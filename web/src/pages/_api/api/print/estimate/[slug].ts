import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { getFullInvoice } from "@/lib/data/backend";
import { EstimateDocument } from "@/pdf";

export const GET = async (
  req: Request,
  ctx: { params: Record<string, string | string[]> },
): Promise<Response> => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const slug = String(ctx.params.slug ?? "");
  try {
    const full = await getFullInvoice(session.user.id, slug);
    if (!full) {
      return Response.json({ error: "not found" }, { status: 404 });
    }
    const { invoice, customer, account } = full;
    const buffer = await renderToBuffer(EstimateDocument({ invoice, customer, account }));
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(buffer.length),
      },
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "PDF generation failed" },
      { status: 500 },
    );
  }
};
