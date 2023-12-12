import { cache } from 'react';
import { Client } from '@notionhq/client';

const getAllInvoices = cache(async () => {
    console.log('Func: [Notion] getAllInvoices');

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
        ],
    })

    const invoices = response.results;
    return invoices;
})

export default getAllInvoices;