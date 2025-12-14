import { createServerClient } from '@supabase/ssr';

export const createClient = cookieStore => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            // `set` メソッドはサーバーコンポーネントから呼び出されました。
            // ユーザーセッションを更新するミドルウェアがある場合は、無視できます。
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            // `delete` メソッドはサーバーコンポーネントから呼び出されました。
            // ユーザーセッションを更新するミドルウェアがある場合は、無視できます。
          }
        },
      },
    },
  );
};
