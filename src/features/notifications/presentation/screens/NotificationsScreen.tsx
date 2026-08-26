import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../infrastructure/api/client';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type NotificationTab = 'reminders' | 'system';

type NotificationItem = {
  id: string;
  title: string;
  date: string;
  emoji: string;
  group: 'today' | 'yesterday' | 'older';
};

const GROUP_LABELS: Record<NotificationItem['group'], string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  older: 'Older',
};

const TABS: { key: NotificationTab; label: string }[] = [
  { key: 'reminders', label: 'Reminders' },
  { key: 'system', label: 'System' },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

function NotificationCard({ item }: { item: NotificationItem }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardIconCircle}>
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardDate}>{item.date}</Text>
      </View>
    </View>
  );
}

function getGroup(dateStr: string): NotificationItem['group'] {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return 'today';
  if (diffDays < 2) return 'yesterday';
  return 'older';
}

export function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<NotificationTab>('reminders');

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await apiClient.get('/athlete/notifications');
      return data as Array<{
        id: string;
        type: string;
        title: string;
        message: string;
        icon: string;
        read: boolean;
        createdAt: string;
      }>;
    },
    staleTime: 30_000,
  });

  const allItems: NotificationItem[] = (notifications ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    date: n.createdAt,
    emoji: n.icon || (n.type === 'reminder' ? '⭐' : '📄'),
    group: getGroup(n.createdAt),
  }));

  const filtered = allItems.filter((n) => {
    if (tab === 'reminders') return !n.id.startsWith('sys-');
    return true;
  });

  const groups = filtered.reduce<Record<string, NotificationItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  const groupOrder: NotificationItem['group'][] = ['today', 'yesterday', 'older'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.backButton}
        >
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight}>
          <Pressable accessibilityLabel="Search" onPress={() => undefined} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>🔍</Text>
          </Pressable>
          <Pressable accessibilityLabel="Notifications" onPress={() => undefined} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>🔔</Text>
          </Pressable>
          <Pressable accessibilityLabel="Profile" onPress={() => undefined} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>👤</Text>
          </Pressable>
        </View>
      </View>

      {/* Tab pills */}
      <View style={styles.tabRow}>
        {TABS.map((t) => {
          const selected = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.pill, selected ? styles.pillSelected : styles.pillUnselected]}
            >
              <Text style={[styles.pillText, selected ? styles.pillTextSelected : styles.pillTextUnselected]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Grouped notification list */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          groupOrder.map((groupKey) => {
            const items = groups[groupKey];
            if (!items || items.length === 0) return null;
            return (
              <View key={groupKey} style={styles.groupSection}>
                <Text style={styles.groupLabel}>{GROUP_LABELS[groupKey]}</Text>
                <View style={styles.groupCards}>
                  {items.map((item) => (
                    <NotificationCard key={item.id} item={item} />
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },

  // Header — mirrors SearchScreen pattern
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: { color: colors.primary, fontSize: 32, lineHeight: 32, fontWeight: '400' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.primary,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: { fontSize: 14 },

  // Tab pills — mirrors SearchScreen filter pills
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  pill: {
    height: 36,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillUnselected: { backgroundColor: colors.surface, borderColor: colors.border },
  pillText: { fontFamily: fontFamilies.bodySemiBold, fontSize: 13, lineHeight: 16 },
  pillTextSelected: { color: colors.base, fontWeight: '700' },
  pillTextUnselected: { color: colors.textSecondary },

  // List
  listContent: { padding: spacing.md, paddingBottom: 32, gap: spacing.lg },

  // Group sections
  groupSection: { gap: spacing.sm },
  groupLabel: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    paddingHorizontal: spacing.xs,
  },
  groupCards: { gap: spacing.sm },

  // Notification card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 18 },
  cardContent: { flex: 1, gap: 2 },
  cardTitle: { ...typography.bodyStrong, color: colors.text, fontSize: 14, lineHeight: 18 },
  cardDate: { ...typography.caption, color: colors.primary, fontSize: 12 },
  loadingWrap: { alignItems: 'center', paddingVertical: spacing.xl },
});
