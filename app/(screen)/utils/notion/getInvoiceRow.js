import { Client } from '@notionhq/client';

const getInvoiceRow = async (items) => {
    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    const rows = await Promise.all(
        items.map(
            async item => await notion.pages.retrieve({ page_id: item.id })
        )
    )
    return rows;
}

export default getInvoiceRow;