/**
 * In-memory idempotency store for payment and cart mutations.
 * Replace with Redis (same key semantics) for multi-instance production.
 */

type Stored<T> = { response: T; storedAt: number };

const TTL_MS = 24 * 60 * 60 * 1000;
const store = new Map<string, Stored<unknown>>();

function prune(): void {
  const now = Date.now();
  for (const [key, v] of store) {
    if (now - v.storedAt > TTL_MS) store.delete(key);
  }
}

export function getOrExecute<T>(
  key: string,
  execute: () => Promise<T>
): Promise<{ replay: boolean; value: T }> {
  prune();
  const existing = store.get(key) as Stored<T> | undefined;
  if (existing) {
    return Promise.resolve({ replay: true, value: existing.response });
  }
  return execute().then((value) => {
    store.set(key, { response: value, storedAt: Date.now() });
    return { replay: false, value };
  });
}
