import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://odbbtgkxgiqlfhcepwuj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_22fzrMlPYyCnPUceg1b04g_ChyHEv97';

const getInitialUrl = (): string => {
  return import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('bitx_supabase_url') || DEFAULT_SUPABASE_URL;
};

const getInitialAnonKey = (): string => {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('bitx_supabase_anon_key') || DEFAULT_SUPABASE_ANON_KEY;
};

let currentUrl = getInitialUrl();
let currentAnonKey = getInitialAnonKey();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(currentUrl && currentAnonKey && currentUrl.startsWith('https://'));
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(currentUrl, currentAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.error('Erro ao inicializar Supabase:', err);
      return null;
    }
  }
  return supabaseInstance;
};

export const updateSupabaseCredentials = (url: string, anonKey: string): boolean => {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();
  if (!cleanUrl || !cleanKey) return false;

  try {
    const testClient = createClient(cleanUrl, cleanKey);
    if (testClient) {
      currentUrl = cleanUrl;
      currentAnonKey = cleanKey;
      localStorage.setItem('bitx_supabase_url', cleanUrl);
      localStorage.setItem('bitx_supabase_anon_key', cleanKey);
      supabaseInstance = testClient;
      return true;
    }
  } catch (err) {
    console.error('Credenciais inválidas do Supabase:', err);
  }
  return false;
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('bitx_supabase_url');
  localStorage.removeItem('bitx_supabase_anon_key');
  currentUrl = import.meta.env.VITE_SUPABASE_URL || '';
  currentAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  supabaseInstance = null;
};

export const getStoredConfig = () => ({
  url: currentUrl,
  anonKey: currentAnonKey,
  isFromEnv: Boolean(import.meta.env.VITE_SUPABASE_URL),
});
