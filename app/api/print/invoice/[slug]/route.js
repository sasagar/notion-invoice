import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoiceDocument } from '@/app/_shared/pdf';
import getInvoiceItem from '@/app/(screen)/_utils/notion/getInvoiceItem';
import invoiceSanitizer from '@/app/(screen)/_utils/notion/invoiceSanitizer';
import getInvoiceRow from '@/app/(screen)/_utils/notion/getInvoiceRow';
import dateFormat from '@/app/(screen)/_utils/properties/dateFormat';
import { plain_text } from '@/app/(screen)/_utils/properties/plain_text';

export const GET = async req => {
  const path = req.nextUrl.pathname.split('/');
  const slug = path[path.length - 1];

  try {
    // Notionからデータ取得
    const { invoices, customer, account } = await getInvoiceItem(slug);
    const sanitizedInvoice = await invoiceSanitizer(invoices[0]);
    const rows = await getInvoiceRow(sanitizedInvoice.items);

    // PDFを直接生成
    const pdfBuffer = await renderToBuffer(
      InvoiceDocument({
        sanitizedInvoice,
        customer,
        account,
        rows,
        dateFormat,
        plain_text,
      }),
    );

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Length', pdfBuffer.length.toString());

    return new NextResponse(pdfBuffer, { status: 200, statusText: 'OK', headers });
  } catch (error) {
    console.error('PDF generation error:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};;;
