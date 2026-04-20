import type { Request, Response } from 'express';
import type { Logger } from 'pino';
import { initiatePayment } from '../../../../server/services/paymentService';
import { supabaseAdmin } from '../../../../server/index';

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
    customerEmail?: string;
    buyerName?: string;
    buyerId?: string;
    shopId?: string;
    productId?: string;
    recipientPhone?: string;
    reference?: string;
  };

  try {
    const { replay, value } = await getOrExecute(idempotencyKey, async () => {
      log.info({ idempotencyKey, amount: body.amountZmw }, 'payment_initiate_v2');

      // 1. Hand over to Flutterwave Logic Engine
      const flutterwaveResponse = await initiatePayment(
        body.amountZmw ?? 0,
        body.customerEmail ?? '',
        body.buyerName ?? 'KithLy Customer'
      );

      if (flutterwaveResponse.status !== 'success') {
        throw new Error(`flutterwave_error: ${flutterwaveResponse.message}`);
      }

      // 2. Identity Handshake: Link the payment to a pending KithLy transaction
      const claimCode = `KL-${idempotencyKey.slice(0, 6).toUpperCase()}`;
      const { error } = await supabaseAdmin
        .from('transactions')
        .insert({
          buyer_id: body.buyerId,
          shop_id: body.shopId,
          amount: body.amountZmw,
          claim_code: claimCode,
          status: 'pending',
          tx_ref: flutterwaveResponse.data.tx_ref,
          recipient_phone: body.recipientPhone,
          product_id: body.productId // Assuming product_id link
        });

      if (error) {
        log.error({ error }, 'pending_transaction_creation_failed');
        throw new Error('Could not initialize transaction ledger');
      }

      return {
        status: 'initiated',
        redirect_url: flutterwaveResponse.data.link,
        tx_ref: flutterwaveResponse.data.tx_ref
      };
    });

    res.status(replay ? 200 : 201).json({ ...value, idempotentReplay: replay });
  } catch (e: any) {
    log.error({ err: e.message }, 'payment_initiate_failed');
    res.status(500).json({ error: 'Payment initiation failed', details: e.message });
  }
}
