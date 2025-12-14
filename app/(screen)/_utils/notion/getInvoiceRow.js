import { cache } from 'react';
import { getNotionClient } from './notionClient';

const getInvoiceRow = cache(async items => {
  const { notion } = await getNotionClient();

  const rows = await Promise.all(
    items.map(async item => await notion.pages.retrieve({ page_id: item.id })),
  );

  rows.sort(
    (a, b) => a.properties['並び順'].number - b.properties['並び順'].number,
  );
  return rows;
});

export default getInvoiceRow;
