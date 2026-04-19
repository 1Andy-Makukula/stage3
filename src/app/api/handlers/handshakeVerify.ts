import type { Request, Response } from 'express';
import type { Logger } from 'pino';
import { mockTransactions } from '../../data/mock-data';
import { isValidHandshakeLength, normalizeHandshakeCode } from '../lib/handshakeCode';

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

  const validCodes = new Set(
    mockTransactions.map((t) => normalizeHandshakeCode(t.claim_code))
  );
  const ok = validCodes.has(code);

  if (!ok) {
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
    log.info({ ip }, 'handshake_invalid');
    res.status(400).json({ ok: false, error: 'Invalid or expired code' });
    return;
  }

  deps.resetHandshakeFailures(ip);
  log.info({ ip }, 'handshake_verified');
  res.status(200).json({ ok: true });
}
