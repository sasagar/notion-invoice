'use client';
// import { headers, cookies } from 'next/headers'
import { useState } from 'react'

// import { createClient } from '../utils/supabase/server'
import { createClient } from '../utils/supabase/client'
import { redirect } from 'next/navigation'

import { Turnstile } from '@marsidev/react-turnstile'


export default function Login({ searchParams }) {
    const [captchaToken, setCaptchaToken] = useState()

    const signIn = async (formData) => {
        // 'use server'

        const email = formData.get('email')
        const password = formData.get('password')
        // const cookieStore = cookies()
        // const supabase = createClient(cookieStore)
        const supabase = createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: {
                captchaToken
            }
        })

        if (error) {
            const redirectPath = encodeURI('/login?message=ユーザー認証できませんでした');
            return redirect(redirectPath);
        }

        return redirect('/')
    }

    // const signUp = async (formData) => {
    //     'use server'

    //     const origin = headers().get('origin')
    //     const email = formData.get('email')
    //     const password = formData.get('password')
    //     const cookieStore = cookies()
    //     const supabase = createClient(cookieStore)

    //     const { error } = await supabase.auth.signUp({
    //         email,
    //         password,
    //         options: {
    //             emailRedirectTo: `${origin}/auth/callback`,
    //         },
    //     })

    //     if (error) {
    //         return redirect('/login?message=ユーザー認証できませんでした')
    //     }

    //     return redirect('/login?message=メールを確認して続行してください')
    // }

    return (
        <div className="flex flex-col w-full px-8 sm:max-w-md justify-center items-center gap-2 mx-auto">
            {/* <Link
                href="/"
                className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>{' '}
                Back
            </Link> */}

            <form
                className="animate-in flex flex-col justify-center gap-2 text-foreground"
                action={signIn}
            >
                <label className="text-md" htmlFor="email">
                    メールアドレス
                </label>
                <input
                    className="rounded-md px-4 py-2 bg-inherit border mb-6"
                    name="email"
                    placeholder="you@example.com"
                    required
                />
                <label className="text-md" htmlFor="password">
                    パスワード
                </label>
                <input
                    className="rounded-md px-4 py-2 bg-inherit border mb-6"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                />
                <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onSuccess={(token) => { setCaptchaToken(token) }} />
                <button className="bg-green-700 hover:bg-green-600 text-green-100 rounded-md px-4 py-2 text-foreground mb-2 transition-all">
                    ログイン
                </button>
                {/* <button
                    formAction={signUp}
                    className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2"
                >
                    Sign Up
                </button> */}
                {searchParams?.message && (
                    <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
                        {searchParams.message}
                    </p>
                )}
            </form>
        </div>
    )
}

