import getAllInvoices from '../utils/notion/getAllInvoices';
import InvoiceListRow from '@/app/(screen)/components/InvoiceListRow';

export const revalidate = 30 // キャッシュの有効期限30秒

const Invoice = async () => {
    const invoices = await getAllInvoices();

    return (
        <div className='w-10/12 mx-auto'>
            <h1 className="heading text-2xl font-bold">Invoices</h1>
            <InvoiceListRow invoices={invoices} />
        </div>
    )
}

export default Invoice;
