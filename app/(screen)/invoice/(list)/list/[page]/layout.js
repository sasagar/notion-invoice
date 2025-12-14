import Pagenation from '@/app/(screen)/invoice/_components/Pagenation';

export const revalidate = 30; // キャッシュの有効期限30秒

const InvoicePLayout = async props => {
  const params = await props.params;

  const {
    children
  } = props;

  return (
    <div className='w-10/12 mx-auto'>
      <div className='flex justify-between items-center'>
        <h1 className='heading text-2xl font-bold'>Invoices</h1>
        <Pagenation params={params} />
      </div>

      {children}
    </div>
  );
};

export default InvoicePLayout;
