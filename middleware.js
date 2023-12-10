import { NextResponse } from 'next/server'
import { createClient } from './app/(screen)/utils/supabase/middleware';

export async function middleware(request) {
    const { supabase, response } = createClient(request)

    // リダイレクト処理
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const token = request.headers.get("bktsk_notion_invoice");

    if (token === process.env.NOTION_API_KEY) {
        return response;
    }

    if (!session && !request.url.includes("/login")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session && request.url.includes("/login")) {
        return NextResponse.redirect(new URL("/invoice", request.url));
    }

    return response
}

export const config = {
    matcher: ["/((?!auth|_next/static|_next/image|favicon.ico).*)"],
};