import AuthForm from './auth-form';

const Login = ({ searchParams }) => {
  // const signUp = async (formData) => {
  //     'use server'

  //     const origin = headers().get('origin')
  //     const email = formData.get('email')
  //     const password = formData.get('password')
  //     const cookieStore = cookies()
  //     const supabase = createClient(cookieStore)

  //     const { error } = await supabase.auth.signUp({
  //         email,
  //         password,
  //         options: {
  //             emailRedirectTo: `${origin}/auth/callback`,
  //         },
  //     })

  //     if (error) {
  //         return redirect('/auth/login?message=ユーザー認証できませんでした')
  //     }

  //     return redirect('/auth/login?message=メールを確認して続行してください')
  // }

  return <AuthForm searchParams={searchParams} />;
};

export default Login;
