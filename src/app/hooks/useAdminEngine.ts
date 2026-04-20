import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

/**
 * useAdminEngine: The master hook for KGCC (KithLy Global Control Console).
 * Handles administrative actions by communicating with the protected /api/admin routes.
 */
export function useAdminEngine() {
  const [loading, setLoading] = useState(false);

  const adminFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session found');

      const response = await fetch(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Admin request failed');
      
      return result;
    } catch (err: any) {
      toast.error('KGCC Error', { description: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getNodes = () => adminFetch('/api/admin/nodes');
  const getFlows = () => adminFetch('/api/admin/flows');
  
  const ghostOnboard = (userId: string, shopData: any) => 
    adminFetch('/api/admin/ghost-onboard', {
      method: 'POST',
      body: JSON.stringify({ userId, shopData }),
    });

  const pruneMockData = () => 
    adminFetch('/api/admin/maintenance/prune-mock', { method: 'POST' });

  const emergencyOverride = (action: string, targetId: string) => 
    adminFetch('/api/admin/emergency/override', {
      method: 'POST',
      body: JSON.stringify({ action, targetId }),
    });

  const verifyShop = (shopId: string) => emergencyOverride('VERIFY_SHOP', shopId);
  const banUser = (userId: string) => emergencyOverride('BAN_USER', userId);
  const forceCancelEscrow = (txId: string) => emergencyOverride('FORCE_EXPIRE', txId);

  return {
    loading,
    getNodes,
    getFlows,
    ghostOnboard,
    pruneMockData,
    verifyShop,
    banUser,
    forceCancelEscrow
  };
}
