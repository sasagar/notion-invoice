'use client';
import { useState } from 'react';
import { redirect } from 'next/navigation';

import { createClient } from '@/app/(screen)/_utils/supabase/client';

import { Turnstile } from '@marsidev/react-turnstile';

const AuthForm = ({ searchParams }) => {
  const [captchaToken, setCaptchaToken] = useState();
  const supabase = createClient();

  const signIn = async formData => {
    const email = formData.get('email');
    const password = formData.get('password');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken,
      },
    });

    if (error) {
      const redirectPath = encodeURI(
        '/auth/login?message=ユーザー認証できませんでした',
      );
      return redirect(redirectPath);
    }

    return redirect('/');
  };

  return (
    <div className='flex flex-col w-full px-8 sm:max-w-md justify-center items-center gap-2 mx-auto'>
      <form
        className='animate-in flex flex-col justify-center gap-2 text-foreground'
        action={signIn}
      >
        <label className='text-md' htmlFor='email'>
          メールアドレス
        </label>
        <input
          className='rounded-md px-4 py-2 bg-inherit border mb-6'
          name='email'
          placeholder='you@example.com'
          required
        />
        <label className='text-md' htmlFor='password'>
          パスワード
        </label>
        <input
          className='rounded-md px-4 py-2 bg-inherit border mb-6'
          type='password'
          name='password'
          placeholder='••••••••'
          required
        />
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          onSuccess={token => {
            setCaptchaToken(token);
          }}
        />
        <button
          type='submit'
          className='bg-green-700 hover:bg-green-600 text-green-100 rounded-md px-4 py-2 text-foreground mb-2 transition-all'
        >
          ログイン
        </button>
        {searchParams?.message && (
          <p className='mt-4 p-4 bg-foreground/10 text-foreground text-center'>
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  );
};

export default AuthForm;
