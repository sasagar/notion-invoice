import Header from "@/app/(screen)/components/Header";
import './style.css';

export const revalidate = 30 // キャッシュの有効期限30秒

export default function ScreenLayout({
    children
}) {
    return (
        <>
            <header className='w-full bg-slate-800 border-b border-slate-700 h-12 flex items-center mb-5 shadow shadow-slate-900 fixed'>
                <Header />
            </header>
            <main className="flex min-h-full w-full pt-20">
                {children}
            </main>
        </>
    );
}

