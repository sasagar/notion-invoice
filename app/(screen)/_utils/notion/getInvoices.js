import { cache } from 'react';
import getAllInvoices from './getAllInvoices';
import { plain_text } from '../properties/plain_text';

const getInvoices = cache(async status => {
  const allInvoices = await getAllInvoices();
  const invoices = allInvoices.filter(
    invoice => plain_text(invoice.properties.ステータス) === status,
  );

  return invoices;
});

export default getInvoices;
