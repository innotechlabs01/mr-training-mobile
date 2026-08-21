import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../infrastructure/api/client';
import { colors, spacing, typography, radius } from '../../../../shared/theme/tokens';
import { Card } from '../../../../shared/components/ui/Card';
import { Input } from '../../../../shared/components/ui/Input';
import { PrimaryButton } from '../../../../shared/components/ui/PrimaryButton';
import { MembershipIcon, StoreIcon } from '../../../../shared/components/icons';

type AthleteProfile = {
  id: string;
  name: string;
  sport: string;
  email: string;
  plan: { name: string; price: number };
  schedule: { days: string; time: string };
  schedule_days?: string;
  schedule_time?: string;
  readiness: { score: number };
  modality?: string;
  service_type?: string;
  serviceType?: string;
  emergency_contact?: string;
};

type Modality = 'virtual' | 'hibrido' | 'presencial';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_LABELS: Record<string, string> = {
  mon: 'L', tue: 'M', wed: 'M', thu: 'J', fri: 'V', sat: 'S', sun: 'D',
};
const DAY_FULL: Record<string, string> = {
  mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes', sat: 'Sábado', sun: 'Domingo',
};

function normalizeModality(value: unknown): Modality {
  const v = String(value ?? '').toLowerCase().trim();
  if (v === 'hibrido' || v === 'híbrido' || v === 'hybrid') return 'hibrido';
  if (v === 'presencial' || v === 'onsite' || v === 'in_person') return 'presencial';
  return 'virtual';
}

const MODALITY_OPTIONS: Array<{ key: Modality; label: string; icon: string }> = [
  { key: 'virtual', label: 'Virtual', icon: '🌐' },
  { key: 'hibrido', label: 'Híbrido', icon: '🔄' },
  { key: 'presencial', label: 'Presencial', icon: '🏢' },
];

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { signOut } = useAuth();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const openMembership = () => navigation.getParent()?.navigate('Membership');
  const openStore = () => navigation.getParent()?.navigate('Store');

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.firstName
        ? user.firstName[0].toUpperCase()
        : 'AT';

  const email = user?.emailAddresses?.[0]?.emailAddress ?? '';

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['athlete-profile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/athlete/profile');
      // API returns { profile, coaches } — profile may be null
      return (data.profile ?? data ?? null) as AthleteProfile | null;
    },
    staleTime: 10 * 60 * 1000,
  });

  // Personal info local state
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);

  // Modality local state — default virtual for new users
  const [modality, setModality] = useState<Modality>('virtual');
  const [modalitySaving, setModalitySaving] = useState<Modality | null>(null);

  // Emergency contact local state
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencySaving, setEmergencySaving] = useState(false);

  // Schedule local state
  const [scheduleDays, setScheduleDays] = useState<Set<string>>(new Set());
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleSaving, setScheduleSaving] = useState(false);

  // Sync Clerk user names when they load
  useEffect(() => {
    if (user?.firstName) setFirstName(user.firstName);
    if (user?.lastName) setLastName(user.lastName);
  }, [user?.firstName, user?.lastName]);

  // Sync modality + schedule + emergency contact from profile when available
  useEffect(() => {
    if (profile) {
      const raw = profile.modality ?? profile.service_type ?? profile.serviceType;
      setModality(normalizeModality(raw));
      setEmergencyContact(profile.emergency_contact ?? '');
      // Parse schedule days from "mon,tue,wed" or "Lunes,Martes" format
      const rawDays = profile.schedule_days ?? profile.schedule?.days ?? '';
      const daySet = new Set<string>();
      if (rawDays) {
        rawDays.split(',').map((d: string) => d.trim().toLowerCase()).forEach((d: string) => {
          // Match by short key or by full Spanish name
          const match = DAY_KEYS.find(k => k === d || DAY_FULL[k]?.toLowerCase() === d);
          if (match) daySet.add(match);
        });
      }
      setScheduleDays(daySet);
      setScheduleTime(profile.schedule_time ?? profile.schedule?.time ?? '');
    } else {
      setModality('virtual');
      setEmergencyContact('');
      setScheduleDays(new Set());
      setScheduleTime('');
    }
  }, [profile]);

  const handleSavePersonalInfo = async () => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn || !ln) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }
    if (fn.length < 2 || ln.length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters');
      return;
    }
    setSaving(true);
    try {
      // Update Clerk
      if (user) {
        await user.update({ firstName: fn, lastName: ln });
      }
      // Update backend
      await apiClient.put('/athlete/profile', { firstName: fn, lastName: ln });
      await queryClient.invalidateQueries({ queryKey: ['athlete-profile'] });
      Alert.alert('Success', 'Your profile has been updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleModalitySelect = async (next: Modality) => {
    if (next === modality) return;
    const prev = modality;
    setModality(next);
    setModalitySaving(next);
    try {
      await apiClient.put('/athlete/profile', { modality: next });
      await queryClient.invalidateQueries({ queryKey: ['athlete-profile'] });
    } catch (err: unknown) {
      setModality(prev);
      const msg = err instanceof Error ? err.message : 'Failed to update training mode';
      Alert.alert('Error', msg);
    } finally {
      setModalitySaving(null);
    }
  };

  const handleSaveEmergency = async () => {
    setEmergencySaving(true);
    try {
      await apiClient.put('/athlete/profile', { emergencyContact });
      await queryClient.invalidateQueries({ queryKey: ['athlete-profile'] });
      Alert.alert('Guardado', 'Contacto de emergencia actualizado');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update';
      Alert.alert('Error', msg);
    } finally {
      setEmergencySaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setScheduleDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const handleSaveSchedule = async () => {
    setScheduleSaving(true);
    try {
      const daysStr = Array.from(scheduleDays).join(',');
      await apiClient.put('/athlete/profile', { scheduleDays: daysStr, scheduleTime });
      await queryClient.invalidateQueries({ queryKey: ['athlete-profile'] });
      Alert.alert('Guardado', 'Horario de entrenamiento actualizado');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update';
      Alert.alert('Error', msg);
    } finally {
      setScheduleSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{initials}</Text>
            </View>
            <View style={styles.heroText}>
              <View style={styles.heroNameRow}>
                <Text style={styles.heroName} numberOfLines={1}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.heroEditIcon} accessibilityLabel="Edit profile">
                  ✎
                </Text>
              </View>
              {email ? (
                <Text style={styles.heroEmail} numberOfLines={1}>
                  {email}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Entry cards: Membership / Store */}
          <Card style={styles.entryCard}>
            <MembershipIcon size={24} color={colors.primary} />
            <View style={styles.entryText}>
              <Text style={styles.entryTitle}>Membership</Text>
              <Text style={styles.entrySub}>Manage your plan, payments and status</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Open membership" onPress={openMembership} style={styles.entryCta}>
              <Text style={styles.entryCtaText}>Open</Text>
            </Pressable>
          </Card>
          <Card style={styles.entryCard}>
            <StoreIcon size={24} color={colors.primary} />
            <View style={styles.entryText}>
              <Text style={styles.entryTitle}>Store</Text>
              <Text style={styles.entrySub}>Browse coach-curated gear</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Open store" onPress={openStore} style={styles.entryCta}>
              <Text style={styles.entryCtaText}>Open</Text>
            </Pressable>
          </Card>

          {/* Card 1: Personal Info */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Personal Info</Text>
            <Text style={styles.cardSubtitle}>Update your personal details</Text>

            <Text style={styles.label}>First Name</Text>
            <Input
              placeholder="John"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoCorrect={false}
              accessibilityLabel="First name"
              returnKeyType="next"
            />

            <Text style={styles.label}>Last Name</Text>
            <Input
              placeholder="Doe"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              autoCorrect={false}
              accessibilityLabel="Last name"
              returnKeyType="next"
            />

            <Text style={styles.label}>Email</Text>
            <View style={styles.readOnlyWrap}>
              <Text style={styles.readOnlyText} numberOfLines={1}>
                {email || '—'}
              </Text>
              <Text style={styles.readOnlyHint}>Read-only</Text>
            </View>

            <PrimaryButton label="Save" onPress={handleSavePersonalInfo} disabled={saving} />
          </Card>

          {/* Card 2: Training Mode */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Training Mode</Text>
            <Text style={styles.cardSubtitle}>Choose how you train with your coach</Text>

            <View style={styles.segmentedRow}>
              {MODALITY_OPTIONS.map((opt) => {
                const selected = modality === opt.key;
                const isSaving = modalitySaving === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    style={({ pressed }) => [
                      styles.pill,
                      selected ? styles.pillSelected : styles.pillUnselected,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handleModalitySelect(opt.key)}
                    disabled={!!modalitySaving}
                    accessibilityLabel={`Training mode ${opt.label}`}
                    accessibilityState={{ selected }}
                  >
                    <Text style={styles.pillIcon}>{opt.icon}</Text>
                    <Text style={[styles.pillText, selected ? styles.pillTextSelected : styles.pillTextUnselected]}>
                      {opt.label}
                    </Text>
                    {isSaving ? (
                      <ActivityIndicator size="small" color={selected ? colors.base : colors.primary} style={styles.pillLoader} />
                    ) : selected ? (
                      <Text style={styles.pillCheck}>✓</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.modalityHint}>
              Current: <Text style={styles.modalityHintStrong}>{MODALITY_OPTIONS.find((o) => o.key === modality)?.label ?? 'Virtual'}</Text>
            </Text>
          </Card>

          {/* Card: Training Schedule */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Horario de Entrenamiento</Text>
            <Text style={styles.cardSubtitle}>Seleccioná los días y horario</Text>

            <View style={styles.dayRow}>
              {DAY_KEYS.map((day) => {
                const selected = scheduleDays.has(day);
                return (
                  <Pressable
                    key={day}
                    style={({ pressed }) => [
                      styles.dayChip,
                      selected ? styles.dayChipSelected : styles.dayChipUnselected,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => toggleDay(day)}
                    accessibilityLabel={DAY_FULL[day]}
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.dayChipText, selected && styles.dayChipTextSelected]}>
                      {DAY_LABELS[day]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Horario</Text>
            <Input
              placeholder="08:00"
              value={scheduleTime}
              onChangeText={setScheduleTime}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              accessibilityLabel="Training time"
            />

            <PrimaryButton label="Guardar Horario" onPress={handleSaveSchedule} disabled={scheduleSaving} />
          </Card>

          {/* Card: Emergency Contact */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Contacto de Emergencia</Text>
            <Text style={styles.cardSubtitle}>Nombre y teléfono de tu contacto</Text>

            <Input
              placeholder="Nombre — Teléfono"
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              autoCapitalize="words"
              autoCorrect={false}
              accessibilityLabel="Emergency contact"
            />

            <PrimaryButton label="Guardar Contacto" onPress={handleSaveEmergency} disabled={emergencySaving} />
          </Card>

          {/* Card 3: Membership / Plan */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Membership</Text>
            <Text style={styles.cardSubtitle}>Your current plan</Text>
            {profileLoading ? (
              <ActivityIndicator color={colors.primary} style={styles.membershipLoader} />
            ) : profile ? (
              <View style={styles.membershipContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Plan</Text>
                  <Text style={styles.infoValue}>{profile.plan?.name || 'No plan'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Sport</Text>
                  <Text style={styles.infoValue}>{profile.sport || '—'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Schedule</Text>
                  <Text style={styles.infoValue}>
                    {(() => {
                      const days = profile.schedule_days ?? profile.schedule?.days ?? '';
                      const time = profile.schedule_time ?? profile.schedule?.time ?? '';
                      if (!days && !time) return '—';
                      // Expand day keys to full names
                      const expanded = days.split(',').map((d: string) => {
                        const key = d.trim().toLowerCase();
                        return DAY_FULL[key] ?? d.trim();
                      }).filter(Boolean).join(', ');
                      return `${expanded}${time ? ' · ' + time : ''}`;
                    })()}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Emergency</Text>
                  <Text style={styles.infoValue}>{profile.emergency_contact || '—'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Readiness</Text>
                  <Text style={[styles.infoValue, { color: colors.primary }]}>
                    {profile.readiness?.score ?? '—'}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>No membership information available</Text>
            )}
          </Card>

          {/* Card 4: Actions */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Actions</Text>
            <Pressable
              style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
              onPress={handleSignOut}
              accessibilityLabel="Sign out of your account"
              accessibilityRole="button"
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  flex: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingTop: spacing.lg, gap: spacing.md, paddingBottom: 100 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLargeText: { ...typography.title, color: colors.base },
  heroText: { flex: 1, gap: 2 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  heroName: { ...typography.title, color: colors.text, flexShrink: 1 },
  heroEditIcon: { fontSize: 16, color: colors.textSecondary },
  heroEmail: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  card: { padding: spacing.lg },
  entryCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  entryText: { flex: 1, gap: 2 },
  entryTitle: { ...typography.bodyStrong, color: colors.text },
  entrySub: { ...typography.caption, color: colors.textSecondary },
  entryCta: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: `${colors.primary}22`,
  },
  entryCtaText: { ...typography.label, color: colors.primary },
  cardTitle: { ...typography.title, color: colors.text },
  cardSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.md },
  label: { ...typography.caption, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.md },
  readOnlyWrap: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    minHeight: spacing.lg * 2,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    opacity: 0.85,
  },
  readOnlyText: { ...typography.body, color: colors.textSecondary, flex: 1 },
  readOnlyHint: { ...typography.caption, color: colors.textSecondary, marginLeft: spacing.sm, fontWeight: '600' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  segmentedRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  pill: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 72,
  },
  pillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillUnselected: { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
  pillIcon: { fontSize: 18 },
  pillText: { ...typography.caption, fontWeight: '700', textAlign: 'center' },
  pillTextSelected: { color: colors.base },
  pillTextUnselected: { color: colors.text },
  pillCheck: { fontSize: 12, color: colors.base, fontWeight: '700', marginTop: 2 },
  pillLoader: { marginTop: 2 },
  modalityHint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' },
  modalityHintStrong: { color: colors.text, fontWeight: '600' },
  dayRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  dayChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipUnselected: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
  },
  dayChipText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
  },
  dayChipTextSelected: {
    color: colors.base,
  },
  membershipContent: { gap: 0 },
  membershipLoader: { marginTop: spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md, alignItems: 'center' },
  divider: { height: 1, backgroundColor: colors.border },
  infoLabel: { ...typography.body, color: colors.textSecondary },
  infoValue: { ...typography.body, color: colors.text, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  emptyText: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  signOutButton: {
    backgroundColor: colors.error,
    minHeight: spacing.lg * 2,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  signOutText: { ...typography.bodyStrong, color: colors.text },
});
