'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/(screen)/_utils/supabase/client';
import md5 from 'crypto-js/md5';

const Header = () => {
  const [supabase] = useState(() => createClient());
  const [userEmail, setUserEmail] = useState(null);
  const [imgmd5, setImgmd5] = useState(null);

  // サインアウト処理
  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect('/');
  };

  const getUser = useCallback(async () => {
    try {
      const userData = await supabase.auth.getUser();
      setUserEmail(userData.data.user.email);
      setImgmd5(md5(userEmail).toString());
    } catch (error) {
      console.error(error);
    }
  }, [supabase.auth, userEmail])
  
  getUser();

  // ログイン中のコンポーネント
  const loggedinComponent = useCallback(() => {
    return (
      <nav>
        <ul className='flex items-center gap-6'>
          <li>
            <Link href='/invoice' class="text-stone-800 dark:text-slate-100 hover:text-stone-600 dark:hover:text-slate-300">請求書一覧</Link>
          </li>
          <li>
            <form action={signOut}>
              <button type='submit' class="text-stone-800 dark:text-slate-100 hover:text-stone-600 dark:hover:text-slate-300">ログアウト</button>
            </form>
          </li>
          <li>
            <Link href='/user'>
              <div className='rounded-full h-9 w-9 bg-slate-500 border border-slate-400 overflow-hidden'>
                <Image src={`https://www.gravatar.com/avatar/${imgmd5}?s=36`} width="36" height="36" alt="user" />
              </div>
            </Link>
          </li>
        </ul>
      </nav>
    );
  }, [imgmd5]);

  // ログアウト中のコンポーネント
  const loggedoutComponent = () => {
    return (
      <nav>
        <ul>
          <li>
            <Link href='/auth/login' class="text-stone-800 dark:text-slate-100 hover:text-stone-500 dark:hover:text-slate-300">ログイン</Link>
          </li>
        </ul>
      </nav>
    );
  };

  const [navComponent, setNavComponent] = useState(() => {
    loggedoutComponent;
  });

  const navigationComponent = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setNavComponent(loggedinComponent);
    } else {
      setNavComponent(loggedoutComponent);
    }
  }, [loggedinComponent, supabase.auth]);

  // useStateで上手いこと
  useEffect(() => {
    const userInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    };
    userInfo().then(user => {
      navigationComponent(user);
    });
  }, [navigationComponent, supabase.auth]);

  // コンポーネントを返す
  return (
    <div className='w-10/12 max-w-screen-xl mx-auto flex justify-between items-center'>
      <h1 className='text-2xl font-bold'>
        <Link href='/'>BKTSK Notion Invoice</Link>
      </h1>
      <>
        {navComponent}
      </>
    </div>
  );
};

export default Header;
