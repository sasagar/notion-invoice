import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { buildFullInvoice } from "@/lib/notion/build-full-invoice";
import { getInvoiceByNumber } from "@/lib/notion/fetchers";
import { InvoiceDocument } from "@/pdf";

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
    const rawInvoice = await getInvoiceByNumber(session.user.id, slug);
    if (!rawInvoice) {
      return Response.json({ error: "not found" }, { status: 404 });
    }
    const { invoice, customer, account } = await buildFullInvoice(session.user.id, rawInvoice);
    const buffer = await renderToBuffer(InvoiceDocument({ invoice, customer, account }));
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
