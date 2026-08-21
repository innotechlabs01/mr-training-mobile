import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, useClerk } from '@clerk/clerk-expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { AppNavigator } from './Navigation';
import { setClerkInstance } from '../infrastructure/auth/clerk';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
    mutations: { retry: 1 },
  },
});

const CLERK_KEY = Constants.expoConfig?.extra?.clerkPublishableKey;

if (!CLERK_KEY) {
  throw new Error('Missing clerkPublishableKey in app.json extra');
}

function ClerkInstanceSetter() {
  const clerk = useClerk();

  useEffect(() => {
    setClerkInstance(clerk);
  }, [clerk]);

  return null;
}

const tokenCache = {
  getToken: async (key: string) => SecureStore.getItemAsync(key),
  saveToken: async (key: string, value: string) => SecureStore.setItemAsync(key, value),
  deleteToken: async (key: string) => SecureStore.deleteItemAsync(key),
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider
        publishableKey={CLERK_KEY}
        tokenCache={tokenCache}
      >
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <ClerkInstanceSetter />
            <AppNavigator />
          </SafeAreaProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
