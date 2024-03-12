import { cache } from 'react';
import { Client } from '@notionhq/client';
import getCredentials from '@/app/(screen)/_utils/crypto/getCredentials';

const getInvoiceItem = cache(async id => {
  console.log('Func: [Notion] getInvoiceItem');

  const credentials = await getCredentials();

  const notion = new Client({ auth: credentials.api_key });
  const response = await notion.databases.query({
    database_id: credentials.db_id,
    sorts: [
      {
        // 昇順で並べ替える
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

  // 顧客情報
  const customer = await notion.pages.retrieve({
    page_id: invoices[0].properties.顧客.relation[0].id,
  });

  // 担当者
  const account = await notion.pages.retrieve({
    page_id: invoices[0].properties.担当者.relation[0].id,
  });

  return { invoices, customer, account };
});

export default getInvoiceItem;
