import { cache } from 'react';
import { getNotionClient } from './notionClient';

const getAllInvoices = cache(async () => {
  const { notion, dataSourceId } = await getNotionClient();

  // v5ではdatabases.queryの代わりにdataSources.queryを使用
  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
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

  return response.results;
});

export default getAllInvoices;
