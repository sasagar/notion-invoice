const UserLayout = ({children, notion }) => {
  return (
    <>
      <div className='flex gap-10 justify-center w-full p-16'>
        {notion}
      </div>children
    </>
  );
};

export default UserLayout;
