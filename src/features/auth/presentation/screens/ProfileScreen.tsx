import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../infrastructure/api/client';
import { darkTheme } from '../../../../shared/theme';

type AthleteProfile = {
  id: string;
  name: string;
  sport: string;
  email: string;
  plan: { name: string; price: number };
  schedule: { days: string; time: string };
  readiness: { score: number };
};

export function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'AT';

  const email = user?.emailAddresses?.[0]?.emailAddress ?? '';

  const { data: profile } = useQuery({
    queryKey: ['athlete-profile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/athlete/profile');
      return data.profile as AthleteProfile | null;
    },
    staleTime: 10 * 60 * 1000,
  });

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}

        {profile && (
          <>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sport</Text>
                <Text style={styles.infoValue}>{profile.sport}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Plan</Text>
                <Text style={styles.infoValue}>{profile.plan?.name || 'No plan'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Schedule</Text>
                <Text style={styles.infoValue}>{profile.schedule?.days || '—'} {profile.schedule?.time || ''}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{profile.readiness?.score ?? '—'}</Text>
                <Text style={styles.statLabel}>Readiness</Text>
              </View>
            </View>
          </>
        )}

        <Pressable
          style={({ pressed }) => [styles.signOutButton, pressed && { opacity: 0.8 }]}
          onPress={handleSignOut}
          accessibilityLabel="Sign out of your account"
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: darkTheme.colors.background },
  content: { flex: 1, alignItems: 'center', padding: 24, paddingTop: 48 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: darkTheme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { color: '#FFF', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 22, lineHeight: 28, color: darkTheme.colors.text, fontWeight: '700' },
  email: { fontSize: 17, color: darkTheme.colors.textSecondary, marginTop: 4, marginBottom: 24 },
  infoCard: { backgroundColor: darkTheme.colors.surface, borderRadius: 16, padding: 20, width: '100%', marginBottom: 16, borderWidth: 1, borderColor: darkTheme.colors.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  divider: { height: 1, backgroundColor: darkTheme.colors.border },
  infoLabel: { fontSize: 15, color: darkTheme.colors.textSecondary },
  infoValue: { fontSize: 15, color: darkTheme.colors.text, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8, width: '100%', marginBottom: 32 },
  statCard: { flex: 1, backgroundColor: darkTheme.colors.surface, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: darkTheme.colors.border },
  statValue: { fontSize: 20, color: darkTheme.colors.primary, fontWeight: '700' },
  statLabel: { fontSize: 12, color: darkTheme.colors.textSecondary, marginTop: 4 },
  signOutButton: { backgroundColor: darkTheme.colors.destructive, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  signOutText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
});
