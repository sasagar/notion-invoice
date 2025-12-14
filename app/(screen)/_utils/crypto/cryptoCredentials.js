'use server';
import crypto from 'crypto';

const cryptoCredentials = ({ db_id, api_key }) => {
  const key = process.env.CRYPTO_KEY;
  const iv = process.env.CRYPTO_IV;

  const cipher1 = crypto.createCipheriv('aes-256-cfb', Buffer.from(key), iv);

  let encrypted_dbid = cipher1.update(db_id, 'utf8', 'hex');
  encrypted_dbid += cipher1.final('hex');
  const hex_dbid = encrypted_dbid.toString('hex');

  const cipher2 = crypto.createCipheriv('aes-256-cfb', Buffer.from(key), iv);
  let encrypted_apikey = cipher2.update(api_key, 'utf8', 'hex');
  encrypted_apikey += cipher2.final('hex');
  const hex_apikey = encrypted_apikey.toString('hex');

  return { db_id: hex_dbid, api_key: hex_apikey };
};

export default cryptoCredentials;
