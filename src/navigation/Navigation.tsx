import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Linking from 'expo-linking';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth, useUser, ClerkLoaded } from '@clerk/clerk-expo';
import { SignInScreen } from '../features/auth/presentation/screens/SignInScreen';
import { InviteAcceptScreen } from '../features/auth/presentation/screens/InviteAcceptScreen';
import { AuthFlowScreen } from '../features/auth/presentation/screens/AuthFlowScreen';
import { OnboardingScreen, OnboardingData } from '../features/auth/presentation/screens/OnboardingScreen';
import { MembershipGate } from '../features/membership/presentation/MembershipGate';
import { AthleteTabs } from './AthleteTabs';
import { darkTheme } from '../shared/theme';

// --- Onboarding Data Context ---
type OnboardingContextType = {
  onboardingData: OnboardingData | null;
  saveOnboarding: (data: OnboardingData) => void;
};

const OnboardingContext = createContext<OnboardingContextType>({
  onboardingData: null,
  saveOnboarding: () => {},
});

export function useOnboardingData() {
  return useContext(OnboardingContext);
}

// --- Deep Linking ---
function extractCodeFromUrl(url: string): string | null {
  try {
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
    'mrtraining://',
    'exp://',
    'exp+mrtraining://',
    'exp://localhost',
    'https://mobile.innotechlabssas.lat',
  ],
  config: {
    screens: {
      AuthFlow: '',
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
    const normalizedPath = path.replace('/--/', '/');
    const code = extractCodeFromUrl(normalizedPath);
    if (code) {
      return {
        routes: [{ name: 'InviteAccept' as const, params: { code } }],
      };
    }
    return undefined;
  },
};

// --- Types ---
export type RootStackParamList = {
  AuthFlow: undefined;
  Auth: { code?: string; mode?: 'signin' | 'signup' } | undefined;
  Onboarding: undefined;
  InviteAccept: { code: string } | undefined;
  AthleteTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// --- Wrappers ---
function AthleteTabsWithGate() {
  const { user } = useUser();
  return (
    <MembershipGate athleteId={user?.id ?? null}>
      <AthleteTabs />
    </MembershipGate>
  );
}

function OnboardingScreenWrapper({ navigation }: any) {
  const { saveOnboarding } = useOnboardingData();

  const handleComplete = useCallback((data: OnboardingData) => {
    saveOnboarding(data);
    navigation.navigate('Auth', { mode: 'signup' });
  }, [saveOnboarding, navigation]);

  return <OnboardingScreen onComplete={handleComplete} />;
}

// --- Root Navigator (single navigator, conditional screens) ---
function RootNavigator() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  // Show loading while Clerk initializes
  if (!userLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: darkTheme.colors.background }}>
        <ActivityIndicator size="large" color={darkTheme.colors.primary} />
      </View>
    );
  }

  // Force remount when auth state changes — this resets navigation state
  const navKey = isSignedIn ? 'signed-in' : 'auth';

  return (
    <Stack.Navigator key={navKey} screenOptions={{ headerShown: false }}>
      {!isSignedIn ? (
        // Auth stack
        <>
          <Stack.Screen name="AuthFlow" component={AuthFlowScreen} />
          <Stack.Screen name="Auth" component={SignInScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreenWrapper} />
          <Stack.Screen name="InviteAccept" component={InviteAcceptScreen} />
        </>
      ) : (
        // Signed-in stack
        <>
          <Stack.Screen name="AthleteTabs" component={AthleteTabsWithGate} />
          <Stack.Screen name="InviteAccept" component={InviteAcceptScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// --- Main Navigator ---
export function AppNavigator() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);

  const saveOnboarding = useCallback((data: OnboardingData) => {
    setOnboardingData(data);
  }, []);

  return (
    <OnboardingContext.Provider value={{ onboardingData, saveOnboarding }}>
      <ClerkLoaded>
        <NavigationContainer linking={linking} theme={darkTheme}>
          <RootNavigator />
        </NavigationContainer>
      </ClerkLoaded>
    </OnboardingContext.Provider>
  );
}
