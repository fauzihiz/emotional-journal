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
  const { session, initialized, setSession, setInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session fetch:', !!session);
      setSession(session);
      setInitialized(true);
    });

    // Listen for auth changes (like after Google redirect)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, !!session);
      setSession(session);
      // Ensure initialized is true if onAuthStateChange fires first
      setInitialized(true);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Handle navigation AFTER mount and initialization
  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      console.log('No session, redirecting to login');
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      console.log('Session found, redirecting to app');
      router.replace('/(app)');
    }
  }, [session, initialized, segments]);

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
