import type { Request, Response } from 'express';
import type { Logger } from 'pino';
import { verifyFlutterwaveWebhookSecret } from '../lib/flutterwaveVerify';

/**
 * POST /api/webhooks/flutterwave
 * Verifies `verif-hash` before acknowledging payment events.
 */
export async function handleFlutterwaveWebhook(
  req: Request,
  res: Response,
  log: Logger
): Promise<void> {
  const secret = process.env.FLW_SECRET_HASH;
  const verifHash = req.get('verif-hash') ?? req.get('Verif-Hash');

  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    if (!secret || !verifyFlutterwaveWebhookSecret(verifHash, secret)) {
      log.warn({ hasHeader: Boolean(verifHash) }, 'flutterwave_webhook_rejected');
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }
  } else if (secret) {
    if (!verifyFlutterwaveWebhookSecret(verifHash, secret)) {
      log.warn({ hasHeader: Boolean(verifHash) }, 'flutterwave_webhook_rejected');
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }
  } else {
    log.warn('FLW_SECRET_HASH not set — skipping verif-hash check (development only)');
  }

  const payload = req.body as { event?: string; data?: { status?: string; tx_ref?: string } };
  log.info({ event: payload.event, tx_ref: payload.data?.tx_ref }, 'flutterwave_webhook_ok');

  // Acknowledge quickly; process settlement in a worker / DB in production.
  res.status(200).json({ received: true });
}
