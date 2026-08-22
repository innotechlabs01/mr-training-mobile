import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../infrastructure/api/client';
import { colors } from '../../../../shared/theme/tokens';
import { ScreenHeader } from '../../../../shared/components/ui/ScreenHeader';
import { PrimaryButton } from '../../../../shared/components/ui/PrimaryButton';

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
  if (s === 'active') return colors.success;
  if (s === 'grace_period' || s === 'grace') return colors.warning;
  if (s === 'suspended' || s === 'expired' || s === 'past_due') return colors.error;
  return colors.textSecondary;
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

export function MembershipScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [isPaying, setIsPaying] = useState(false);

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

  // Refresh membership after returning from the external Polar checkout browser.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        queryClient.invalidateQueries({ queryKey: ['athlete-membership'] });
      }
    });
    return () => sub.remove();
  }, [queryClient]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <ScreenHeader title="Tu Plan" onBack={() => navigation.goBack()} />
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
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

  const handlePay = async () => {
    const membershipId = rawMembership?.id ?? data?.id;
    if (!membershipId) {
      Alert.alert('Pay Membership', 'Membership is not available. Please contact your coach.');
      return;
    }
    setIsPaying(true);
    try {
      const { data: res } = await apiClient.post('/polar/checkout', { membershipId });
      if (res?.url) {
        await Linking.openURL(res.url);
      } else {
        Alert.alert('Checkout', 'Unable to start secure checkout.');
      }
    } catch (e) {
      console.error('Failed to start checkout', e);
      Alert.alert('Checkout', 'Something went wrong. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Tu Plan" onBack={() => navigation.goBack()} />

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
        <PrimaryButton
          label={
            isPayable
              ? 'Pay Now'
              : `Al dia - Proximo vencimiento ${formatDate(effectiveDueDate ?? undefined)}`
          }
          onPress={handlePay}
          disabled={!isPayable || isPaying}
        />

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  content: { padding: 24, flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12 },
  loadingText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, fontWeight: '400', color: colors.textSecondary, lineHeight: 20 },

  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  heroAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  planName: { fontSize: 20, fontWeight: '700', color: colors.text, lineHeight: 26 },
  planPrice: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 6 },
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
  dateText: { fontSize: 12, fontWeight: '400', color: colors.textSecondary, lineHeight: 16 },

  section: { marginTop: 24 },
  sectionEyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2, color: colors.textSecondary, marginBottom: 12 },
  historyEmpty: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
  },
  historyEmptyText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  paymentsList: { gap: 8 },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
  },
  paymentLeft: { gap: 2 },
  paymentAmount: { fontSize: 14, fontWeight: '700', color: colors.text },
  paymentDate: { fontSize: 12, fontWeight: '400', color: colors.textSecondary },
  paymentRight: { alignItems: 'flex-end', gap: 4, flexShrink: 1 },
  miniPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${colors.border}33`,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: `${colors.border}66`,
  },
  miniDot: { width: 6, height: 6, borderRadius: 3 },
  miniPillText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, textTransform: 'capitalize' },
  txnText: { fontSize: 11, fontWeight: '400', color: colors.textSecondary, maxWidth: 120 },
});
