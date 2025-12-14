import { headers } from 'next/headers';

export const revalidate = 30; // キャッシュの有効期限30秒

export const generateMetadata = async () => {
  const headersList = await headers();

  const url = headersList.get('x-url') || null;
  const pathName = url
    .replace(/\\/g, '/')
    .replace(/^[^/]*\/\/[^/]*/, '')
    .replace(/[?#].*?$/, '');
  const pathNameArray = pathName.split('/');

  return {
    title: `Invoice #${pathNameArray[2]} | BKTSK Notion Invoice`,
  };
};

const invoiceSlugLayout = ({
  // children,
  invoiceHeader,
  invoiceInfo,
  invoiceDetail,
}) => {
  return (
    <article className='mr-8'>
      {invoiceHeader}
      {invoiceInfo}
      {invoiceDetail}
    </article>
  );
};

export default invoiceSlugLayout;
