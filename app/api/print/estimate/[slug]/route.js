import { NextResponse } from 'next/server';
import { generatePdf } from '@/app/api/_utils/pdfGenerator';

export const GET = async req => {
  const host = req.nextUrl.host;
  const path = req.nextUrl.pathname.split('/');
  const slug = path[path.length - 1];

  const pdf = await generatePdf(host, `estimate/${slug}`);

  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');

  return new NextResponse(pdf, { status: 200, statusText: 'OK', headers });
};
