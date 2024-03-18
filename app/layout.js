import { M_PLUS_1 } from 'next/font/google';
import "./globals.css";

const mplus1 = M_PLUS_1({ subsets: ['latin'], display: 'swap' })

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "BKTSK Notion Invoice",
  description: "BKTSK専用Notionから請求書を吐き出す仕組み",
  robots: {
    index: false,
  }
};

export default function RootLayout({
  children
}) {
  return (
    <html lang="ja" className={mplus1.className}>
      <body className="min-h-screen text-stone-800 dark:text-slate-200">
        {children}
      </body>
    </html>
  );
}

