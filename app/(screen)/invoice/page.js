import { Client } from '@notionhq/client';
import InvoiceListRow from '@/app/(screen)/components/InvoiceListRow';

export default async function Invoice() {
    const databaseId = process.env.INVOICE_DATABASE_ID;
    const notion = new Client({ auth: process.env.NOTION_API_KEY });
    const response = await notion.databases.query({
        database_id: databaseId,
        sorts: [
            {
                property: '発行日',
                direction: 'descending',
            },
            {
                timestamp: 'last_edited_time',
                direction: 'descending',
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
