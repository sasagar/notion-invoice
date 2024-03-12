import Pagenation from '@/app/(screen)/invoice/_components/Pagenation';

export const revalidate = 30; // キャッシュの有効期限30秒

const InvoicePLayout = ({ children, params }) => {
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
