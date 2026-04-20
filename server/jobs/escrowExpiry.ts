import cron from 'node-cron';
import { supabaseAdmin } from '../index';
import { logger } from '../logger';

/**
 * KithLy Escrow Expiry Job
 * Runs every day at midnight (00:00) to find unclaimed gifts
 * that are older than 7 days and marks them for refund.
 */
export function initEscrowExpiryJob() {
  // Schedule: Minute 0, Hour 0 (Midnight)
  cron.schedule('0 0 * * *', async () => {
    logger.info('running_escrow_expiry_check');

    try {
      // Calculate the timestamp for 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // 1. Identify "Stale" Escrows
      const { data: staleTransactions, error: fetchError } = await supabaseAdmin
        .from('transactions')
        .select('id, claim_code, amount, buyer_id')
        .eq('status', 'in_escrow')
        .lt('created_at', sevenDaysAgo.toISOString());

      if (fetchError) throw fetchError;

      if (!staleTransactions || staleTransactions.length === 0) {
        logger.info('no_stale_escrows_found');
        return;
      }

      logger.info({ count: staleTransactions.length }, 'stale_escrows_identified');

      // 2. Batch Update to 'expired'
      // In a production environment, this would also trigger a refund via Flutterwave
      const staleIds = staleTransactions.map(t => t.id);

      const { error: updateError } = await supabaseAdmin
        .from('transactions')
        .update({ status: 'cancelled' }) // Or 'expired' depending on your schema
        .in('id', staleIds);

      if (updateError) throw updateError;

      // 3. Log the cleanup for the Admin Dashboard
      logger.info({
        ids: staleIds,
        msg: 'Escrow codes expired and flagged for reversal'
      }, 'escrow_expiry_cleanup_success');

    } catch (err) {
      logger.error({ err }, 'escrow_expiry_job_failed');
    }
  });
}