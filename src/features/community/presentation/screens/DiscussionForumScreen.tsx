import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type Message = {
  id: string;
  name: string;
  message: string;
  time: string;
};

const MESSAGES: Message[] = [
  { id: '1', name: 'Alex M.', message: 'I find that focusing on compound lifts first gives me the best results for strength gains.', time: '2 min ago' },
  { id: '2', name: 'Jordan K.', message: 'What about progressive overload? I try to add 2.5kg each week on squats.', time: '5 min ago' },
  { id: '3', name: 'Sam R.', message: 'Don\'t forget recovery! Sleep and nutrition are half the battle.', time: '12 min ago' },
  { id: '4', name: 'Taylor W.', message: 'I\'ve been using RPE to gauge intensity. Works better than percentages for me.', time: '1 hr ago' },
  { id: '5', name: 'Casey L.', message: 'Anyone tried the 5/3/1 program? Thinking about switching to it.', time: '3 hr ago' },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DiscussionForumScreen() {
  const navigation = useNavigation<Nav>();
  const [inputText, setInputText] = useState('');

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
        <Text style={styles.headerTitle}>Discussion Forum</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Topic Title */}
      <View style={styles.topicSection}>
        <Text style={styles.topicTitle}>Strength Training Techniques</Text>
      </View>

      {/* Messages */}
      <ScrollView
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {MESSAGES.map((msg) => (
          <View key={msg.id} style={styles.messageRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{msg.name.charAt(0)}</Text>
            </View>
            <View style={styles.messageBody}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageName}>{msg.name}</Text>
                <Text style={styles.messageTime}>{msg.time}</Text>
              </View>
              <Text style={styles.messageText}>{msg.message}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          style={styles.inputField}
        />
        <Pressable
          style={({ pressed }) => [styles.sendButton, pressed && styles.sendButtonPressed]}
          onPress={() => setInputText('')}
        >
          <Text style={styles.sendIcon}>{'\u27A4'}</Text>
        </Pressable>
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
  headerRight: { width: 32 },
  topicSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  topicTitle: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 14,
    color: colors.base,
  },
  messageBody: {
    flex: 1,
    gap: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  messageName: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  messageTime: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  messageText: {
    fontFamily: fontFamilies.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingLeft: spacing.md,
    gap: spacing.sm,
  },
  inputField: {
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: 15,
    color: colors.text,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  sendButtonPressed: { backgroundColor: colors.primaryPressed },
  sendIcon: {
    fontSize: 14,
    color: colors.base,
  },
});
