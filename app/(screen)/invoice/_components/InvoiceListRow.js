import InvoiceListRowItem from "./InvoiceListRowItem"

function InvoiceListRow(props) {

    const invoices = props.invoices;

    return (
        <article>
            {
                invoices.map((invoice, index) => (
                    <InvoiceListRowItem invoice={invoice} key={index} />
                ))
            }
        </article>
    )
}

export default InvoiceListRow;
