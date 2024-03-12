'use server';
import crypto from 'crypto';

const decryptoCredentials = ({ db_id, api_key }) => {
  const key = process.env.CRYPTO_KEY;
  const iv = process.env.CRYPTO_IV;

  const decipher1 = crypto.createDecipheriv(
    'aes-256-cfb',
    Buffer.from(key),
    iv,
  );
  const decrypto_db_id = decipher1.update(db_id, 'hex', 'utf8');

  const decipher2 = crypto.createDecipheriv(
    'aes-256-cfb',
    Buffer.from(key),
    iv,
  );
  const decrypto_api_key = decipher2.update(api_key, 'hex', 'utf8');

  return {
    db_id: decrypto_db_id,
    api_key: decrypto_api_key,
  };
};

export default decryptoCredentials;
