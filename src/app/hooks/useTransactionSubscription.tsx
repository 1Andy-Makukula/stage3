import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { PartyPopper } from 'lucide-react';
import { launchCelebrationConfetti } from '../lib/confetti';
import React from 'react';

/**
 * useTransactionSubscription: The frontend "Heartbeat".
 * Listens for real-time PostgreSQL updates to flash "Delivered"
 * the moment a merchant/admin completes the handshake.
 */
export function useTransactionSubscription(transactionId?: string) {
  useEffect(() => {
    if (!transactionId) return;

    const channel = supabase
      .channel(`realtime_handshake_${transactionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `id=eq.${transactionId}`,
        },
        (payload: any) => {
          const newStatus = payload.new.status;
          
          if (newStatus === 'in_escrow') {
            toast.info('Payment Confirmed', {
              description: 'Funds are now locked in escrow. Your gift is ready!',
            });
          }
          
          if (newStatus === 'completed') {
            // Senior Architect: Trigger the celebration!
            launchCelebrationConfetti();
            toast.success("Gift Delivered Successfully!", {
              description: 'The handshake is complete.',
              icon: React.createElement(PartyPopper, { className: "w-5 h-5 text-green-500" }),
              duration: 8000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId]);
}
