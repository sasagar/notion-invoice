import InvoiceListRowItem from './InvoiceListRowItem';

function InvoiceListRow({ invoices }) {
  return (
    <article>
      {invoices.map(invoice => (
        <InvoiceListRowItem invoice={invoice} key={invoice.id} />
      ))}
    </article>
  );
}

export default InvoiceListRow;
