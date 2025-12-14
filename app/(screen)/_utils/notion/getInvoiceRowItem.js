import { cache } from 'react';
import { getNotionClient } from './notionClient';

const getInvoiceRowItem = cache(async row => {
  const { notion } = await getNotionClient();

  const rowItem = await notion.pages.retrieve({ page_id: row });
  return rowItem;
});

export default getInvoiceRowItem;
