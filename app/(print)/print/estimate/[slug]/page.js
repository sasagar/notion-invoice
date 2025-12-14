import Image from 'next/image';

import getInvoiceItem from '@/app/(screen)/_utils/notion/getInvoiceItem';
import invoiceSanitizer from '@/app/(screen)/_utils/notion/invoiceSanitizer';
import getInvoiceRow from '@/app/(screen)/_utils/notion/getInvoiceRow';
import dateFormat from '@/app/(screen)/_utils/properties/dateFormat';

import { plain_text } from '@/app/(screen)/_utils/properties/plain_text';

import CustomerInfo from './_components/customerInfo';
import CustomerPerson from './_components/customerPerson';
import AccountInfo from './_components/accountInfo';
import PrintTaxTable from './_components/printTaxTable';
import PrintWithHoldingTable from './_components/printWithHoldingTable';
import PrintWithHoldingRow from './_components/printWithHoldingRow';

export const revalidate = 30; // キャッシュの有効期限30秒

const invoicePrintPage = async props => {
  const params = await props.params;
  const { invoices, customer, account } = await getInvoiceItem(params.slug);
  const sanitizedInvoice = await invoiceSanitizer(invoices[0]);
  const rows = await getInvoiceRow(sanitizedInvoice.items);

  return (
    <>
      <section className='border-t-[5mm] border-b-[2mm] border-kent-blue-500 py-4 px-4 mb-4 flex justify-between items-center break-inside-avoid-page'>
        <h1 className='text-3xl font-bold'>見積書</h1>
        <div className='text-right text-sm'>
          <p>#ES-{sanitizedInvoice.id}</p>
          <p>発行日: {dateFormat(sanitizedInvoice.created_at)}</p>
        </div>
      </section>

      <div className='flex justify-between gap-8 py-4 px-4 break-inside-avoid-page'>
        <div className='flex-1'>
          <section className='mb-6'>
            <h2 className=' text-lg font-bold'>
              {plain_text(customer.properties['社名/個人名'])}{' '}
              {plain_text(customer.properties.敬称)}
            </h2>
            <CustomerInfo customer={customer} />
            <CustomerPerson customer={customer} />
          </section>

          <section className='mb-6'>
            <p>お世話になっております。下記の通りお見積もりいたします。</p>
          </section>

          <section className='double-border'>
            <div className='flex justify-start items-baseline gap-10 px-3 py-2 border-b-2 border-kent-blue-500'>
              <h2 className='text-xl'>御見積額</h2>
              <p className='text-2xl font-bold'>
                ¥ {sanitizedInvoice.invoice_sum.toLocaleString()}
              </p>
            </div>
          </section>
        </div>

        <div className='min-w-fit'>
          <section className='flex gap-2'>
            <div className=''>
              <h2 className=' text-lg font-bold'>
                {plain_text(account.properties.会社名)}
              </h2>{' '}
              <AccountInfo account={account} />
            </div>
            <div className='w-20 h-auto'>
              <Image
                src={account.properties.印鑑画像.files[0].file.url}
                alt={account.properties.印鑑画像.files[0].file.name}
                width={1024}
                height={1024}
                priority={true}
              />
            </div>
          </section>
        </div>
      </div>

      <section className='pb-4 px-4 break-inside-avoid-page'>
        <h2 className='text-2xl font-bold mb-3 border-b-2 border-kent-blue-500 py-3'>
          見積明細
        </h2>
        <table className='w-full'>
          <thead>
            <tr>
              <th>項目</th>
              <th>単価 {sanitizedInvoice.tax_incl ? '(税込)' : ''}</th>
              <th>数量</th>
              <th>小計 {sanitizedInvoice.tax_incl ? '(税込)' : ''}</th>
              <th>税率</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              return (
                <tr key={index}>
                  <td>{plain_text(row.properties.名前)}</td>
                  <td className='text-right'>
                    &yen;{' '}
                    {row.properties.単価.rollup.array[0].number.toLocaleString()}
                  </td>
                  <td className='text-right'>
                    {row.properties.数量.number.toLocaleString()}{' '}
                    {plain_text(row.properties.単位)}
                  </td>
                  <td className='text-right'>
                    &yen; {row.properties.小計.formula.number.toLocaleString()}
                  </td>
                  <td className='text-center'>
                    {plain_text(row.properties.税率)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className='py-4 mx-4 flex justify-between gap-8 border-b-2 border-kent-blue-500 break-inside-avoid-page'>
        <PrintTaxTable sanitizedInvoice={sanitizedInvoice} />
        <PrintWithHoldingTable sanitizedInvoice={sanitizedInvoice} />
      </section>

      <div className='flex justify-between gap-8 py-4 px-4 border-b-[5mm] border-kent-blue-500 break-inside-avoid-page'>
        <section className='flex-1'>
          <h2 className='text-2xl font-bold mb-3 border-b-2 border-kent-blue-500 py-3'>
            見積額
          </h2>
          <table className='w-full'>
            <thead>
              <tr>
                <th>項目</th>
                <th>小計</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>見積額</td>
                <td className='text-right'>
                  &yen; {sanitizedInvoice.sum.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td>消費税{sanitizedInvoice.tax_incl ? '(内税額)' : ''}</td>
                <td className='text-right'>
                  {sanitizedInvoice.tax_incl ? '(' : ''}&yen;{' '}
                  {sanitizedInvoice.tax.toLocaleString()}
                  {sanitizedInvoice.tax_incl ? ')' : ''}
                </td>
              </tr>
              <PrintWithHoldingRow sanitizedInvoice={sanitizedInvoice} />
            </tbody>
            <tfoot>
              <tr>
                <th>見積額合計</th>
                <td className='text-right text-2xl font-bold'>
                  &yen; {sanitizedInvoice.invoice_sum.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        <section className='double-border my-3 flex-1 break-inside-avoid-page'>
          <h2 className='font-bold border-b-2 border-kent-blue-500 mb-2'>
            備考
          </h2>
          <p className='whitespace-pre-wrap'>
            {sanitizedInvoice.note}
            {sanitizedInvoice.tax_incl ? (
              <>
                <br />
                <br />
                この見積書は内税にて計算をしております。
              </>
            ) : (
              ''
            )}
            <br />
            この見積書の有効期限は、発行日より30日です。（期間内の発注を以て有効とするものです。）
          </p>
        </section>
      </div>
    </>
  );
};

export default invoicePrintPage;
