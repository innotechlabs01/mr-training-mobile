import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { apiClient } from '../../../../infrastructure/api/client';
import { darkTheme } from '../../../../shared/theme';

type Props = {
  visible: boolean;
  coachId: string;
  athleteId: string;
  athleteName: string;
  onScheduled: () => void;
  onClose: () => void;
};

type AvailabilitySlot = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function CoachScheduleModal({ visible, coachId, athleteId, athleteName, onScheduled, onClose }: Props) {
  const { isSignedIn } = useAuth();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (visible && coachId) {
      fetchAvailability();
    }
  }, [visible, coachId]);

  const fetchAvailability = async () => {
    setFetching(true);
    try {
      const { data } = await apiClient.get('/athlete/availability');
      setAvailability(data.availability || []);
    } catch {
      // Coach might not have set availability yet
      setAvailability([]);
    } finally {
      setFetching(false);
    }
  };

  // Generate next 14 days
  const getUpcomingDays = () => {
    const days = [];
    const now = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: date.getDay(),
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      });
    }
    return days;
  };

  const upcomingDays = getUpcomingDays();
  const slotsForDay = selectedDate
    ? availability.filter(s => s.dayOfWeek === new Date(selectedDate).getDay())
    : [];

  const handleSchedule = async () => {
    if (!selectedSlot || !selectedDate) {
      Alert.alert('Error', 'Please select a day and time slot');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/athlete/appointments', {
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: `Onboarding consultation for ${athleteName}`,
      });
      Alert.alert('Scheduled!', 'Your consultation has been booked. Check your email for details.', [
        { text: 'OK', onPress: onScheduled },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Schedule Consultation</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.subtitle}>
            Book a call with your coach to review your plan and get started.
          </Text>

          {fetching ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={darkTheme.colors.primary} />
              <Text style={styles.loadingText}>Loading availability...</Text>
            </View>
          ) : availability.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.emptyTitle}>No availability set</Text>
              <Text style={styles.emptyText}>Your coach hasn&apos;t set their schedule yet. You can start training now and schedule later.</Text>
              <Pressable style={styles.laterBtn} onPress={onScheduled}>
                <Text style={styles.laterBtnText}>Start Training Now</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Select a Day</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
                {upcomingDays.map((day) => {
                  const hasSlots = availability.some(s => s.dayOfWeek === day.dayOfWeek);
                  const isSelected = selectedDate === day.date;
                  return (
                    <Pressable
                      key={day.date}
                      style={[styles.dayChip, isSelected && styles.dayChipActive, !hasSlots && styles.dayChipDisabled]}
                      onPress={() => hasSlots && setSelectedDate(day.date)}
                      disabled={!hasSlots}
                    >
                      <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>{day.label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {selectedDate && (
                <>
                  <Text style={styles.sectionTitle}>Select a Time</Text>
                  {slotsForDay.length === 0 ? (
                    <Text style={styles.noSlots}>No available slots for this day</Text>
                  ) : (
                    <View style={styles.slotsGrid}>
                      {slotsForDay.map((slot) => (
                        <Pressable
                          key={slot.id}
                          style={[styles.slotChip, selectedSlot?.id === slot.id && styles.slotChipActive]}
                          onPress={() => setSelectedSlot(slot)}
                        >
                          <Text style={[styles.slotTime, selectedSlot?.id === slot.id && styles.slotTimeActive]}>
                            {slot.startTime}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </>
              )}

              {selectedSlot && selectedDate && (
                <Pressable
                  style={[styles.scheduleBtn, loading && styles.scheduleBtnDisabled]}
                  onPress={handleSchedule}
                  disabled={loading}
                >
                  <Text style={styles.scheduleBtnText}>
                    {loading ? 'Scheduling...' : 'Book Consultation'}
                  </Text>
                </Pressable>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: darkTheme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 0 },
  title: { fontSize: 22, fontWeight: '700', color: darkTheme.colors.text },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: darkTheme.colors.surface, justifyContent: 'center', alignItems: 'center' },
  closeText: { fontSize: 16, color: darkTheme.colors.textSecondary },
  content: { padding: 24 },
  subtitle: { fontSize: 15, color: darkTheme.colors.textSecondary, lineHeight: 22, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: darkTheme.colors.text, marginBottom: 12 },
  daysScroll: { marginBottom: 24 },
  dayChip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: darkTheme.colors.surface, borderWidth: 1, borderColor: darkTheme.colors.border, marginRight: 8 },
  dayChipActive: { borderColor: darkTheme.colors.primary, backgroundColor: `${darkTheme.colors.primary}10` },
  dayChipDisabled: { opacity: 0.4 },
  dayLabel: { fontSize: 14, color: darkTheme.colors.text, fontWeight: '600' },
  dayLabelActive: { color: darkTheme.colors.primary },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  slotChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: darkTheme.colors.surface, borderWidth: 1, borderColor: darkTheme.colors.border },
  slotChipActive: { borderColor: darkTheme.colors.primary, backgroundColor: `${darkTheme.colors.primary}10` },
  slotTime: { fontSize: 15, color: darkTheme.colors.text, fontWeight: '600' },
  slotTimeActive: { color: darkTheme.colors.primary },
  noSlots: { fontSize: 14, color: darkTheme.colors.textSecondary, marginBottom: 24 },
  scheduleBtn: { backgroundColor: darkTheme.colors.primary, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  scheduleBtnDisabled: { opacity: 0.5 },
  scheduleBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  loadingCard: { backgroundColor: darkTheme.colors.surface, borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: darkTheme.colors.border },
  loadingText: { fontSize: 15, color: darkTheme.colors.textSecondary, marginTop: 12 },
  emptyCard: { backgroundColor: darkTheme.colors.surface, borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: darkTheme.colors.border },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, color: darkTheme.colors.text, fontWeight: '700', marginBottom: 8 },
  emptyText: { fontSize: 14, color: darkTheme.colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  laterBtn: { backgroundColor: darkTheme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  laterBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
