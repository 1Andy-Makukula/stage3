export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  if (raw && raw.length > 0) return raw.replace(/\/$/, '');
  return '';
}

function resolveUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${p}` : p;
}

export async function postJson<T>(
  path: string,
  body: unknown,
  headers?: Record<string, string>
): Promise<{ ok: boolean; status: number; data: T }> {
  const url = resolveUrl(path);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `kl-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
