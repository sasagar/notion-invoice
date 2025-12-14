import AuthForm from './auth-form';

const Login = async props => {
  const searchParams = await props.searchParams;

  return <AuthForm searchParams={searchParams} />;
};

export default Login;
