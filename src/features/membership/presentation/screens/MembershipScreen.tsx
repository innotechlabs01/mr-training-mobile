import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Alert,
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

type MembershipResponse = {
  membership?: {
    id: string;
    planName: string;
    planPrice: number;
    paymentDueDate: string;
    currentPeriodEnd: string;
    startDate?: string;
    currentPeriodStart?: string;
    status?: string;
    athleteId: string;
    coachId: string;
  } | null;
  payments?: Array<{
    id: string;
    amount: number;
    date?: string;
    createdAt?: string;
    paymentDate?: string;
    status?: string;
    transactionId?: string;
    reference?: string;
  }>;
  isPayable?: boolean;
  status?: string;
  planName?: string;
  planPrice?: number;
  paymentDueDate?: string;
  currentPeriodEnd?: string;
  currentPeriodStart?: string;
  athleteId?: string;
  coachId?: string;
  id?: string;
};

function getStatusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'active') return darkTheme.colors.success;
  if (s === 'grace_period' || s === 'grace') return darkTheme.colors.warning;
  if (s === 'suspended' || s === 'expired' || s === 'past_due') return darkTheme.colors.destructive;
  return darkTheme.colors.textSecondary;
}

function getStatusLabel(status: string): string {
  const s = status.toLowerCase();
  if (s === 'active') return 'Active';
  if (s === 'grace_period' || s === 'grace') return 'Grace Period';
  if (s === 'suspended') return 'Suspended';
  if (s === 'no_membership') return 'No membership';
  return status;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: number): string {
  return `$${Number(amount).toFixed(2)}`;
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

export function MembershipScreen() {
  const navigation = useNavigation<DrawerNavigationProp<AthleteDrawerParamList>>();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['athlete-membership'],
    queryFn: async () => {
      const { data } = await apiClient.get('/athlete/membership');
      return data as MembershipResponse;
    },
    staleTime: 2 * 60 * 1000,
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <HamburgerButton onPress={() => navigation.openDrawer()} />
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>MEMBRESIA</Text>
              <Text style={styles.title}>Tu Plan</Text>
            </View>
          </View>
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={darkTheme.colors.primary} />
            <Text style={styles.loadingText}>Cargando membresia...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Resolve membership fields — API may flatten or nest under .membership
  const rawMembership = data?.membership ?? null;
  const effectivePlanName = rawMembership?.planName ?? data?.planName ?? null;
  const effectivePlanPrice = rawMembership?.planPrice ?? data?.planPrice ?? null;
  const effectiveStatus = (rawMembership?.status ?? data?.status ?? 'active') as string;
  const effectiveDueDate = rawMembership?.paymentDueDate ?? data?.paymentDueDate ?? null;
  const effectivePeriodEnd = rawMembership?.currentPeriodEnd ?? data?.currentPeriodEnd ?? null;
  const effectivePeriodStart = rawMembership?.currentPeriodStart ?? (data as any)?.currentPeriodStart ?? rawMembership?.startDate ?? null;
  const payments = data?.payments ?? [];
  const isPayable = data?.isPayable ?? (effectiveStatus === 'grace_period' || effectiveStatus === 'suspended');
  const hasMembership = !!effectivePlanName || !!rawMembership;

  const statusColor = getStatusColor(effectiveStatus);

  const handlePay = () => {
    Alert.alert(
      'Pay Membership',
      `Pay ${effectivePlanPrice ? formatCurrency(effectivePlanPrice) : ''} for ${effectivePlanName ?? 'your plan'}. This will open Paddle checkout.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay now',
          onPress: () => Alert.alert('Checkout', 'Redirecting to Paddle checkout...'),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={darkTheme.colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <HamburgerButton onPress={() => navigation.openDrawer()} />
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>MEMBRESIA</Text>
            <Text style={styles.title}>Tu Plan</Text>
          </View>
        </View>

        {/* Hero card */}
        {!hasMembership ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>Sin membresia</Text>
            <Text style={styles.emptyText}>Tu coach asignara tu plan. Contacta a tu coach para activar tu membresia.</Text>
          </View>
        ) : (
          <View style={[styles.heroCard, { borderLeftColor: statusColor }]}>
            <View style={styles.heroAccent} />
            <Text style={styles.planName}>{effectivePlanName}</Text>
            {effectivePlanPrice != null && (
              <Text style={styles.planPrice}>{formatCurrency(effectivePlanPrice)}/mes</Text>
            )}
            <View style={styles.statusPillRow}>
              <View style={[styles.statusPill, { borderColor: `${statusColor}33`, backgroundColor: `${statusColor}15` }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusPillText, { color: statusColor }]}>{getStatusLabel(effectiveStatus)}</Text>
              </View>
            </View>

            <View style={styles.datesBlock}>
              {(effectivePeriodStart || effectivePeriodEnd) && (
                <Text style={styles.dateText}>
                  Periodo: {formatDate(effectivePeriodStart ?? undefined)} → {formatDate(effectivePeriodEnd ?? undefined)}
                </Text>
              )}
              {effectiveDueDate && <Text style={styles.dateText}>Vence: {formatDate(effectiveDueDate)}</Text>}
              <Text style={styles.dateText}>Estado: {getStatusLabel(effectiveStatus)}</Text>
            </View>
          </View>
        )}

        {/* Payment history */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>HISTORIAL DE PAGOS</Text>
          {payments.length === 0 ? (
            <View style={styles.historyEmpty}>
              <Text style={styles.historyEmptyText}>Sin pagos aun</Text>
            </View>
          ) : (
            <View style={styles.paymentsList}>
              {payments.map((p) => {
                const payDate = p.date ?? p.paymentDate ?? p.createdAt ?? '';
                const txn = p.transactionId ?? p.reference ?? p.id ?? '';
                const truncatedTxn = txn.length > 12 ? `${txn.slice(0, 12)}…` : txn;
                return (
                  <View key={p.id} style={styles.paymentRow}>
                    <View style={styles.paymentLeft}>
                      <Text style={styles.paymentAmount}>{formatCurrency(p.amount)}</Text>
                      <Text style={styles.paymentDate}>{formatDate(payDate)}</Text>
                    </View>
                    <View style={styles.paymentRight}>
                      {!!p.status && (
                        <View style={styles.miniPill}>
                          <View style={[styles.miniDot, { backgroundColor: getStatusColor(p.status) }]} />
                          <Text style={styles.miniPillText}>{p.status}</Text>
                        </View>
                      )}
                      {!!txn && <Text style={styles.txnText} numberOfLines={1}>{truncatedTxn}</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Pay button */}
        <Pressable
          style={({ pressed }) => [
            styles.payBtn,
            !isPayable && styles.payBtnDisabled,
            pressed && isPayable && { opacity: 0.85 },
          ]}
          onPress={handlePay}
          disabled={!isPayable}
          accessibilityLabel="Pay now"
          accessibilityState={{ disabled: !isPayable }}
        >
          <Text style={styles.payBtnText}>
            {isPayable ? 'Pay Now' : `Al dia - Proximo vencimiento ${formatDate(effectiveDueDate ?? undefined)}`}
          </Text>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: darkTheme.colors.background },
  content: { padding: 24, flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
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

  card: {
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    padding: 20,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: darkTheme.colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, fontWeight: '400', color: darkTheme.colors.textSecondary, lineHeight: 20 },

  heroCard: {
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    borderLeftWidth: 4,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  heroAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  planName: { fontSize: 20, fontWeight: '700', color: darkTheme.colors.text, lineHeight: 26 },
  planPrice: { fontSize: 16, fontWeight: '700', color: darkTheme.colors.primary, marginTop: 6 },
  statusPillRow: { flexDirection: 'row', marginTop: 12 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusPillText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  datesBlock: { marginTop: 14, gap: 4 },
  dateText: { fontSize: 12, fontWeight: '400', color: darkTheme.colors.textSecondary, lineHeight: 16 },

  section: { marginTop: 24 },
  sectionEyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2, color: darkTheme.colors.textSecondary, marginBottom: 12 },
  historyEmpty: {
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    padding: 20,
    alignItems: 'center',
  },
  historyEmptyText: { fontSize: 13, fontWeight: '500', color: darkTheme.colors.textSecondary },
  paymentsList: { gap: 8 },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    padding: 14,
    gap: 12,
  },
  paymentLeft: { gap: 2 },
  paymentAmount: { fontSize: 14, fontWeight: '700', color: darkTheme.colors.text },
  paymentDate: { fontSize: 12, fontWeight: '400', color: darkTheme.colors.textSecondary },
  paymentRight: { alignItems: 'flex-end', gap: 4, flexShrink: 1 },
  miniPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${darkTheme.colors.border}33`,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: `${darkTheme.colors.border}66`,
  },
  miniDot: { width: 6, height: 6, borderRadius: 3 },
  miniPillText: { fontSize: 11, fontWeight: '600', color: darkTheme.colors.textSecondary, textTransform: 'capitalize' },
  txnText: { fontSize: 11, fontWeight: '400', color: darkTheme.colors.textSecondary, maxWidth: 120 },

  payBtn: {
    marginTop: 24,
    height: 52,
    borderRadius: 14,
    backgroundColor: darkTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF', textAlign: 'center' },
});
