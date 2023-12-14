import { createClient } from "@/app/(screen)/_utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request) {
    // The `/auth/callback` route is required for the server-side auth flow implemented
    // by the Auth Helpers package. It exchanges an auth code for the user's session.
    // `/auth/callback` ルートは、Auth Helpers パッケージによって実装されたサーバーサイドの認証フローに必要です。
    // 認証コードをユーザーのセッションに交換します。
    // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-sign-in-with-code-exchange
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);
        await supabase.auth.exchangeCodeForSession(code);
    }

    // URL to redirect to after sign in process completes
    // サインインプロセスが完了した後にリダイレクトする URL
    return NextResponse.redirect(requestUrl.origin);
}

