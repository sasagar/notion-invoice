import getAllInvoices from '@/app/(screen)/_utils/notion/getAllInvoices';
import InvoiceListRow from '@/app/(screen)/invoice/_components/InvoiceListRow';

export const revalidate = 30; // キャッシュの有効期限30秒

const InvoicePage = async ({ params }) => {
  const invoices = await getAllInvoices();

  const paged = params.page * 1;
  console.log(`[Listing] Page: ${paged}`);
  const perPage = process.env.NEXT_PUBLIC_PER_PAGE;

  const start = (paged - 1) * perPage;
  const end = start + perPage;

  const slice = invoices.slice(start, end);

  return <InvoiceListRow invoices={slice} />;
};

export default InvoicePage;
