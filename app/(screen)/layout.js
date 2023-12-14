import Header from '@/app/(screen)/_components/Header';
import './style.css';
import './load.css'

export const revalidate = 30 // キャッシュの有効期限30秒

export default function ScreenLayout({
    children,
}) {
    return (
        <div className="flex flex-col gap-5 min-h-screen">
            <header className='w-full bg-slate-800 border-b border-slate-700 h-12 flex items-center mb-5 shadow shadow-slate-900 fixed'>
                <Header />
            </header>
            <main className="flex min-h-full w-full pt-20">
                {children}
            </main>
            <footer className="flex justify-center items-center w-full h-12 bg-slate-900/50 border-t border-slate-700 mt-auto">
                <p className="text-slate-300">© 2023 Notion Invoice</p>
            </footer>
        </div>
    );
}

