import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../infrastructure/api/client';
import { darkTheme } from '../../../../shared/theme';

type AthleteDrawerParamList = {
  Today: undefined;
  Training: undefined;
  Nutrition: undefined;
  Recovery: undefined;
  Events: undefined;
  Store: undefined;
  Membership: undefined;
  Profile: undefined;
};

type EventItem = {
  id: string;
  title: string;
  date: string;
  time?: string;
  type?: string;
  location?: string;
  status?: string;
};

function getStatusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'confirmed' || s === 'active' || s === 'upcoming') return darkTheme.colors.success;
  if (s === 'pending' || s === 'scheduled') return darkTheme.colors.warning;
  if (s === 'cancelled' || s === 'canceled') return darkTheme.colors.destructive;
  return darkTheme.colors.textSecondary;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function HamburgerButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={({ pressed }) => [styles.hamburgerBtn, pressed && { opacity: 0.7 }]}
      accessibilityLabel="Open menu"
      accessibilityRole="button"
    >
      <View style={styles.hamburgerBar} />
      <View style={styles.hamburgerBar} />
      <View style={styles.hamburgerBar} />
    </Pressable>
  );
}

export function EventsScreen() {
  const navigation = useNavigation<DrawerNavigationProp<AthleteDrawerParamList>>();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['athlete-events'],
    queryFn: async () => {
      const { data } = await apiClient.get('/athlete/events');
      // API may return { events: [] } or direct array
      if (Array.isArray(data)) return data as EventItem[];
      if (Array.isArray(data.events)) return data.events as EventItem[];
      if (Array.isArray(data.data)) return data.data as EventItem[];
      return [] as EventItem[];
    },
    staleTime: 2 * 60 * 1000,
  });

  const events = data ?? [];
  const isEmpty = !isLoading && events.length === 0;

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={darkTheme.colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <HamburgerButton onPress={() => navigation.openDrawer()} />
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>EVENTOS</Text>
            <Text style={styles.title}>Proximos Eventos</Text>
          </View>
        </View>

        {/* Loading */}
        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={darkTheme.colors.primary} />
            <Text style={styles.loadingText}>Cargando eventos...</Text>
          </View>
        ) : isEmpty ? (
          <View style={styles.emptyCenter}>
            <View style={styles.emptyCircle}>
              <Text style={styles.emptyDash}>—</Text>
            </View>
            <Text style={styles.emptyTitle}>No hay eventos</Text>
            <Text style={styles.emptyText}>Tu coach habilitara competencias y clinics aqui.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {events.map((ev) => (
              <View key={ev.id} style={styles.card}>
                <View style={styles.cardAccent} />
                <View style={styles.cardTopRow}>
                  <View style={[styles.typeDot, { backgroundColor: darkTheme.colors.success }]} />
                  <Text style={styles.typeText} numberOfLines={1}>
                    {(ev.type ?? 'Evento').toUpperCase()}
                  </Text>
                  {!!ev.status && (
                    <View style={styles.statusPill}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(ev.status) }]} />
                      <Text style={styles.statusText}>{ev.status}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {ev.title}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={2}>
                  {formatDate(ev.date)}
                  {ev.time ? ` · ${ev.time}` : ''}
                  {ev.location ? ` · ${ev.location}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: darkTheme.colors.background },
  content: { padding: 24, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: darkTheme.colors.surface,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  hamburgerBar: { width: 18, height: 2, borderRadius: 1, backgroundColor: darkTheme.colors.primary },
  headerText: { flex: 1, gap: 4 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2.5, color: darkTheme.colors.primary },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700', color: darkTheme.colors.text },
  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12 },
  loadingText: { fontSize: 13, fontWeight: '500', color: darkTheme.colors.textSecondary },
  emptyCenter: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: darkTheme.colors.surface,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDash: { fontSize: 22, fontWeight: '400', color: darkTheme.colors.textSecondary, lineHeight: 22 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: darkTheme.colors.text, marginTop: 4 },
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
    color: darkTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  list: { gap: 12 },
  card: {
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    padding: 16,
    paddingLeft: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: darkTheme.colors.primary,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  typeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, color: darkTheme.colors.primary, flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: darkTheme.colors.text, lineHeight: 22, marginBottom: 6 },
  cardMeta: { fontSize: 13, fontWeight: '400', color: darkTheme.colors.textSecondary, lineHeight: 18 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${darkTheme.colors.border}33`,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${darkTheme.colors.border}66`,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600', color: darkTheme.colors.textSecondary, textTransform: 'capitalize' },
});
