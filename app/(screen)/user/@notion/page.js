import getClientCredentials from '@/app/(screen)/_utils/crypto/getClientCredentials';
import { updateNotion } from './update';

const NotionInfo = async () => {
  const credentials = await getClientCredentials();

  return (
    <section className='flex flex-col w-full sm:max-w-2xl justify-center items-center gap-2 mx-auto'>
      <h2>Notionデータベース関連</h2>

      <form
        className='animate-in flex flex-col justify-center gap-2 text-foreground w-full'
        action={updateNotion}
      >
        <label className='text-md' htmlFor='notion_db_id'>
          Notion データベースID
        </label>
        <input
          className='rounded-md px-4 py-2 bg-inherit border mb-6'
          name='notion_db_id'
          placeholder='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
          defaultValue={credentials?.db_id}
          required
        />

        <label className='text-md' htmlFor='notion_api_key'>
          Notion API キー
        </label>
        <input
          className='rounded-md px-4 py-2 bg-inherit border mb-6'
          name='notion_api_key'
          placeholder='secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
          defaultValue={credentials?.api_key}
          required
        />

        <button
          type='button'
          className='bg-green-700 hover:bg-green-600 text-green-100 rounded-md px-4 py-2 text-foreground mb-2 transition-all'
        >
          情報を更新する
        </button>
      </form>
    </section>
  );
};

export default NotionInfo;
