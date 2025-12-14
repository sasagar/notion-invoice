import { cache } from 'react';
import { Client } from '@notionhq/client';
import getCredentials from '@/app/(screen)/_utils/crypto/getCredentials';

/**
 * Notion APIクライアントと資格情報を取得する
 * React.cacheにより、同一リクエスト内での重複呼び出しを防ぐ
 * @returns {Promise<{notion: Client, credentials: {api_key: string, db_id: string}}>}
 */
export const getNotionClient = cache(async () => {
  const credentials = await getCredentials();
  const notion = new Client({ auth: credentials.api_key });
  return { notion, credentials };
});
