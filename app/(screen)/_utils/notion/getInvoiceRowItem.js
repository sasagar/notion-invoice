import { cache } from 'react';
import { Client } from '@notionhq/client';
import getCredentials from '@/app/(screen)/_utils/crypto/getCredentials';

const getInvoiceRowItem = cache(async row => {
  console.log('Func: [Notion] getInvoiceRowItem');

  const credentials = await getCredentials();

  const notion = new Client({ auth: credentials.api_key });

  const rowItem = await notion.pages.retrieve({ page_id: row });
  return rowItem;
});

export default getInvoiceRowItem;
