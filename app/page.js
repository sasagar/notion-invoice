import Header from "./(screen)/_components/Header";

import './(screen)/style.css'

export default async function Index() {
  return (
    <>
      <header className='w-full bg-slate-800 border-b border-slate-700 h-12 flex items-center mb-5 shadow shadow-slate-900 fixed'>
        <Header />
      </header>
      <main className="flex min-h-full w-full pt-20">
        <div className="w-full text-center">
          <h1 className="text-3xl font-bold leading-loose">BKTSK 請求書発行システム</h1>
          <p>専用の請求書発行システムです。ログインして利用して下さい。</p>
        </div>
      </main>
    </>
  );
}

