import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Ad {
  id: string;
  shop_id?: string;
  type: 'featured_ribbon' | 'global_alert' | 'sidebar_promo';
  content_json: {
    hero_title?: string;
    hero_subtitle?: string;
    cta_text?: string;
    cta_link?: string;
    accent_color?: string;
  };
  starts_at: string;
  ends_at?: string;
  is_active: boolean;
}

/**
 * useAds: Fetches active platform advertisements and featured content.
 */
export function useAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAds() {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAds(data as Ad[]);
      }
      setLoading(false);
    }

    fetchAds();
  }, []);

  const featuredRibbon = ads.find(ad => ad.type === 'featured_ribbon');
  const globalAlert = ads.find(ad => ad.type === 'global_alert');

  return { ads, featuredRibbon, globalAlert, loading };
}
