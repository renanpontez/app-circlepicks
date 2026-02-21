import React, { useEffect, useCallback } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { AppProvider, useAppReady } from '@/providers';
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/stores';
import { useAuth } from '@/hooks';
import { DebugFAB } from '@/components';

// Keep splash screen visible while app is loading
SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { initializeAuth } = useAuth();

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Handle auth-based routing
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to welcome if not authenticated and not in auth group
      router.replace('/(auth)/welcome');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and in auth group
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isInitialized, segments, router]);

  return <>{children}</>;
}

function RootLayoutContent() {
  const { isDark } = useTheme();
  const { isReady } = useAppReady();
  const { isInitialized } = useAuthStore();

  const onLayoutRootView = useCallback(async () => {
    if (isReady && isInitialized) {
      // Hide splash screen with smooth animation
      await SplashScreen.hideAsync();
    }
  }, [isReady, isInitialized]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!isReady) {
    return null;
  }

  return (
    <AuthGuard>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="experience/[id]/index"
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="experience/[id]/edit"
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="user/[userId]"
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="search"
          options={{
            presentation: 'modal',
            animation: 'fade',
          }}
        />
      </Stack>
      {__DEV__ && <DebugFAB />}
    </AuthGuard>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </AppProvider>
  );
}
