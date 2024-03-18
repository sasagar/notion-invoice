import Link from 'next/link';
import { Suspense } from 'react';
import { parseISO, format } from 'date-fns';
import ja from 'date-fns/locale/ja';

import { plain_text } from '@/app/(screen)/_utils/properties/plain_text';
import { get_customer } from '@/app/(screen)/_utils/properties/get_customer';

import StatusTag from './statusTag';
import InvoiceListRowItemLoading from './InvoiceListRowItemLoading';

const InvoiceListRowItem = ({ invoice }) => {
  const customer_name = get_customer(invoice.properties.顧客.relation[0].id);
  const due_to = invoice.properties.支払い期限日.date.start;
  const due_to_format = format(
    parseISO(invoice.properties.支払い期限日.date.start),
    'yyyy年MMMdo (eeeee)',
    { locale: ja },
  );
  return (
    <Link href={`/invoice/item/${plain_text(invoice.properties.請求書番号)}`}>
      <Suspense fallback={<InvoiceListRowItemLoading />}>
        <section className='mt-4 border rounded border-stone-700 dark:border-slate-700 px-6 py-4 bg-stone-100 dark:bg-slate-900 shadow shadow-stone-600 dark:shadow-slate-900'>
          <div className='flex justify-between'>
            <h2 className='text-xl font-bold leading-8'>
              {plain_text(invoice.properties.件名)}
            </h2>
            <StatusTag status={plain_text(invoice.properties.ステータス)} />
          </div>
          <div className='flex justify-between'>
            <span className='text-sm'>
              #{plain_text(invoice.properties.請求書番号)}
            </span>

            <span className='text-sm'>
              顧客: <span className='font-bold'>{customer_name}</span>
            </span>

            <span className='text-sm'>
              支払期限:{' '}
              <time className='font-bold' dateTime={due_to}>
                {due_to_format}
              </time>
            </span>
          </div>
        </section>
      </Suspense>
    </Link>
  );
};

export default InvoiceListRowItem;
