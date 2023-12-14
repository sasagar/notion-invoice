import getInvoiceItem from "@/app/(screen)/_utils/notion/getInvoiceItem";
import invoiceSanitizer from "@/app/(screen)/_utils/notion/invoiceSanitizer";

// import './style.css';

// import InvoiceHeader from "./@invoiceHeader/page";
// import InvoiceInfo from "./@invoiceInfo/page";
// import InvoiceDetail from "./@invoiceDetail/page";

// export const revalidate = 30 // キャッシュの有効期限30秒


const InvoiceItem = (params) => {

    // const { invoices, customer, account } = await getInvoiceItem(params.slug);

    // const sanitizedInvoice = await invoiceSanitizer(invoices[0]);

    return (
        <>
            {/* <InvoiceHeader params={params} /> */}

            {/* <InvoiceInfo sanitizedInvoice={sanitizedInvoice} customer={customer} account={account} /> */}

            {/* <InvoiceDetail sanitizedInvoice={sanitizedInvoice} /> */}
        </>
    );
}

export default InvoiceItem;