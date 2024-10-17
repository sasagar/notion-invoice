import { cache } from 'react';
import { Client } from '@notionhq/client';
import getCredentials from '@/app/(screen)/_utils/crypto/getCredentials';

const getInvoiceRow = cache(async items => {
  console.log('Func: [Notion] getInvoiceRow');

  const credentials = await getCredentials();

  const notion = new Client({ auth: credentials.api_key });

  const rows = await Promise.all(
    items.map(async item => await notion.pages.retrieve({ page_id: item.id })),
  );

  rows.sort((a, b) => a.properties['並び順'].number - b.properties['並び順'].number);
  return rows;
});

export default getInvoiceRow;
