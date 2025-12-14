import { cache } from 'react';
import { getNotionClient } from '../notion/notionClient';
import { plain_text } from './plain_text';

export const get_customer = cache(async pageId => {
  const { notion } = await getNotionClient();
  const customer = await notion.pages.retrieve({ page_id: pageId });
  return plain_text(customer.properties.顧客名);
});
