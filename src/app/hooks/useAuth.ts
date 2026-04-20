// KithLy Auth Store - Supabase Integration
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@supabase/supabase-js';
import type { UserProfile, UserRole } from '../types';


// Initialize Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuthState {
  user: any | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
  checkProfileComplete: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      loading: true,

      // Run this on App load to sync session
      initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          set({ user: session.user, isAuthenticated: true });
          await get().fetchProfile(session.user.id);
        }
        set({ loading: false });

        // Listen for session changes (Login/Logout)
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session) {
            set({ user: session.user, isAuthenticated: true });
            await get().fetchProfile(session.user.id);
          } else {
            set({ user: null, profile: null, isAuthenticated: false });
          }
          set({ loading: false });
        });
      },

      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { error: error.message };
        return { error: null };
      },

      loginWithGoogle: async () => {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin }
        });
      },

      fetchProfile: async (userId: string) => {
        let { data, error } = await supabase
          .from('profiles')
          .select('*, shops(id, name, status)')
          .eq('id', userId)
          .single();

        // Identity Handshake: Ensure public.profiles exists (Automatic Provisioning)
        if (error && (error.code === 'PGRST116' || error.message?.includes('0 rows'))) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'KithLy User',
                role: 'customer'
              })
              .select('*, shops(id, name, status)') // Join again on creation
              .single();
            
            if (!createError) {
              data = newProfile;
              error = null;
            }
          }
        }

        if (!error && data) {
          const shops = (data as any).shops;
          set({ 
            profile: { 
              ...data, 
              has_shop: Array.isArray(shops) ? shops.length > 0 : !!shops,
              shop_id: Array.isArray(shops) ? shops?.[0]?.id : shops?.id 
            } as UserProfile 
          });
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null, isAuthenticated: false });
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        const { user, profile } = get();
        if (!user) return { error: "No authenticated user" };

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (!error) {
          set({ profile: { ...profile!, ...updates } });
          return { error: null };
        }
        return { error: error.message };
      },

      checkProfileComplete: () => {
        const { profile } = get();
        if (!profile) return false;

        // Architecture Check: Ensuring KYC and Location data exist
        return !!(
          profile.nrc_number &&
          profile.district_id &&
          profile.momo_number &&
          profile.is_verified
        );
      },
    }),
    {
      name: 'kithly-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        profile: state.profile
      }),
    }
  )
);
