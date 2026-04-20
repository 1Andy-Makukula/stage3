import { useState } from 'react';
import { postJson } from '../lib/api';
import { toast } from 'sonner';

export function useHandshake() {
  const [loading, setLoading] = useState(false);

  const verify = async (code: string) => {
    setLoading(true);
    try {
      const { ok, data } = await postJson<{ ok: boolean; error?: string }>(
        '/api/handshake/verify',
        { code: code.trim().toUpperCase() }
      );
      
      if (ok && data.ok) {
        toast.success('Handshake Verified', { 
          description: 'The gift has been successfully claimed.' 
        });
        return true;
      }
      
      toast.error('Verification Failed', { 
        description: data.error || 'Invalid or expired code.' 
      });
      return false;
    } catch {
      toast.error('System Error', { 
        description: 'Handshake engine unreachable.' 
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { verify, loading };
}
