import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { darkTheme } from '../../../../shared/theme';

const RECOVERY = {
  readiness: { score: 85, status: 'Ready to Train' },
  sleep: { hours: 7.5, quality: 'Good', deep: '2h 15m', rem: '1h 50m' },
  hrv: { value: 68, trend: '+5 from yesterday' },
  recommendations: [
    'Foam roll quads and hamstrings for 10 minutes',
    'Cold shower or ice bath for recovery',
    'Focus on hydration — aim for 3L today',
    'Yoga flow before bed for better sleep quality',
  ],
};

function getScoreColor(score: number): string {
  if (score >= 80) return darkTheme.colors.success;
  if (score >= 60) return darkTheme.colors.warning;
  return darkTheme.colors.destructive;
}

export function RecoveryScreen() {
  const scoreColor = getScoreColor(RECOVERY.readiness.score);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} tintColor={darkTheme.colors.primary} />}
      >
        <Text style={styles.eyebrow}>RECOVERY LAB</Text>
        <Text style={styles.title}>Readiness</Text>

        <View style={styles.scoreHero}>
          <View style={[styles.outerRing, { borderColor: `${scoreColor}4D` }]}>
            <View style={[styles.innerCircle, { backgroundColor: scoreColor }]}>
              <Text style={styles.scoreValue}>{RECOVERY.readiness.score}</Text>
            </View>
          </View>
          <Text style={[styles.scoreLabel, { color: scoreColor }]}>{RECOVERY.readiness.status.toUpperCase()}</Text>
          <Text style={styles.scoreHint}>Recovery score based on sleep & HRV</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{RECOVERY.sleep.hours}h</Text>
            <Text style={styles.statLabel}>Sleep</Text>
            <Text style={styles.statDetail}>Deep {RECOVERY.sleep.deep}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{RECOVERY.hrv.value}</Text>
            <Text style={styles.statLabel}>HRV</Text>
            <Text style={styles.statDetail}>{RECOVERY.hrv.trend}</Text>
          </View>
        </View>

        <Text style={styles.sectionEyebrow}>RECOMMENDATIONS</Text>
        {RECOVERY.recommendations.map((rec, i) => (
          <View key={i} style={styles.recCard}>
            <View style={styles.recAccent} />
            <View style={styles.recBullet} />
            <Text style={styles.recText}>{rec}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: darkTheme.colors.background },
  content: { padding: 24, paddingBottom: 100 },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    color: darkTheme.colors.primary,
    marginBottom: 6,
  },
  title: { fontSize: 28, color: darkTheme.colors.text, fontWeight: '700', lineHeight: 34, marginBottom: 24 },

  scoreHero: { alignItems: 'center', marginBottom: 24, gap: 8 },
  outerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: { fontSize: 36, fontWeight: '800', color: '#FFFFFF', lineHeight: 36 },
  scoreLabel: { fontSize: 14, fontWeight: '600', letterSpacing: 1.2, marginTop: 8 },
  scoreHint: { fontSize: 12, fontWeight: '400', color: darkTheme.colors.textSecondary, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    gap: 2,
  },
  statValue: { fontSize: 28, fontWeight: '700', color: darkTheme.colors.primary, lineHeight: 32 },
  statLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, color: darkTheme.colors.textSecondary, textTransform: 'uppercase' },
  statDetail: { fontSize: 12, fontWeight: '400', color: darkTheme.colors.textSecondary, marginTop: 4 },

  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: darkTheme.colors.textSecondary,
    marginBottom: 12,
  },
  recCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    padding: 16,
    paddingLeft: 18,
    marginBottom: 8,
    gap: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  recAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: darkTheme.colors.primary,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  recBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: darkTheme.colors.primary, marginTop: 7 },
  recText: { flex: 1, fontSize: 14, fontWeight: '400', color: darkTheme.colors.text, lineHeight: 20 },
});
