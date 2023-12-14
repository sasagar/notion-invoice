import getAllInvoices from '@/app/(screen)/_utils/notion/getAllInvoices';
import InvoiceListRow from '@/app/(screen)/invoice/_components/InvoiceListRow';

import Pagenation from '@/app/(screen)/invoice/_components/Pagenation';

export const revalidate = 30 // キャッシュの有効期限30秒

const InvoicePage = async ({ params }) => {
    const invoices = await getAllInvoices();

    const paged = params.page * 1;
    console.log(`[Listing] Page: ${paged}`)
    const perPage = process.env.NEXT_PUBLIC_PER_PAGE;

    const start = (paged - 1) * perPage;
    const end = start + perPage;

    const slice = invoices.slice(start, end);

    return (
        <div className='w-10/12 mx-auto'>
            <div className='flex justify-between items-center'>
                <h1 className="heading text-2xl font-bold">Invoices</h1>
                <Pagenation />
            </div>
            <InvoiceListRow invoices={slice} />
        </div>
    )
}

export default InvoicePage;
