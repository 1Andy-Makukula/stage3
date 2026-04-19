import type { Request, Response } from 'express';
import type { Logger } from 'pino';

/**
 * POST /api/wishlist/toggle
 * Idempotent wishlist sync for optimistic UI reconciliation.
 */
export async function handleWishlistToggle(
  req: Request,
  res: Response,
  log: Logger,
  getOrExecute: <T>(key: string, fn: () => Promise<T>) => Promise<{ replay: boolean; value: T }>
): Promise<void> {
  const idempotencyKey = (req.get('Idempotency-Key') ?? req.get('idempotency-key') ?? '').trim();
  if (!idempotencyKey) {
    res.status(400).json({ error: 'Idempotency-Key header is required' });
    return;
  }

  const body = req.body as { productId?: string; inWishlist?: boolean };
  if (!body.productId || typeof body.inWishlist !== 'boolean') {
    res.status(400).json({ error: 'productId and inWishlist are required' });
    return;
  }

  try {
    const { replay, value } = await getOrExecute(idempotencyKey, async () => {
      log.debug({ productId: body.productId, inWishlist: body.inWishlist }, 'wishlist_toggle');
      return { ok: true as const, productId: body.productId, inWishlist: body.inWishlist };
    });
    res.status(replay ? 200 : 201).json({ ...value, idempotentReplay: replay });
  } catch (e) {
    log.error({ err: e }, 'wishlist_toggle_failed');
    res.status(500).json({ error: 'Wishlist sync failed' });
  }
}
