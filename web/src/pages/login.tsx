import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-bold mb-6">ログイン</h1>
      <LoginForm />
    </main>
  );
}

export const getConfig = async () => ({ render: "static" as const });
