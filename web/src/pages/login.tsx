import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md py-8">
      <div className="rounded-lg border border-paper-line bg-white/70 p-8 dark:border-slate-800 dark:bg-slate-900/40">
        <h1 className="mb-6 font-display text-2xl font-bold text-kent-blue-500 dark:text-kent-blue-200">
          ログイン
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}

export const getConfig = async () => ({ render: "static" as const });
