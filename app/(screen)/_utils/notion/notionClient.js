import { cache } from 'react';
import { Client } from '@notionhq/client';
import getCredentials from '@/app/(screen)/_utils/crypto/getCredentials';

/**
 * Notion APIクライアントと資格情報を取得する
 * React.cacheにより、同一リクエスト内での重複呼び出しを防ぐ
 * @returns {Promise<{notion: Client, credentials: object, dataSourceId: string}>}
 */
export const getNotionClient = cache(async () => {
  const credentials = await getCredentials();

  if (!credentials?.api_key) {
    throw new Error('Notion credentials not found. Please configure your Notion API key.');
  }

  const notion = new Client({ auth: credentials.api_key });

  // v5ではdatabases.queryがdataSources.queryに移行されたため、
  // データベースからdata_source_idを取得する
  const database = await notion.databases.retrieve({
    database_id: credentials.db_id,
  });

  const dataSourceId = database.data_sources?.[0]?.id || credentials.db_id;

  return { notion, credentials, dataSourceId };
});
