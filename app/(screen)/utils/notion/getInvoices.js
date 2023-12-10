import { Client } from '@notionhq/client';

const getInvoices = async (status) => {
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
            property: "ステータス",
            status: {
                equals: status
            }
        }
    })

    const invoices = response.results;
    return invoices;
}

export default getInvoices;