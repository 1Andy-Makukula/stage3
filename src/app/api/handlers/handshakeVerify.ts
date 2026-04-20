import type { Request, Response } from 'express';
import type { Logger } from 'pino';
import { supabaseAdmin } from '../../../../server/index';
import { isValidHandshakeLength, normalizeHandshakeCode } from '../lib/handshakeCode';
import { sendSms } from '../../../../server/services/smsService';

type RecordFail = (ip: string) => { allowed: boolean; retryAfterSec?: number };
type ResetFail = (ip: string) => void;

function clientIp(req: Request): string {
  const xf = req.get('x-forwarded-for');
  if (xf) return xf.split(',')[0]!.trim();
  return req.socket.remoteAddress ?? 'unknown';
}

/**
 * POST /api/handshake/verify
 * Validates 8-char codes; rate-limits failed attempts per IP per minute.
 */
export async function handleHandshakeVerify(
  req: Request,
  res: Response,
  log: Logger,
  deps: { recordHandshakeFailure: RecordFail; resetHandshakeFailures: ResetFail }
): Promise<void> {
  const ip = clientIp(req);
  const raw = (req.body as { code?: string }).code ?? '';
  const code = normalizeHandshakeCode(raw);

  if (!isValidHandshakeLength(code)) {
    res.status(400).json({ error: 'Enter the complete 8-character code' });
    return;
  }

  // Identity Handshake: Search live Supabase Ledger
  const { data: tx, error: fetchError } = await supabaseAdmin
    .from('transactions')
    .select(`
      id, 
      status, 
      buyer_id,
      shop_id,
      profiles:buyer_id(phone),
      shops:shop_id(name, district_id)
    `)
    .eq('claim_code', code)
    .single();

  if (fetchError || !tx) {
    const rl = deps.recordHandshakeFailure(ip);
    if (!rl.allowed) {
      log.warn({ ip, retryAfterSec: rl.retryAfterSec }, 'handshake_rate_limited');
      res.setHeader('Retry-After', String(rl.retryAfterSec ?? 60));
      res.status(429).json({
        error: 'Too many failed attempts. Try again in a minute.',
        retryAfterSec: rl.retryAfterSec,
      });
      return;
    }
    log.info({ ip, code }, 'handshake_invalid');
    res.status(400).json({ ok: false, error: 'Invalid or expired code' });
    return;
  }

  if (tx.status !== 'in_escrow') {
    res.status(400).json({ ok: false, error: `Gift status is ${tx.status}. Only "in_escrow" gifts can be claimed.` });
    return;
  }

  // Atomic Handshake: Complete escrow via RPC
  // In a real merchant auth context, we'd pass the authenticated merchant's ID here.
  const { error: updateError } = await supabaseAdmin
    .from('transactions')
    .update({ 
      status: 'completed', 
      handshake_at: new Date().toISOString() 
    })
    .eq('id', tx.id);

  if (updateError) {
    log.error({ err: updateError, txId: tx.id }, 'handshake_completion_failed');
    res.status(500).json({ error: 'Failed to complete handshake in ledger' });
    return;
  }

  deps.resetHandshakeFailures(ip);
  
  if ((tx.profiles as any)?.phone) {
    await sendSms(
      (tx.profiles as any).phone,
      `Your KithLy gift was just claimed at ${(tx.shops as any)?.name || 'the merchant'}!`
    );
  }
  
  log.info({ ip, txId: tx.id }, 'handshake_verified_live');
  res.status(200).json({ ok: true });
}
