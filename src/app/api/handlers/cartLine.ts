import type { Request, Response } from 'express';
import type { Logger } from 'pino';

/**
 * POST /api/cart/line
 * Idempotent line sync (for optimistic UI reconciliation).
 */
export async function handleCartLine(
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

  const body = req.body as { productId?: string; quantity?: number };
  if (!body.productId || typeof body.quantity !== 'number' || body.quantity < 1) {
    res.status(400).json({ error: 'productId and quantity are required' });
    return;
  }

  try {
    const { replay, value } = await getOrExecute(idempotencyKey, async () => {
      log.debug({ productId: body.productId, quantity: body.quantity }, 'cart_line_upsert');
      return { ok: true as const, productId: body.productId, quantity: body.quantity };
    });
    res.status(replay ? 200 : 201).json({ ...value, idempotentReplay: replay });
  } catch (e) {
    log.error({ err: e }, 'cart_line_failed');
    res.status(500).json({ error: 'Cart sync failed' });
  }
}
