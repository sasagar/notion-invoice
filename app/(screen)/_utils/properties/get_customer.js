import { cache } from 'react';
import { Client } from '@notionhq/client';
import getCredentials from '@/app/(screen)/_utils/crypto/getCredentials';
import { plain_text } from './plain_text';

export const get_customer = cache(async pageId => {
  console.log('[Properties] get_customer');
  const credentials = await getCredentials();

  const notion = new Client({ auth: credentials.api_key });
  const customer = await notion.pages.retrieve({ page_id: pageId });
  return plain_text(customer.properties.顧客名);
});
