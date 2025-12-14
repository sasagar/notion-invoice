import Header from '@/app/(screen)/_components/Header';
import './style.css';
import './load.css';

export const revalidate = 30; // キャッシュの有効期限30秒

export default function ScreenLayout({ children }) {
  return (
    <div className='flex flex-col gap-5 min-h-screen'>
      <header className='w-full bg-stone-200 dark:bg-slate-800 border-b border-stone-300 dark:border-slate-700 h-12 flex items-center mb-5 shadow shadow-stone-800 dark:shadow-slate-900 fixed'>
        <Header />
      </header>
      <main className='flex min-h-full w-full pt-20'>{children}</main>
      <footer className='flex justify-center items-center w-full h-12 bg-stone-200/50 dark:bg-slate-900/50 border-t border-slate-700 mt-auto'>
        <p className='text-stone-400 dark:text-slate-300'>
          © 2023 BKTSK Notion Invoice
        </p>
      </footer>
    </div>
  );
}
