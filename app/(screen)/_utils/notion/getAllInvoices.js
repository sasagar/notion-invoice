import { cache } from 'react';
import { getNotionClient } from './notionClient';

const getAllInvoices = cache(async () => {
  const { notion, credentials } = await getNotionClient();

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

  return response.results;
});

export default getAllInvoices;
