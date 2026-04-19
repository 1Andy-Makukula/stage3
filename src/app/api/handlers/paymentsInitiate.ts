import type { Request, Response } from 'express';
import type { Logger } from 'pino';
import { sendMerchantEscrowSms, sendRecipientPurchaseSms } from '../../../../server/services/smsService';
import { mockShops } from '../../data/mock-data';

/**
 * POST /api/payments/initiate
 * Requires Idempotency-Key header to prevent double charges on retries.
 */
export async function handlePaymentsInitiate(
  req: Request,
  res: Response,
  log: Logger,
  getOrExecute: <T>(key: string, fn: () => Promise<T>) => Promise<{ replay: boolean; value: T }>
): Promise<void> {
  const idempotencyKey = (req.get('Idempotency-Key') ?? req.get('idempotency-key') ?? '').trim();
  if (!idempotencyKey || idempotencyKey.length < 8) {
    res.status(400).json({ error: 'Idempotency-Key header is required' });
    return;
  }

  const body = req.body as {
    amountZmw?: number;
    currency?: string;
    customerEmail?: string;
    reference?: string;
    fulfillment?: { recipient_name?: string; recipient_phone?: string; send_anonymously?: boolean };
    lines?: Array<{ title?: string }>;
    buyerName?: string;
    merchantPhone?: string;
    claimCode?: string;
  };

  try {
    const { replay, value } = await getOrExecute(idempotencyKey, async () => {
      const reference = body.reference ?? `KL-${idempotencyKey.slice(0, 12)}`;
      log.info(
        {
          idempotencyKey,
          hasFulfillment: Boolean(body.fulfillment),
          lineCount: Array.isArray(body.lines) ? body.lines.length : 0,
        },
        'payment_initiate'
      );

      const firstLineTitle = body.lines?.[0]?.title ?? 'KithLy gift';
      const claimCode = body.claimCode ?? `KL-${idempotencyKey.slice(0, 6).toUpperCase()}`;
      if (body.fulfillment?.recipient_phone) {
        await sendRecipientPurchaseSms(
          body.fulfillment.recipient_phone,
          body.buyerName ?? 'Someone',
          firstLineTitle,
          claimCode
        );
      }
      const merchantPhone = body.merchantPhone ?? mockShops[0]?.contact_phone;
      if (merchantPhone) {
        await sendMerchantEscrowSms(merchantPhone, firstLineTitle);
      }

      return {
        status: 'initiated' as const,
        reference,
        amountZmw: body.amountZmw ?? 0,
        currency: body.currency ?? 'ZMW',
        provider: 'flutterwave' as const,
      };
    });

    log.info({ idempotencyKey, replay }, 'payment_initiate_result');
    res.status(replay ? 200 : 201).json({ ...value, idempotentReplay: replay });
  } catch (e) {
    log.error({ err: e }, 'payment_initiate_failed');
    res.status(500).json({ error: 'Payment initiation failed' });
  }
}
