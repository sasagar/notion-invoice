import { Suspense } from 'react';

import getInvoiceItem from '@/app/(screen)/_utils/notion/getInvoiceItem';
import invoiceSanitizer from '@/app/(screen)/_utils/notion/invoiceSanitizer';
import dateTimeFormat from '@/app/(screen)/_utils/properties/dateTimeFormat';

import StatusTag from '@/app/(screen)/invoice/_components/statusTag';
import PdfDownload from '../_components/pdfDownload';

const InvoiceHeader = async ({ params }) => {
  const Loading = (
    <section className='rounded border border-slate-600 bg-slate-900 px-6 py-4 flex justify-between items-center mb-5 gap-6'>
      <div className=''>
        <div className='flex justify-start items-center gap-5 flex-wrap'>
          <div className='skeleton rounded h-8 w-60' />
          <div className='skeleton rounded-full h-7 w-32' />
        </div>
        <div className='mt-5'>
          <div className='skeleton rounded h-8 w-48' />
        </div>
      </div>
      <div className='flex flex-col items-end gap-2'>
        <div className='skeleton rounded-full h-4 w-32' />
        <div className='skeleton rounded-full h-4 w-60' />
      </div>
    </section>
  );

  const { invoices, customer, account } = await getInvoiceItem(params.slug);
  const sanitizedInvoice = await invoiceSanitizer(invoices[0]);

  return (
    <Suspense fallback={Loading}>
      <section className='rounded border border-slate-600 bg-slate-900 px-6 py-4 flex justify-between items-center mb-5 gap-6'>
        <div className=''>
          <div className='flex justify-start items-center gap-5 flex-wrap'>
            <h1 className='text-3xl font-bold'>{sanitizedInvoice.title}</h1>
            <StatusTag status={sanitizedInvoice.status} />
          </div>
          <div className='mt-5 flex gap-3'>
            <PdfDownload
              number={sanitizedInvoice.id}
              customer={customer}
              account={account}
            />
          </div>
        </div>
        <div className='flex flex-col items-end'>
          <div>#{sanitizedInvoice.id}</div>
          <div className='text-right'>
            最終更新日:{' '}
            <span className='font-bold'>
              {dateTimeFormat(sanitizedInvoice.updated_at)}
            </span>
          </div>
        </div>
      </section>
    </Suspense>
  );
};

export default InvoiceHeader;
