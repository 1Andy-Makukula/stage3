import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../index';
import { logger } from '../logger';

/**
 * adminAuth middleware: The "Master Key" Guardrail.
 * Validates the Supabase JWT and ensures the user has the 'admin' role.
 */
export async function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verify User Session via Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      logger.warn({ error }, 'admin_auth_failed: invalid_session');
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // 2. Check Admin Role in profiles table
    // In KGCC, we tie everything to the JWT and the authoritative public.profiles record
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      logger.warn({ userId: user.id }, 'admin_auth_failed: insufficient_privileges');
      return res.status(403).json({ error: 'KGCC Access Denied: Admin role required' });
    }

    // Attach user to request for audit trail
    (req as any).adminUser = user;
    next();
  } catch (err) {
    logger.error({ err }, 'admin_auth_internal_error');
    res.status(500).json({ error: 'Authentication engine failure' });
  }
}
