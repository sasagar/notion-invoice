import { cookies } from 'next/headers';
import { cache } from 'react';

import { createClient } from '../supabase/server';
import decryptoCredentials from './decryptoCredentials';

const getCredentials = cache(async () => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('notion')
    .select()
    .limit(1)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  const decrypto = decryptoCredentials({
    db_id: data.db_id,
    api_key: data.api_key,
  });

  const result = { ...data, ...decrypto };

  return result;
});

export default getCredentials;
