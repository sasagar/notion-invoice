type Entry<T> = { value: T; expires: number };

const store = new Map<string, Entry<unknown>>();

/** key に対する値を ttlMs 間キャッシュする。期限切れ/未登録なら fn を実行。 */
export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) {
    return hit.value as T;
  }
  const value = await fn();
  store.set(key, { value, expires: now + ttlMs });
  return value;
}

export function invalidate(key: string): void {
  store.delete(key);
}
