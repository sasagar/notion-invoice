import { cache } from 'react';
import { getNotionClient } from './notionClient';

const getInvoiceItem = cache(async id => {
  const { notion, dataSourceId } = await getNotionClient();

  // v5ではdatabases.queryの代わりにdataSources.queryを使用
  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
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
