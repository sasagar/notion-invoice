import { cache } from 'react';
import { Client } from '@notionhq/client';

const getInvoiceRowItem = cache(async (row) => {
    console.log('Func: [Notion] getInvoiceRowItem');

    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    const rowItem = await notion.pages.retrieve({ page_id: row });
    return rowItem;
})

export default getInvoiceRowItem;