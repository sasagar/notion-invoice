import { cache } from 'react';
import { Client } from '@notionhq/client';

const getInvoiceRow = cache(async (items) => {
    console.log('Func: [Notion] getInvoiceRow');

    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    const rows = await Promise.all(
        items.map(
            async item => await notion.pages.retrieve({ page_id: item.id })
        )
    )
    return rows;
})

export default getInvoiceRow;