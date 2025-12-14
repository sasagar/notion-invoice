import { cache } from 'react';
import { getNotionClient } from './notionClient';

const getInvoiceItem = cache(async id => {
  const { notion, credentials } = await getNotionClient();

  const response = await notion.databases.query({
    database_id: credentials.db_id,
    sorts: [
      {
        timestamp: 'last_edited_time',
        direction: 'descending',
      },
    ],
    filter: {
      property: '請求書番号',
      rich_text: {
        equals: id,
      },
    },
  });

  const invoices = response.results;

  // 顧客情報と担当者を並列取得
  const [customer, account] = await Promise.all([
    notion.pages.retrieve({
      page_id: invoices[0].properties.顧客.relation[0].id,
    }),
    notion.pages.retrieve({
      page_id: invoices[0].properties.担当者.relation[0].id,
    }),
  ]);

  return { invoices, customer, account };
});

export default getInvoiceItem;
