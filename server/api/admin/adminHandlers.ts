import type { Request, Response } from 'express';
import type { Logger } from 'pino';
import { supabaseAdmin } from '../../index';

/**
 * KGCC Node Manager: Fetches all shops with extended metadata bypassing RLS.
 */
export async function getAdminNodes(req: Request, res: Response, log: Logger) {
  const { data, error } = await supabaseAdmin
    .from('shops')
    .select(`
      *,
      owner:profiles(full_name, email),
      product_count:products(id)
    `);

  if (error) {
    log.error({ error }, 'admin_nodes_fetch_failed');
    return res.status(500).json({ error: 'Failed to retrieve nodes' });
  }

  // Formatting for dashboard
  const nodes = data.map(node => ({
    ...node,
    product_count: node.product_count?.length || 0
  }));

  res.status(200).json(nodes);
}

/**
 * KGCC Flow Manager: Fetches all transactions for platform-wide ledger monitoring.
 */
export async function getAdminFlows(req: Request, res: Response, log: Logger) {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select(`
      *,
      buyer:profiles!transactions_buyer_id_fkey(full_name, email),
      shop:shops(business_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    log.error({ error }, 'admin_flows_fetch_failed');
    return res.status(500).json({ error: 'Failed to retrieve flows' });
  }

  res.status(200).json(data);
}

/**
 * Ghost Onboarding: Proxy flow for merchant creation.
 */
export async function handleGhostOnboard(req: Request, res: Response, log: Logger) {
  const { userId, shopData } = req.body;

  if (!userId || !shopData) {
    return res.status(400).json({ error: 'Missing userId or shopData' });
  }

  const { data, error } = await supabaseAdmin
    .from('shops')
    .insert({
      ...shopData,
      owner_id: userId,
      is_ghost: true,
      status: 'active',
      verified: true
    })
    .select()
    .single();

  if (error) {
    log.error({ error, userId }, 'ghost_onboard_failed');
    return res.status(500).json({ error: 'Failed to provision ghost shop' });
  }

  log.info({ shopId: data.id, userId }, 'ghost_onboard_success');
  res.status(201).json(data);
}

/**
 * System Maintenance: Prune legacy mock data.
 * Andy Plan Guardrail: We target IDs that match known mock patterns.
 */
export async function handlePruneMock(req: Request, res: Response, log: Logger) {
  log.warn('mock_pruning_initiated_by_admin');

  try {
    // 1. Target mock transactions
    const { count: txCount, error: txErr } = await supabaseAdmin
      .from('transactions')
      .delete()
      .or('id.ilike.tx-%,claim_code.ilike.KL-MOCK%');

    // 2. Target mock products
    const { count: pCount, error: pErr } = await supabaseAdmin
      .from('products')
      .delete()
      .ilike('id', 'prod-%');

    // 3. Target mock shops
    const { count: sCount, error: sErr } = await supabaseAdmin
      .from('shops')
      .delete()
      .ilike('id', 'shop-%');

    // 4. Target mock users/profiles (BE CAREFUL)
    const { count: profCount, error: profErr } = await supabaseAdmin
      .from('profiles')
      .delete()
      .or('id.ilike.user-%,id.ilike.profile-%');

    if (txErr || pErr || sErr || profErr) {
      throw new Error('Some pruning operations failed');
    }

    res.status(200).json({
      ok: true,
      stats: { transactions: txCount, products: pCount, shops: sCount, profiles: profCount }
    });
  } catch (err: any) {
    log.error({ err }, 'mock_pruning_error');
    res.status(500).json({ error: err.message });
  }
}

/**
 * Emergency Override: Hardened actions for bans and force-expiries.
 */
export async function handleEmergencyOverride(req: Request, res: Response, log: Logger) {
  const { action, targetId } = req.body;

  if (action === 'BAN_USER') {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'banned' as any }) // We might need to add 'banned' to the check constraint if strictly enforced
      .eq('id', targetId);
    
    if (error) return res.status(500).json({ error: error.message });
  } else if (action === 'FORCE_EXPIRE') {
    const { error } = await supabaseAdmin
      .from('transactions')
      .update({ status: 'cancelled' })
      .eq('id', targetId)
      .eq('status', 'in_escrow');
    
    if (error) return res.status(500).json({ error: error.message });
  }

  log.info({ action, targetId }, 'emergency_override_executed');
  res.status(200).json({ ok: true });
}
