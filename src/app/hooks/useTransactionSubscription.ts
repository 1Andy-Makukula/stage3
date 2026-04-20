import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { PartyPopper } from 'lucide-react';
import { launchCelebrationConfetti } from '../lib/confetti';

export function useTransactionSubscription(transactionId?: string) {
  useEffect(() => {
    if (!transactionId) return;

    const channel = supabase
      .channel(`transaction-updates-${transactionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `id=eq.${transactionId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          
          if (newStatus === 'in_escrow') {
            toast.info('Payment Confirmed', {
              description: 'Funds are now locked in escrow.',
            });
          }
          
          if (newStatus === 'completed') {
            launchCelebrationConfetti();
            toast.success('Gift Delivered!', {
              description: 'The handshake was successful.',
              icon: <PartyPopper className="w-5 h-5 text-green-500" />,
              duration: 10000,
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
