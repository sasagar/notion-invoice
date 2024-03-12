const UserLayout = ({ children, profile, notion }) => {
  return (
    <>
      <div className='flex gap-10 justify-center w-full p-16'>
        {/* {profile} */}
        {notion}
      </div>
      {children}
    </>
  );
};

export default UserLayout;
