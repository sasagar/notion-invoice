'use client'

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link'
// import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
// import { createClient } from '@/app/(screen)/utils/supabase/server'
// import HeaderInner from './HeaderInner'
import { createClient } from '../utils/supabase/client';

const Header = () => {
    // const [userInfo, setUserInfo] = useState(null);

    // const cookieStore = document.cookie
    // const supabase = createClient(cookieStore)
    const [supabase] = useState(() => createClient());
    // async () => { console.log(await supabase.auth.getUser()) }

    // const getUser = async () => { return await supabase.auth.getUser() };

    // const userInfo = useCallback(async () => {
    //     const {
    //         data: { user },
    //     } = await supabase.auth.getUser()
    //     // } = await getUser();
    //     return user;
    // }, [supabase.auth])

    // setUserInfo(user);


    // サインアウト処理
    const signOut = async () => {
        // 'use server'

        // const supabase = createClient(cookieStore)
        const supabase = createClient()
        await supabase.auth.signOut()
        return redirect('/login')
    }

    // ログイン中のコンポーネント
    const loggedinComponent = useCallback(() => {
        return (
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
        );
    }, [])

    // ログアウト中のコンポーネント
    const loggedoutComponent = useCallback(() => {
        return (
            <nav>
                <ul>
                    <li>
                        <Link href="/login">ログイン</Link>
                    </li>
                </ul>
            </nav>
        );
    }, [])

    const [navComponent, setNavComponent] = useState(() => { loggedoutComponent })

    const navigationComponent = useCallback(async () => {
        // const supabaseUser = await userInfo();

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (user) {
            setNavComponent(loggedinComponent)
        } else {
            setNavComponent(loggedoutComponent)
        }
    }, [loggedinComponent, loggedoutComponent, supabase.auth])

    // useStateで上手いこと
    useEffect(() => {
        // userInfo().then(user => {
        //     navigationComponent(user);
        // });
        const userInfo = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            return user;
        }
        userInfo().then(user => {
            navigationComponent(user);
        })

    }, [navigationComponent, supabase.auth]);

    // コンポーネントを返す
    return (
        <div className='w-10/12 max-w-screen-xl mx-auto flex justify-between items-center'>
            <h1 className='text-2xl font-bold'><Link href="/">BKTSK Notion Invoice</Link></h1>
            {navComponent}
        </div>
    );

    // return user ? (
    //     <div className='w-10/12 max-w-screen-xl mx-auto flex justify-between items-center'>
    //         <h1 className='text-2xl font-bold'><Link href="/">BKTSK Notion Invoice</Link></h1>
    //         <nav>
    //             <ul className='flex gap-6'>
    //                 <li>
    //                     <Link href="/invoice">請求書一覧</Link>
    //                 </li>
    //                 <li>
    //                     <form action={signOut}>
    //                         <button className="">
    //                             ログアウト
    //                         </button>
    //                     </form>
    //                 </li>
    //             </ul>
    //         </nav>
    //     </div>
    // ) : (
    //     <div className='w-10/12 max-w-screen-xl mx-auto flex justify-between items-center'>
    //         <h1 className='text-2xl font-bold'><Link href="/">BKTSK Notion Invoice</Link></h1>
    //         <nav>
    //             <ul>
    //                 <li>
    //                     <Link href="/login">ログイン</Link>
    //                 </li>
    //             </ul>
    //         </nav>
    //     </div>
    // )
}

export default Header;