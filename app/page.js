import AuthButton from "./(screen)/components/AuthButton";

export default async function Index() {
  return (
    <div className="w-full flex justify-center">
      <nav>
        Supabase SSR 認証でのログイン
        <AuthButton />
      </nav>
    </div>
  );
}

