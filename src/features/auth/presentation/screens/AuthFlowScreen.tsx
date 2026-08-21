import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../navigation/Navigation';
import { SplashScreen } from './SplashScreen';
import { WelcomeScreen } from './WelcomeScreen';

type AuthNav = NativeStackNavigationProp<RootStackParamList, 'AuthFlow'>;

export function AuthFlowScreen() {
  const navigation = useNavigation<AuthNav>();
  const [phase, setPhase] = useState<'splash' | 'welcome'>('splash');

  if (phase === 'splash') {
    return <SplashScreen onFinish={() => setPhase('welcome')} />;
  }

  return (
    <WelcomeScreen
      onNewUser={() => navigation.navigate('Onboarding')}
      onExistingUser={() => navigation.navigate('Auth', { mode: 'signin' })}
    />
  );
}
