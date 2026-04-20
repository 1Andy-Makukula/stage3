import type { Request, Response } from 'express';
import type { Logger } from 'pino';
import { verifyFlutterwaveWebhookSecret } from '../lib/flutterwaveVerify';
import { supabaseAdmin } from '../../../../server/index';
import { sendRecipientPurchaseSms } from '../../../../server/services/smsService';

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
  }

  const payload = req.body as { 
    event?: string; 
    data?: { 
      status?: string; 
      tx_ref?: string;
      amount?: number;
      customer?: { email?: string };
    } 
  };
  
  log.info({ event: payload.event, tx_ref: payload.data?.tx_ref }, 'flutterwave_webhook_received');

  // Logic Engine Trace: Payment Confirmation & Escrow Locking
  if (payload.event === 'charge.completed' && payload.data?.status === 'successful') {
    const txRef = payload.data.tx_ref;
    const webhookAmount = payload.data.amount;

    // 1. Fetch transaction record for pre-validation
    const { data: currentTx, error: fetchError } = await supabaseAdmin
      .from('transactions')
      .select('*, profiles(full_name), products(title)')
      .eq('tx_ref', txRef)
      .single();

    if (fetchError || !currentTx) {
      log.error({ txRef }, 'webhook_transaction_not_found');
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    // 2. Webhook Idempotency (The "Double SMS" Shield)
    if (currentTx.status !== 'pending') {
      log.info({ txRef, status: currentTx.status }, 'webhook_duplicate_ignored');
      res.status(200).json({ received: true, note: 'already_processed' });
      return;
    }

    // 3. The "LUSE" (Lusaka Securities) Precision
    // Hardening: Cross-reference amount down to the Ngwee
    const dbAmount = Number(currentTx.amount);
    if (Math.abs(Number(webhookAmount) - dbAmount) > 0.001) {
      log.error({ webhookAmount, dbAmount, txRef }, 'webhook_amount_mismatch_flagged');
      await supabaseAdmin.from('transactions').update({ status: 'disputed' }).eq('id', currentTx.id);
      res.status(400).json({ error: 'amount_mismatch_detected' });
      return;
    }
    
    // 4. Atomic Status Update: Move to Escrow
    const { data: tx, error: updateError } = await supabaseAdmin
      .from('transactions')
      .update({ status: 'in_escrow' })
      .eq('id', currentTx.id)
      .select('*, profiles(full_name), products(title)')
      .single();

    if (!updateError && tx) {
      log.info({ txId: tx.id }, 'escrow_locked_via_webhook');

      // Final Step: Communications Bridge (SMS Trigger)
      if (tx.recipient_phone) {
        await sendRecipientPurchaseSms(
          tx.recipient_phone,
          (tx.profiles as any)?.full_name || 'Someone',
          (tx.products as any)?.title || 'a gift',
          tx.claim_code
        );
      }
    } else {
      log.error({ err: updateError, txRef }, 'webhook_status_update_failed');
    }
  }

  res.status(200).json({ received: true });
}
