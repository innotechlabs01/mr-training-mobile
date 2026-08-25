import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../navigation/Navigation';
import { useAuth } from '@clerk/clerk-expo';
import { colors } from '../../../../shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { isSignedIn } = useAuth();
  const { width, height } = useWindowDimensions();

  const scannerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const scannerLoop = Animated.loop(
      Animated.timing(scannerAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }),
    );
    scannerLoop.start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();

    // Staggered bounce: -0.3s / -0.15s / 0 approximated via initial delays
    const b1 = Animated.loop(
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(200),
      ]),
    );
    const b2 = Animated.loop(
      Animated.sequence([
        Animated.delay(150),
        Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(50),
      ]),
    );
    const b3 = Animated.loop(
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    );
    b1.start();
    b2.start();
    b3.start();

    const timer = setTimeout(() => {
      navigation.replace(isSignedIn ? 'AthleteTabs' : 'Welcome');
    }, 10000);

    return () => {
      clearTimeout(timer);
      scannerLoop.stop();
      pulseLoop.stop();
      b1.stop();
      b2.stop();
      b3.stop();
    };
  }, [scannerAnim, pulseAnim, dot1, dot2, dot3, navigation, isSignedIn]);

  const scannerTop = scannerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const dotTranslate = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -6],
    });

  // Grid lines every 40px
  const verticalLines = Math.ceil(width / 40);
  const horizontalLines = Math.ceil(height / 40);

  return (
    <View style={styles.container}>
      {/* Grid texture */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: verticalLines }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={[styles.gridV, { left: i * 40 }]}
          />
        ))}
        {Array.from({ length: horizontalLines }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={[styles.gridH, { top: i * 40 }]}
          />
        ))}
      </View>

      {/* Radial gradient — primary-container/10 */}
      <View style={styles.radialGradient} pointerEvents="none" />

      {/* Scanner line */}
      <Animated.View
        style={[
          styles.scannerLine,
          {
            top: scannerTop,
          },
        ]}
        pointerEvents="none"
      />

      {/* Corner accents */}
      <View style={styles.cornerTopLeft} />
      <View style={styles.cornerTopRight} />
      <View style={styles.cornerBottomLeft} />
      <View style={styles.cornerBottomRight} />

      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Bolt icon with glow */}
        <View style={styles.boltWrapper}>
          <Animated.View
            style={[
              styles.pulseGlow,
              {
                opacity: pulseOpacity,
                transform: [{ scale: pulseScale }],
              },
            ]}
          />
          <Text style={styles.boltIcon}>⚡</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>MR TRAINING</Text>

        {/* Subtitle with flanking lines */}
        <View style={styles.subtitleRow}>
          <View style={styles.subtitleLine} />
          <Text style={styles.subtitle}>Elite Performance</Text>
          <View style={styles.subtitleLine} />
        </View>
      </View>

      {/* Loading indicator bottom-16 */}
      <View style={styles.loadingContainer}>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { transform: [{ translateY: dotTranslate(dot1) }] }]} />
          <Animated.View style={[styles.dot, { transform: [{ translateY: dotTranslate(dot2) }] }]} />
          <Animated.View style={[styles.dot, { transform: [{ translateY: dotTranslate(dot3) }] }]} />
        </View>
        <Text style={styles.loadingText}>Initializing Protocol</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,92,0,0.05)',
  },
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,92,0,0.05)',
  },
  radialGradient: {
    position: 'absolute',
    width: 800,
    height: 800,
    borderRadius: 400,
    backgroundColor: 'rgba(255,92,0,0.10)',
    top: '50%',
    left: '50%',
    marginLeft: -400,
    marginTop: -400,
    opacity: 0.6,
  },
  scannerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#ff5c00',
    opacity: 0.2,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 64,
    height: 64,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(255,92,0,0.2)',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 64,
    height: 64,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255,92,0,0.2)',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 64,
    height: 64,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(255,92,0,0.2)',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255,92,0,0.2)',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  boltWrapper: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pulseGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,92,0,0.2)',
  },
  boltIcon: {
    fontSize: 120,
    color: '#ff5c00',
    textShadowColor: 'rgba(255,92,0,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    includeFontPadding: false,
    textAlign: 'center',
  },
  title: {
    fontFamily: 'Montserrat_900Black',
    fontStyle: 'italic',
    fontSize: 32,
    fontWeight: '900',
    color: '#ff5c00',
    letterSpacing: 6,
    textAlign: 'center',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  subtitleLine: {
    width: 32,
    height: 1,
    backgroundColor: 'rgba(91,65,55,0.4)',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e4beb1',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff5c00',
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#ab897d',
    letterSpacing: 2,
    textTransform: 'uppercase',
    opacity: 0.6,
    marginTop: 8,
  },
});
