import { Client } from '@notionhq/client';
import InvoiceListRow from '../(screen)/components/InvoiceListRow';

export default async function Invoice() {
    const databaseId = process.env.INVOICE_DATABASE_ID;
    const notion = new Client({ auth: process.env.NOTION_API_KEY });
    const response = await notion.databases.query({
        database_id: databaseId,
        sorts: [
            {
                // 昇順で並べ替える
                timestamp: 'last_edited_time',
                direction: 'descending',
                // 降順で並べ替える
                // property: 'Date',
                // direction: 'descending',
                // 数値で並べ替える
                // property: 'Amount',
                // direction: 'ascending',
                // 文字列で並べ替える
                // property: 'Status',
                // direction: 'ascending',
                // 日付で並べ替える
                // property: 'Date',
                // direction: 'ascending',
            }
        ]
    })

    const invoices = response.results;

    return (
        <div className='w-10/12 mx-auto'>
            <h1 className="heading text-2xl font-bold">Invoices</h1>
            <InvoiceListRow invoices={invoices} />
        </div>
    )
}
