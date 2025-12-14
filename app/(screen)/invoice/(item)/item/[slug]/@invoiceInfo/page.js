import Image from 'next/image';

import getInvoiceItem from '@/app/(screen)/_utils/notion/getInvoiceItem';
import { plain_text } from '@/app/(screen)/_utils/properties/plain_text';
import dateFormat from '@/app/(screen)/_utils/properties/dateFormat';
import invoiceSanitizer from '@/app/(screen)/_utils/notion/invoiceSanitizer';

const InvoiceInfo = async props => {
  const params = await props.params;
  const { invoices, customer, account } = await getInvoiceItem(params.slug);

  const sanitizedInvoice = await invoiceSanitizer(invoices[0]);

  return (
    <section className='rounded border border-stone-600 dark:border-slate-600 bg-stone-100 dark:bg-slate-900 px-6 py-4 flex justify-between items-start mb-5'>
      <div className='flex-1'>
        <h2 className='text-2xl font-bold mb-3'>請求情報</h2>
        <div className='mb-2'>
          <h3 className='text-xl font-bold'>請求日</h3>
          <time dateTime={sanitizedInvoice.published_at}>
            {dateFormat(sanitizedInvoice.published_at)}
          </time>
        </div>
        <div>
          <h3 className='text-xl font-bold'>支払期限</h3>
          <time dateTime={sanitizedInvoice.due_to}>
            {dateFormat(sanitizedInvoice.due_to)}
          </time>
        </div>
      </div>
      <div className='flex-1'>
        <h2 className='text-2xl font-bold mb-3'>請求先</h2>
        <div className='mb-2'>
          <h3 className='text-xl font-bold'>顧客名</h3>
          <span>{plain_text(customer.properties.顧客名)}</span>
        </div>
        <div className='mb-2'>
          <h3 className='text-xl font-bold'>宛名</h3>
          <span>
            {plain_text(customer.properties['社名/個人名'])} {plain_text(customer.properties.敬称)}
          </span>
        </div>
        <div className='mb-2'>
          <h3 className='text-xl font-bold'>会社情報</h3>
          <span className='whitespace-pre-wrap'>
            {plain_text(customer.properties.会社情報)}
          </span>
        </div>
        <div className='mb-2'>
          <h3 className='text-xl font-bold'>担当者名</h3>
          <span>{plain_text(customer.properties.担当者名)}</span>
        </div>
      </div>
      <div className='flex-1'>
        <h2 className='text-2xl font-bold mb-3'>自社情報</h2>
        <div className='mb-2'>
          <h3 className='text-xl font-bold'>担当者名</h3>
          <span>{plain_text(account.properties.担当者名)}</span>
        </div>
        <div className='mb-2'>
          <h3 className='text-xl font-bold'>会社名</h3>
          <div className='flex items-center justify-start gap-2'>
            <span>{plain_text(account.properties.会社名)}</span>
            <Image
              src={account.properties.印鑑画像.files[0].file.url}
              alt={account.properties.印鑑画像.files[0].name}
              className='w-10 h-10 object-contain'
              width='1024'
              height='1024'
              priority='true'
            />
          </div>
        </div>
        <div className='mb-2'>
          <h3 className='text-xl font-bold'>会社情報</h3>
          <span className='whitespace-pre-wrap'>
            {plain_text(account.properties.会社情報)}
          </span>
        </div>
        <div className='mb-2'>
          <h3 className='text-xl font-bold'>口座情報</h3>
          <span className='whitespace-pre-wrap'>
            {plain_text(account.properties.銀行情報)}
          </span>
        </div>
        <div className='mb-2'>
          <h3 className='text-xl font-bold'>適格請求書 登録番号</h3>
          <span className='whitespace-pre-wrap'>
            {plain_text(account.properties.登録番号)
              ? plain_text(account.properties.登録番号)
              : '(未登録)'}
          </span>
        </div>
      </div>
    </section>
  );
};

export default InvoiceInfo;
