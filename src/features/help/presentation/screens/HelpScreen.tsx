import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import { Card } from '../../../../shared/components/ui/Card';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type HelpTab = 'faq' | 'contact';

type ContactRow = {
  icon: string;
  label: string;
  url?: string;
};

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

const CONTACT_ROWS: ContactRow[] = [
  { icon: '\uD83D\uDCAC', label: 'Customer Service', url: 'mailto:support@mr-training.com' },
  { icon: '\uD83C\uDF10', label: 'Website', url: 'https://mr-training.com' },
  { icon: '\uD83D\uDCF1', label: 'WhatsApp', url: 'https://wa.me/1234567890' },
  { icon: '\uD83D\uDCD8', label: 'Facebook', url: 'https://facebook.com/mrtraining' },
  { icon: '\uD83D\uDCF8', label: 'Instagram', url: 'https://instagram.com/mrtraining' },
];

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'How do I reset my password?',
    answer:
      'Go to Settings > Password Setting and follow the instructions. A reset link will be sent to your registered email address.',
  },
  {
    id: '2',
    question: 'How do I contact my coach?',
    answer:
      'Use the messaging feature inside your training plan. Navigate to the Coach tab and send a message directly.',
  },
  {
    id: '3',
    question: 'Can I change my training schedule?',
    answer:
      'Yes. Go to Profile > Horario de Entrenamiento to select your preferred training days and time slot.',
  },
  {
    id: '4',
    question: 'How do I cancel my membership?',
    answer:
      'Open your Profile and tap on Membership to manage your plan. You can cancel anytime before the next billing cycle.',
  },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HelpScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<HelpTab>('faq');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleContactPress = async (row: ContactRow) => {
    if (!row.url) {
      Alert.alert(row.label, 'Coming soon');
      return;
    }
    try {
      const canOpen = await Linking.canOpenURL(row.url);
      if (canOpen) await Linking.openURL(row.url);
      else Alert.alert(row.label, 'Unable to open this link.');
    } catch {
      Alert.alert(row.label, 'Something went wrong. Please try again.');
    }
  };

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
          <Text style={styles.backChevron}>{'\u2039'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Help & FAQs</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>How Can We Help You?</Text>

      {/* Tab pills */}
      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setTab('faq')}
          style={[styles.tabPill, tab === 'faq' ? styles.tabPillActive : styles.tabPillInactive]}
        >
          <Text style={[styles.tabText, tab === 'faq' ? styles.tabTextActive : styles.tabTextInactive]}>
            FAQ
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('contact')}
          style={[styles.tabPill, tab === 'contact' ? styles.tabPillActive : styles.tabPillInactive]}
        >
          <Text
            style={[styles.tabText, tab === 'contact' ? styles.tabTextActive : styles.tabTextInactive]}
          >
            Contact Us
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.bodyWrap}>
        {tab === 'faq' ? (
          <Card style={styles.card}>
            {FAQ_DATA.map((item, i) => {
              const expanded = expandedId === item.id;
              return (
                <React.Fragment key={item.id}>
                  <Pressable
                    style={({ pressed }) => [styles.faqRow, pressed && styles.pressed]}
                    onPress={() => toggleFaq(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={item.question}
                    accessibilityState={{ expanded }}
                  >
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                    <Text style={styles.faqChevron}>{expanded ? '\u25B4' : '\u25BE'}</Text>
                  </Pressable>
                  {expanded ? (
                    <View style={styles.faqAnswerWrap}>
                      <Text style={styles.faqAnswer}>{item.answer}</Text>
                    </View>
                  ) : null}
                  {i < FAQ_DATA.length - 1 && <View style={styles.separator} />}
                </React.Fragment>
              );
            })}
          </Card>
        ) : (
          <Card style={styles.card}>
            {CONTACT_ROWS.map((row, i) => (
              <React.Fragment key={row.label}>
                <Pressable
                  style={({ pressed }) => [styles.contactRow, pressed && styles.pressed]}
                  onPress={() => handleContactPress(row)}
                  accessibilityRole="button"
                  accessibilityLabel={row.label}
                >
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconText}>{row.icon}</Text>
                  </View>
                  <Text style={styles.contactLabel}>{row.label}</Text>
                  <Text style={styles.contactChevron}>{'\u25B8'}</Text>
                </Pressable>
                {i < CONTACT_ROWS.length - 1 && <View style={styles.separator} />}
              </React.Fragment>
            ))}
          </Card>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
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
  headerSpacer: { width: 32 },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tabPill: {
    flex: 1,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  tabPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabPillInactive: { backgroundColor: 'transparent', borderColor: colors.border },
  tabText: { fontFamily: fontFamilies.bodySemiBold, fontSize: 14, lineHeight: 20 },
  tabTextActive: { color: colors.base },
  tabTextInactive: { color: colors.textSecondary },
  bodyWrap: { flex: 1, padding: spacing.md },
  card: { padding: 0, overflow: 'hidden' },
  // FAQ
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.md,
  },
  faqQuestion: { flex: 1, ...typography.bodyStrong, color: colors.text },
  faqChevron: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  faqAnswerWrap: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  faqAnswer: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  // Contact
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 14, color: '#FFFFFF', textAlign: 'center' },
  contactLabel: { flex: 1, ...typography.bodyStrong, color: colors.text },
  contactChevron: { fontSize: 20, color: colors.primary, fontWeight: '600' },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 48 + spacing.md },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
