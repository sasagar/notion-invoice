import { NextResponse } from 'next/server';
import { createClient } from '@/app/(screen)/_utils/supabase/middleware';

export async function proxy(request) {
  const { supabase, response } = createClient(request);

  // リダイレクト処理
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = request.headers.get('bktsk_notion_invoice');

  // Pupeteerのリクエストのため、トークンが一致する場合はリクエストを処理しない。
  // if (token === process.env.NOTION_API_KEY) {
  if (token === process.env.PUPPETEER_API_KEY) {
    return response;
  }

  // ログインしていない場合でもトップページは表示させる
  if (!session && request.nextUrl.pathname === '/') {
    return response;
  }

  // ログインしていない場合はログイン画面にリダイレクトする。
  if (!session && !request.nextUrl.pathname.startsWith("/auth/login")) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // ログインしている場合はログイン画面から請求書画面にリダイレクトする。
  if (session && request.nextUrl.pathname.startsWith('/auth/login')) {
    return NextResponse.redirect(new URL('/invoice', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!auth|_next/static|_next/image|favicon.ico).*)'],
};
