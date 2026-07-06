/**
 * 同時実行数を制限しつつ配列の各要素を非同期処理する。
 * Notion API のレート制限（平均3req/s程度）を超えるバーストを避けるために使う。
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = Array.from({ length: items.length });
  const iterator = items.entries();

  async function worker(): Promise<void> {
    for (const [i, item] of iterator) {
      results[i] = await fn(item, i);
    }
  }

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}
