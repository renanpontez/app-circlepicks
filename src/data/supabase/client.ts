import { createClient } from '@supabase/supabase-js';
import { createMMKV } from 'react-native-mmkv';
import type { Database } from './database.types';

// Create a dedicated MMKV instance for Supabase auth
// This avoids dependency on the bootstrap storage service
const supabaseStorage = createMMKV({ id: 'supabase-auth' });

// Custom storage adapter for Supabase using MMKV
const MMKVAdapter = {
  getItem: (key: string): string | null => {
    return supabaseStorage.getString(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    supabaseStorage.set(key, value);
  },
  removeItem: (key: string): void => {
    supabaseStorage.remove(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('Supabase credentials not configured. Auth features will not work.');
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-key',
  {
    auth: {
      storage: MMKVAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Helper to get current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
};

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};
