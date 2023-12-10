import Link from 'next/link'
import { createClient } from '@/app/(screen)/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const Header = async () => {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const signOut = async () => {
        'use server'

        const cookieStore = cookies()
        const supabase = createClient(cookieStore)
        await supabase.auth.signOut()
        return redirect('/login')
    }

    return user ? (
        <div className='w-10/12 max-w-screen-xl mx-auto flex justify-between items-center'>
            <h1 className='text-2xl font-bold'>BKTSK Notion Invoice</h1>
            <nav>
                <ul className='flex gap-6'>
                    <li>
                        <Link href="/invoice">請求書一覧</Link>
                    </li>
                    <li>
                        <form action={signOut}>
                            <button className="">
                                ログアウト
                            </button>
                        </form>
                    </li>
                </ul>
            </nav>
        </div>
    ) : (
        <div className='w-10/12 max-w-screen-xl mx-auto flex justify-between'>
            <h1 className='text-2xl font-bold'>BKTSK Notion Invoice</h1>
            <nav>
                <ul>
                    <li>
                        <Link href="/login">ログイン</Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default Header;