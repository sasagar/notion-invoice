import getSession from './get_session';
import ClientProfileComponent from './client';

const Profile = async () => {
  const session = await getSession();

  return <ClientProfileComponent session={session} />;
};

export default Profile;
