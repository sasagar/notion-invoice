import { cache } from 'react';
import { Client } from '@notionhq/client';
import getCredentials from '@/app/(screen)/_utils/crypto/getCredentials';

const getAllInvoices = cache(async () => {
  console.log('Func: [Notion] getAllInvoices');

  const credentials = await getCredentials();

  const notion = new Client({ auth: credentials.api_key });
  const response = await notion.databases.query({
    database_id: credentials.db_id,
    sorts: [
      {
        property: '発行日',
        direction: 'descending',
      },
      {
        timestamp: 'last_edited_time',
        direction: 'descending',
      },
    ],
  });

  const invoices = response.results;
  return invoices;
});

export default getAllInvoices;
