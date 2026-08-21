import React from 'react';
import * as Linking from 'expo-linking';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth, useUser, ClerkLoaded } from '@clerk/clerk-expo';
import { SignInScreen } from '../features/auth/presentation/screens/SignInScreen';
import { InviteAcceptScreen } from '../features/auth/presentation/screens/InviteAcceptScreen';
import { MembershipGate } from '../features/membership/presentation/MembershipGate';
import { AthleteTabs } from './AthleteTabs';

// Extract coach code from deep link URL
// Supports: mrtraining://invite?code=MR-A3X9
//           https://app.mrtraining.com/invite?code=MR-A3X9
//           exp://localhost/--/invite?code=MR-A3X9 (Expo Go)
function extractCodeFromUrl(url: string): string | null {
  try {
    // Handle Expo Go URLs with /--/ prefix
    const normalizedUrl = url.replace('/--/', '/');
    const urlObj = new URL(normalizedUrl);
    return urlObj.searchParams.get('code');
  } catch {
    const match = url.match(/[?&]code=([^&]+)/);
    return match ? match[1] : null;
  }
}

const linking = {
  prefixes: [
    // Custom scheme (installed app + development builds)
    'mrtraining://',
    // Expo Go (development only)
    'exp://',
    'exp+mrtraining://',
    'exp://localhost',
    // Universal Links (production + development builds)
    'https://mobile.innotechlabssas.lat',
  ],
  config: {
    screens: {
      InviteAccept: 'invite',
      Auth: 'auth',
      AthleteTabs: 'home',
    },
  },
  async getInitialURL(): Promise<string> {
    const url = await Linking.getInitialURL();
    return url ?? '';
  },
  subscribe(listener: (url: string) => void) {
    const sub = Linking.addEventListener('url', ({ url }) => listener(url));
    return () => sub.remove();
  },
  getStateFromPath(path: string) {
    // Normalize Expo Go /--/ prefix
    const normalizedPath = path.replace('/--/', '/');
    const code = extractCodeFromUrl(normalizedPath);
    if (code) {
      return {
        routes: [
          {
            name: 'InviteAccept' as const,
            params: { code },
          },
        ],
      };
    }
    return {
      routes: [{ name: 'Auth' as const }],
    };
  },
};

export type RootStackParamList = {
  Auth: { code?: string } | undefined;
  InviteAccept: { code: string } | undefined;
  AthleteTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AthleteTabsWithGate() {
  const { user } = useUser();
  return (
    <MembershipGate athleteId={user?.id ?? null}>
      <AthleteTabs />
    </MembershipGate>
  );
}

function useNavigation() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isSignedIn) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={SignInScreen} />
        <Stack.Screen name="InviteAccept" component={InviteAcceptScreen} />
      </Stack.Navigator>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InviteAccept" component={InviteAcceptScreen} />
      <Stack.Screen name="AthleteTabs" component={AthleteTabsWithGate} />
    </Stack.Navigator>
  );
}

function NavigationContent() {
  const navigation = useNavigationContainerRef<RootStackParamList>();
  return useNavigation();
}

export function AppNavigator() {
  return (
    <ClerkLoaded>
      <NavigationContainer linking={linking}>
        <NavigationContent />
      </NavigationContainer>
    </ClerkLoaded>
  );
}
