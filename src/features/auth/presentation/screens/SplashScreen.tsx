import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { darkTheme } from '../../../../shared/theme';

/**
 * SplashScreen — "Elite Training Lab — Kinetic Energy"
 * Dark lab canvas, dual radial primary glows, geometric MR monogram
 * with kinetic pulse, editorial type and deterministic progress track.
 */

type Props = { onFinish: () => void };

export function SplashScreen({ onFinish }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const skipOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 500,
      delay: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(skipOpacity, {
      toValue: 1,
      duration: 400,
      delay: 800,
      useNativeDriver: true,
    }).start();

    Animated.timing(progressWidth, {
      toValue: 180,
      duration: 3500,
      delay: 300,
      useNativeDriver: false,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    pulse.start();

    const timer = setTimeout(onFinish, 3800);
    return () => { clearTimeout(timer); pulse.stop(); };
  }, [fadeAnim, pulseAnim, taglineOpacity, skipOpacity, progressWidth, onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <Animated.View style={[styles.skipWrap, { opacity: skipOpacity }]}>
        <Pressable onPress={onFinish} hitSlop={12} style={styles.skipHit}>
          <Text style={styles.skipText}>Skip →</Text>
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.centerBlock, { opacity: fadeAnim }]}>
        <Text style={styles.eyebrow}>ELITE PERFORMANCE</Text>

        <Animated.View style={[styles.logoOuter, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.logoInner}>
            <Text style={styles.logoText}>MR</Text>
          </View>
        </Animated.View>

        <Text style={styles.brandText}>MR TRAINING</Text>
        <View style={styles.divider} />
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          DISCIPLINA. FUERZA. LEGADO.
        </Animated.Text>

        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.progressLabel}>CARGANDO TU SESIÓN...</Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 MAO Coaching</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: darkTheme.colors.background,
    justifyContent: 'center', alignItems: 'center',
  },
  glowTop: {
    position: 'absolute', top: -80, right: -80,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: `${darkTheme.colors.primary}1F`,
  },
  glowBottom: {
    position: 'absolute', bottom: -80, left: -80,
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: `${darkTheme.colors.primary}14`,
  },
  skipWrap: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 2,
  },
  skipHit: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '500',
    color: darkTheme.colors.textSecondary,
    letterSpacing: 0.6,
  },
  centerBlock: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  eyebrow: {
    fontSize: 10, fontWeight: '700', color: darkTheme.colors.primary,
    letterSpacing: 3, marginBottom: 24,
  },
  logoOuter: {
    width: 96, height: 96, borderRadius: 48, borderWidth: 1.5,
    borderColor: `${darkTheme.colors.primary}33`, justifyContent: 'center', alignItems: 'center',
    backgroundColor: `${darkTheme.colors.primary}0D`,
  },
  logoInner: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: darkTheme.colors.surface,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: darkTheme.colors.border,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: darkTheme.colors.text,
    letterSpacing: 1.5,
  },
  brandText: {
    fontSize: 34,
    fontWeight: '900',
    color: darkTheme.colors.text,
    letterSpacing: 5,
    marginTop: 20,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: darkTheme.colors.primary,
    marginVertical: 16,
    opacity: 0.8,
    borderRadius: 1,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '600',
    color: darkTheme.colors.textSecondary,
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  progressWrap: {
    marginTop: 36,
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    width: 180, height: 2, borderRadius: 1, backgroundColor: darkTheme.colors.surface,
    borderWidth: 1, borderColor: darkTheme.colors.border, overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    backgroundColor: darkTheme.colors.primary,
    borderRadius: 1,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: darkTheme.colors.textSecondary,
    letterSpacing: 2,
    opacity: 0.6,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    fontWeight: '400',
    color: darkTheme.colors.textSecondary,
    opacity: 0.4,
    letterSpacing: 0.5,
  },
});
