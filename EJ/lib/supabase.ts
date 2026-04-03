import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Custom storage handler to avoid "window is not defined" error during SSR
const isWeb = Platform.OS === 'web';
const safeStorage = {
  getItem: (key: string) => {
    if (isWeb && typeof window === 'undefined') return null;
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (isWeb && typeof window === 'undefined') return;
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (isWeb && typeof window === 'undefined') return;
    return AsyncStorage.setItem(key, ''); // Workaround for AsyncStorage
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb,
  },
});
