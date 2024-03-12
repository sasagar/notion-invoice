import InvoiceLink from './_components/invoiceLink';
import getInvoices from '@/app/(screen)/_utils/notion/getInvoices';
import {
  SlPencil,
  SlEnvolopeLetter,
  SlCheck,
  SlArrowRight,
} from 'react-icons/sl';
import { plain_text } from '@/app/(screen)/_utils/properties/plain_text';

import './style.css';

const InvoiceSidebarDefault = async () => {
  const draft = await getInvoices('ドラフト');
  const essent = await getInvoices('見積送付済み');
  const sent = await getInvoices('請求書送付済み');
  const completed = await getInvoices('支払い済み');

  const ListItem = ({ obj }) => {
    if (obj.length === 0) {
      return <li className='not-found'>見つかりません</li>;
    }
    return obj.map(invoice => {
      const number = plain_text(invoice.properties.請求書番号);
      return (
        <li key={number}>
          <InvoiceLink number={number} />
        </li>
      );
    });
  };

  return (
    <aside className='fixed top-16 w-2/12 bg-slate-800 rounded-tr-2xl rounded-br-2xl shadow shadow-slate-950 border-r border-t border-b border-slate-600 py-8 px-5 transition-all'>
      <h2 className='text-2xl font-bold mb-5'>Notion Invoice</h2>

      <ul>
        <li>
          <details className='draft'>
            <summary>
              <div>
                <SlPencil /> ドラフト
              </div>
              <SlArrowRight className='arrow' />
            </summary>
            <ul>
              <ListItem obj={draft} />
            </ul>
          </details>
        </li>
        <li>
          <details className='essent'>
            <summary>
              <div>
                <SlEnvolopeLetter /> 見積送付済み
              </div>
              <SlArrowRight className='arrow' />
            </summary>
            <ul>
              <ListItem obj={essent} />
            </ul>
          </details>
        </li>
        <li>
          <details className='sent'>
            <summary>
              <div>
                <SlEnvolopeLetter /> 請求書送付済み
              </div>
              <SlArrowRight className='arrow' />
            </summary>
            <ul>
              <ListItem obj={sent} />
            </ul>
          </details>
        </li>
        <li>
          <details className='completed'>
            <summary>
              <div>
                <SlCheck /> 支払い済み
              </div>
              <SlArrowRight className='arrow' />
            </summary>
            <ul>
              <ListItem obj={completed} />
            </ul>
          </details>
        </li>
      </ul>
    </aside>
  );
};

export default InvoiceSidebarDefault;
