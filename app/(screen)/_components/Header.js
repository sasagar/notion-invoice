'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/(screen)/_utils/supabase/client';
import md5 from 'crypto-js/md5';

const Header = () => {
  const [supabase] = useState(() => createClient());
  const [imgmd5, setImgmd5] = useState(null);

  // サインアウト処理
  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect('/');
  };

  // ユーザー情報取得
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setImgmd5(md5(user.email).toString());
        }
      } catch (error) {
        console.error(error);
      }
    };
    getUser();
  }, [supabase.auth]);

  // ログイン中のコンポーネント
  const loggedinComponent = useCallback(() => {
    return (
      <nav>
        <ul className='flex items-center gap-6'>
          <li>
            <Link
              href='/invoice'
              className='text-stone-800 dark:text-slate-100 hover:text-stone-600 dark:hover:text-slate-300'
            >
              請求書一覧
            </Link>
          </li>
          <li>
            <form action={signOut}>
              <button
                type='submit'
                className='text-stone-800 dark:text-slate-100 hover:text-stone-600 dark:hover:text-slate-300'
              >
                ログアウト
              </button>
            </form>
          </li>
          <li>
            <Link href='/user'>
              <div className='rounded-full h-9 w-9 bg-slate-500 border border-slate-400 overflow-hidden'>
                <Image
                  src={`https://www.gravatar.com/avatar/${imgmd5}?s=36`}
                  width='36'
                  height='36'
                  alt='user'
                />
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
            <Link
              href='/auth/login'
              className='text-stone-800 dark:text-slate-100 hover:text-stone-500 dark:hover:text-slate-300'
            >
              ログイン
            </Link>
          </li>
        </ul>
      </nav>
    );
  };

  const [navComponent, setNavComponent] = useState(() => loggedoutComponent());

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

  // ナビゲーションコンポーネントの切り替え
  useEffect(() => {
    navigationComponent();
  }, [navigationComponent]);

  // コンポーネントを返す
  return (
    <div className='w-10/12 max-w-7xl mx-auto flex justify-between items-center'>
      <h1 className='text-2xl font-bold text-black dark:text-white'>
        <Link href='/'>
          <svg className='h-8' viewBox='0 0 583.16 90'>
            <path
              d='M249.14,13.01h14.88c10.32,0,12.82,3.79,12.82,7.92s-2.74,7.49-7.87,8.83c3.17.82,5.47,3.17,5.47,6.62,0,5.66-4.51,10.22-16.03,10.22h-18.29l9.02-33.6ZM258.74,38.11c2.74,0,4.37-1.2,4.37-2.88,0-1.44-1.2-2.11-3.6-2.11h-4.85l-1.34,4.99h5.42ZM261.72,26.21c2.88,0,4.18-1.3,4.18-2.74s-1.06-1.97-3.46-1.97h-4.66l-1.25,4.7h5.18Z'
              fill='#ffc000'
            />
            <path
              d='M283.81,13.01h11.23l-3.26,12.05,11.19-12.05h13.68l-15.31,15.36,7.01,18.24h-11.95l-4.03-10.8-4.7,4.71-1.63,6.1h-11.23l9.02-33.6Z'
              fill='#ffc000'
            />
            <path
              d='M324.75,22.51h-9.89l2.54-9.5h31.01l-2.54,9.5h-9.89l-6.48,24.1h-11.23l6.48-24.1Z'
              fill='#ffc000'
            />
            <path
              d='M341.63,41.19l6.43-7.68c3.84,3.22,7.78,4.75,11.33,4.75,1.44,0,2.45-.53,2.45-1.49,0-1.06-.62-1.39-5.52-3.22-6.24-2.3-9.17-4.51-9.17-9.46,0-6.48,5.95-11.76,15.12-11.76,6,0,11.33,1.92,14.98,5.04l-6.43,7.68c-2.54-2.06-6.14-3.75-9.7-3.75-1.44,0-2.45.38-2.45,1.34s.72,1.2,5.38,2.93c5.71,2.11,9.36,4.51,9.36,9.65,0,6.77-5.57,12.05-15.22,12.05-6.67,0-12.48-2.4-16.56-6.1Z'
              fill='#ffc000'
            />
            <path
              d='M382.6,13.01h11.23l-3.26,12.05,11.18-12.05h13.68l-15.31,15.36,7.01,18.24h-11.95l-4.03-10.8-4.7,4.71-1.63,6.1h-11.23l9.02-33.6Z'
              fill='#ffc000'
            />
            <path
              d='M238.43,52.01h10.51l7.63,16.03,4.32-16.03h11.14l-9.02,33.6h-9.98l-7.97-16.71-4.51,16.71h-11.14l9.02-33.6Z'
              fill='currentColor'
            />
            <path
              d='M269.39,74.04c0-8.02,6.58-15.27,15.7-15.27,8.26,0,13.1,5.38,13.1,12.19,0,8.02-6.58,15.27-15.7,15.27-8.26,0-13.1-5.38-13.1-12.19ZM287.92,71.45c0-2.21-1.39-3.79-3.5-3.79-2.74,0-4.75,2.78-4.75,5.9,0,2.21,1.39,3.79,3.5,3.79,2.74,0,4.75-2.79,4.75-5.9Z'
              fill='currentColor'
            />
            <path
              d='M300.55,79.03c0-1.1.19-2.3.53-3.65l2.02-7.58h-3.07l2.26-8.4h3.07l1.78-6.58h10.9l-1.78,6.58h6.05l-2.26,8.4h-6.05l-1.49,5.62c-.24.86-.34,1.49-.34,2.02,0,1.1.67,1.68,2.21,1.68.86,0,1.63-.14,3.17-.58l-2.35,8.88c-1.87.48-3.7.77-5.52.77-6.14,0-9.12-2.35-9.12-7.15Z'
              fill='currentColor'
            />
            <path
              d='M325.65,59.4h10.9l-7.01,26.21h-10.9l7.01-26.21ZM327.85,50.57h11.28l-1.87,6.96h-11.28l1.87-6.96Z'
              fill='currentColor'
            />
            <path
              d='M335.43,74.04c0-8.02,6.58-15.27,15.7-15.27,8.26,0,13.1,5.38,13.1,12.19,0,8.02-6.58,15.27-15.7,15.27-8.26,0-13.1-5.38-13.1-12.19ZM353.96,71.45c0-2.21-1.39-3.79-3.5-3.79-2.74,0-4.75,2.78-4.75,5.9,0,2.21,1.39,3.79,3.5,3.79,2.74,0,4.75-2.79,4.75-5.9Z'
              fill='currentColor'
            />
            <path
              d='M370.29,59.4h10.9l-.86,3.26c1.73-2.11,4.56-3.89,7.82-3.89,4.8,0,7.49,3.12,7.49,8.02,0,1.34-.19,2.83-.62,4.42l-3.84,14.4h-10.9l3.5-13.06c.19-.67.29-1.44.29-1.97,0-1.39-.72-2.3-2.3-2.3-2.16,0-3.31,1.44-4.08,4.27l-3.5,13.06h-10.9l7.01-26.21Z'
              fill='currentColor'
            />
            <path
              d='M415.51,52.01h11.23l-9.02,33.6h-11.23l9.02-33.6Z'
              fill='currentColor'
            />
            <path
              d='M428.97,59.4h10.9l-.86,3.26c1.73-2.11,4.56-3.89,7.83-3.89,4.8,0,7.49,3.12,7.49,8.02,0,1.34-.19,2.83-.62,4.42l-3.84,14.4h-10.9l3.5-13.06c.19-.67.29-1.44.29-1.97,0-1.39-.72-2.3-2.3-2.3-2.16,0-3.31,1.44-4.08,4.27l-3.5,13.06h-10.9l7.01-26.21Z'
              fill='currentColor'
            />
            <path
              d='M456.85,59.4h11.18l.72,13.15,7.78-13.15h11.52l-17.67,26.4h-9.99l-3.55-26.4Z'
              fill='currentColor'
            />
            <path
              d='M483.97,74.04c0-8.02,6.58-15.27,15.7-15.27,8.26,0,13.11,5.38,13.11,12.19,0,8.02-6.58,15.27-15.7,15.27-8.26,0-13.11-5.38-13.11-12.19ZM502.5,71.45c0-2.21-1.39-3.79-3.5-3.79-2.74,0-4.75,2.78-4.75,5.9,0,2.21,1.39,3.79,3.5,3.79,2.74,0,4.75-2.79,4.75-5.9Z'
              fill='currentColor'
            />
            <path
              d='M518.87,59.4h10.9l-7.01,26.21h-10.9l7.01-26.21ZM521.08,50.57h11.28l-1.87,6.96h-11.28l1.87-6.96Z'
              fill='currentColor'
            />
            <path
              d='M528.57,75.1c0-9.03,7.01-16.27,16.08-16.27,6.34,0,10.42,3.65,11.43,8.54l-8.64,3.46c-.48-2.06-1.58-3.17-3.36-3.17-3.12,0-5.14,3.36-5.14,6.53,0,1.97,1.25,3.22,2.98,3.22,1.54,0,2.69-.72,3.98-2.21l7.35,4.9c-2.59,3.74-6.38,6.19-12.39,6.19-7.01,0-12.29-4.13-12.29-11.18Z'
              fill='currentColor'
            />
            <path
              d='M569.48,78.55c1.78,0,3.46-.72,5.28-2.11l5.04,5.52c-2.98,2.64-6.62,4.27-11.23,4.27-7.97,0-12.87-4.66-12.87-11.52,0-7.97,5.95-15.94,15.94-15.94,8.64,0,11.52,5.86,11.52,11.38,0,1.73-.29,3.41-.77,4.9h-16.85c.14,2.11,1.49,3.5,3.94,3.5ZM573.61,70.25c.14-.38.19-.77.19-1.15,0-1.44-1.06-2.78-2.83-2.78-1.63,0-3.74,1.01-4.75,3.94h7.39Z'
              fill='currentColor'
            />
            <path
              d='M191.12,0l-24.12,90h33l20.71-77.28c1.72-6.42-3.12-12.72-9.76-12.72h-19.84Z'
              fill='currentColor'
            />
            <path
              d='M161.12,0l-14.74,55,3.8-44.14c.5-5.84-4.1-10.86-9.96-10.86h-31.1l-24.12,90h20l14.74-55-4.74,55h42l20.73-77.35c1.71-6.38-3.1-12.65-9.7-12.65h-6.91Z'
              fill='currentColor'
            />
            <path
              d='M86.15,0H24.12L0,90h67.29c4.55,0,8.52-3.05,9.7-7.44l5.33-19.88c1.71-6.39-3.1-12.67-9.72-12.67h-16.88l27.41-8.39c3.28-1,5.81-3.63,6.7-6.94l5.93-22.15c1.69-6.32-3.07-12.52-9.61-12.52Z'
              fill='#ffc000'
            />
          </svg>
        </Link>
      </h1>
      <>{navComponent}</>
    </div>
  );
};

export default Header;
