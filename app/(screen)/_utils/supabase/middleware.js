import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export const createClient = request => {
  // Create an unmodified response
  // 変更されていないレスポンスを作成します。
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // If the cookie is updated, update the cookies for the request and response
          // クッキーが更新された場合、リクエストとレスポンスのクッキーを更新します。
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          // If the cookie is removed, update the cookies for the request and response
          // クッキーが削除された場合、リクエストとレスポンスのクッキーを更新します。
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    },
  );

  return { supabase, response };
};
