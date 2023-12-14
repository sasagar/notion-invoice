import { cache } from 'react';
import { Client } from '@notionhq/client';

const getInvoiceItem = cache(async (id) => {
    console.log('Func: [Notion] getInvoiceItem');

    const databaseId = process.env.INVOICE_DATABASE_ID;
    const notion = new Client({ auth: process.env.NOTION_API_KEY });
    const response = await notion.databases.query({
        database_id: databaseId,
        sorts: [
            {
                // 昇順で並べ替える
                timestamp: 'last_edited_time',
                direction: 'descending',
            }
        ],
        filter: {
            property: "請求書番号",
            rich_text: {
                equals: id
            }
        }
    })

    const invoices = response.results;

    // 顧客情報
    const customer = await notion.pages.retrieve({ page_id: invoices[0].properties['顧客'].relation[0].id });

    // 担当者
    const account = await notion.pages.retrieve({ page_id: invoices[0].properties['担当者'].relation[0].id });

    return { invoices, customer, account };
})

export default getInvoiceItem;