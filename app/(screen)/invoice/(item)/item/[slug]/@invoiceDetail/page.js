import TaxTable from '../_components/taxTable';
import WithHoldingTable from '../_components/withHoldingTable';
import WithHoldingRow from '../_components/withHoldingRow';

import { plain_text } from '@/app/(screen)/_utils/properties/plain_text';
import invoiceSanitizer from '@/app/(screen)/_utils/notion/invoiceSanitizer';
import getInvoiceItem from '@/app/(screen)/_utils/notion/getInvoiceItem';
import getInvoiceRow from '@/app/(screen)/_utils/notion/getInvoiceRow';

const InvoiceDetail = async props => {
  const params = await props.params;
  const { invoices } = await getInvoiceItem(params.slug);

  const sanitizedInvoice = await invoiceSanitizer(invoices[0]);

  const rows = await getInvoiceRow(sanitizedInvoice.items);

  return (
    <section className='rounded border border-stone-600 dark:border-slate-600 bg-stone-100 dark:bg-slate-900 px-6 py-4 mb-5'>
      <div className='mb-5'>
        <h2 className='text-2xl font-bold mb-3'>請求内容</h2>
        <table className='w-full'>
          <thead>
            <tr>
              <th>表示名</th>
              <th>項目名</th>
              <th>単価 {sanitizedInvoice.tax_incl ? '(税込)' : ''}</th>
              <th>数量</th>
              <th>小計 {sanitizedInvoice.tax_incl ? '(税込)' : ''}</th>
              <th>税率</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              let price;
              if (row.properties.小計.formula.number >= 0) {
                price = '¥ ' + row.properties.小計.formula.number.toLocaleString();
              } else {
                price = '▲ ¥ ' + Math.abs(row.properties.小計.formula.number).toLocaleString();
              }
            
              return (
                <tr key={row.id}>
                  <td>{plain_text(row.properties.名前)}</td>
                  <td className='text-stone-600 dark:text-slate-400'>
                    {row.properties.項目名.rollup.array[0].title[0].plain_text}
                  </td>
                  <td className='text-right'>
                    &yen; {row.properties.単価.rollup.array[0].number.toLocaleString()}
                  </td>
                  <td className='text-right'>
                    {row.properties.数量.number.toLocaleString()} {plain_text(row.properties.単位)}
                  </td>
                  <td className='text-right'>
                    {price}
                  </td>
                  <td className='text-center'>
                    {plain_text(row.properties.税率)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className='flex gap-8 justify-stretch mb-5'>
        <TaxTable sanitizedInvoice={sanitizedInvoice} />
        <WithHoldingTable sanitizedInvoice={sanitizedInvoice} />
      </div>

      <div className='mb-5 w-full max-w-md mx-auto'>
        <h2 className='text-2xl font-bold mb-3'>請求額</h2>
        <table className='w-full'>
          <thead>
            <tr>
              <th>項目</th>
              <th>小計</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>請求額</td>
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
            <WithHoldingRow sanitizedInvoice={sanitizedInvoice} />
          </tbody>
          <tfoot>
            <tr>
              <th>請求額合計</th>
              <td className='text-right text-2xl font-bold'>
                &yen; {sanitizedInvoice.invoice_sum.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className='mb-5'>
        <h2 className='text-2xl font-bold mb-3'>備考</h2>
        <p className='whitespace-pre-wrap'>
          {sanitizedInvoice.note}
          {sanitizedInvoice.tax_incl ? (
            <>
              <br />
              <br />
              この請求書は内税にて計算をしております。
            </>
          ) : (
            ''
          )}
        </p>
      </div>
    </section>
  );
};

export default InvoiceDetail;
