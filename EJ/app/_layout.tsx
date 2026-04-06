import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, useRouter, useSegments } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, View, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // Simpan data 7 hari di cache persisten
      staleTime: 1000 * 60 * 5, // Data dianggap fresh selama 5 menit
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { session, initialized, isActivated, setSession, setInitialized, setActivated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Helper function to check activation status
  const checkActivationStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from('activation_codes')
      .select('id')
      .eq('used_by_user_id', userId)
      .limit(1);
    
    if (error) {
      console.error('Error checking activation:', error);
      return false;
    }
    return data && data.length > 0;
  };

  // 1. Initialize auth state on mount
  useEffect(() => {
    // PWA Service Worker registration for WEB
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => console.log('SW registered: ', registration.scope),
          (err) => console.log('SW registration failed: ', err)
        );
      });
    }

    // First, check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        const isActive = await checkActivationStatus(session.user.id);
        setActivated(isActive);
      } else {
        setActivated(false);
      }
      setInitialized(true);
    });

    // Listen for auth changes (like after Google redirect)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const isActive = await checkActivationStatus(session.user.id);
        setActivated(isActive);
      } else {
        setActivated(false);
      }
      setInitialized(true);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Handle navigation AFTER mount and initialization
  useEffect(() => {
    if (!initialized || isActivated === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isLoginScreen = segments[1] === 'login';
    const isActivateScreen = segments[1] === 'activate';

    if (!session && !isLoginScreen) {
      // Not logged in -> Must Login
      console.log('No session, redirecting to login');
      router.replace('/(auth)/login');
    } else if (session) {
      if (!isActivated && !isActivateScreen) {
        // Logged in, but NOT activated -> Must Activate
        console.log('Session found, but NOT activated. Redirecting to Activate Screen');
        router.replace('/(auth)/activate');
      } else if (isActivated && inAuthGroup) {
        // Logged in AND activated -> Go to App
        console.log('Session found and activated. Redirecting to app');
        router.replace('/(app)');
      }
    }
  }, [session, initialized, isActivated, segments]);

  // 3. Show loading screen while initializing to prevent redirect loops
  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Head>
          <title>Jurnal Emosi</title>
          <meta name="description" content="Catat perasaanmu, temukan dirimu." />
          <meta name="theme-color" content="#3B82F6" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icon-192.png" />
        </Head>
        <Slot />
        <StatusBar style="auto" />
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
