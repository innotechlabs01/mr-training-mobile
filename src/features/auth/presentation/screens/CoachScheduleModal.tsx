import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { getAvailability, createAppointment } from '../../schedulingService';
import { colors, spacing, typography, radius } from '../../../../shared/theme/tokens';

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
      const slots = await getAvailability();
      setAvailability(slots);
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
      await createAppointment({
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
              <ActivityIndicator size="large" color={colors.primary} />
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
  container: { flex: 1, backgroundColor: colors.base },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingBottom: 0 },
  title: { ...typography.title, fontSize: 22, color: colors.text },
  closeBtn: { width: 32, height: 32, borderRadius: radius.md, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  closeText: { ...typography.caption, fontSize: 16, color: colors.textSecondary },
  content: { padding: spacing.lg },
  subtitle: { ...typography.body, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.lg },
  sectionTitle: { ...typography.bodyStrong, fontSize: 16, color: colors.text, marginBottom: spacing.sm },
  daysScroll: { marginBottom: spacing.lg },
  dayChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  dayChipActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
  dayChipDisabled: { opacity: 0.4 },
  dayLabel: { ...typography.bodyStrong, fontSize: 14, color: colors.text },
  dayLabelActive: { color: colors.primary },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  slotChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  slotChipActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
  slotTime: { ...typography.bodyStrong, fontSize: 15, color: colors.text },
  slotTimeActive: { color: colors.primary },
  noSlots: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  scheduleBtn: { backgroundColor: colors.primary, height: 52, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginTop: spacing.sm },
  scheduleBtnDisabled: { opacity: 0.5 },
  scheduleBtnText: { ...typography.bodyStrong, fontSize: 16, color: colors.base },
  loadingCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  loadingText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.sm },
  emptyTitle: { ...typography.title, fontSize: 18, color: colors.text, marginBottom: spacing.sm },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  laterBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md },
  laterBtnText: { ...typography.bodyStrong, fontSize: 15, color: colors.base },
});
