import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md py-8">
      <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-6 text-2xl font-bold">ログイン</h1>
        <LoginForm />
      </div>
    </div>
  );
}

export const getConfig = async () => ({ render: "static" as const });
