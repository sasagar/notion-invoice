import { getServerSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getServerSession();
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold mb-4">BKTSK Notion Invoice</h1>
      {session ? (
        <p>
          ログイン中: <strong>{session.user.email}</strong>
        </p>
      ) : (
        <a href="/login" className="text-kent-blue-500 underline">
          ログイン
        </a>
      )}
    </main>
  );
}

export const getConfig = async () => ({ render: "dynamic" as const });
