import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { colors, radius, spacing, fontFamilies } from '../../../../shared/theme/tokens';
import { CoachScheduleModal } from './CoachScheduleModal';

type Props = {
  onComplete: (data: OnboardingData) => void;
};

export type OnboardingData = {
  sports: string[];
  modality: string;
  experienceLevel: string;
  goal: string;
  sessionsPerWeek: number;
  sessionDuration: number;
  equipment: string;
  athleteRoutineAccepted?: boolean;
  gender?: 'male' | 'female' | '';
  weight?: number;
  weightUnit?: 'KG' | 'LB';
};

const SPORTS = [
  { id: 'gym', label: 'Gym', emoji: '🏋️', desc: 'Strength & hypertrophy' },
  { id: 'running', label: 'Running', emoji: '🏃', desc: 'Speed & endurance' },
  { id: 'crossfit', label: 'CrossFit', emoji: '💪', desc: 'Functional fitness' },
  { id: 'swimming', label: 'Swimming', emoji: '🏊', desc: 'Full body cardio' },
  { id: 'cycling', label: 'Cycling', emoji: '🚴', desc: 'Power & stamina' },
  { id: 'tennis', label: 'Tennis', emoji: '🎾', desc: 'Agility & focus' },
  { id: 'yoga', label: 'Yoga', emoji: '🧘', desc: 'Flexibility & mind' },
  { id: 'soccer', label: 'Soccer', emoji: '⚽', desc: 'Speed & teamwork' },
];

const MODALITIES = [
  { id: 'in-person', label: 'In Person', emoji: '🏢', desc: 'Train at the gym or with your coach in person' },
  { id: 'hybrid', label: 'Hybrid', emoji: '🔄', desc: 'Mix of in-person sessions and remote coaching' },
  { id: 'virtual', label: 'Virtual', emoji: '📱', desc: 'Fully remote with digital workout plans' },
];

const GOALS = [
  { id: 'strength', label: 'Get Stronger', emoji: '💪', desc: 'Build muscle, increase your lifts, gain power' },
  { id: 'weight-loss', label: 'Lose Weight', emoji: '🔥', desc: 'Burn fat, improve body composition, get lean' },
  { id: 'endurance', label: 'Build Endurance', emoji: '🫀', desc: 'Run longer, swim farther, last longer' },
  { id: 'performance', label: 'Performance', emoji: '🏆', desc: 'Compete, set PRs, reach peak condition' },
  { id: 'health', label: 'General Health', emoji: '✨', desc: 'Stay active, feel better, prevent injury' },
];

const LEVELS = [
  { id: 'beginner', label: 'Beginner', emoji: '🌱', desc: 'New to structured training or returning after a break' },
  { id: 'intermediate', label: 'Intermediate', emoji: '🌿', desc: '1-2 years of consistent training experience' },
  { id: 'advanced', label: 'Advanced', emoji: '🌳', desc: '3+ years, comfortable with complex programming' },
];

const FREQUENCIES = [2, 3, 4, 5, 6, 7];
const DURATIONS = [30, 45, 60, 90];
const EQUIPMENT_OPTIONS = [
  { id: 'full-gym', label: 'Full Gym', emoji: '🏋️‍♂️', desc: 'Barbells, machines, cables, everything' },
  { id: 'basic', label: 'Basic', emoji: '🪫', desc: 'Dumbbells, bands, pull-up bar' },
  { id: 'minimal', label: 'Minimal', emoji: '🏠', desc: 'Resistance bands, yoga mat' },
  { id: 'bodyweight', label: 'Bodyweight', emoji: '🧘', desc: 'No equipment, just your body' },
];

// 9 steps: inserted Gender + Weight after modality/level, shifting the rest
const STEP_TITLES = [
  'Your Sport',
  'How & Level',
  "What's Your Gender",
  'What Is Your Weight?',
  'Your Goal',
  'Schedule',
  'Equipment',
  'Your Plan',
  'Your Choice',
];
const STEP_COUNT = 9;

// FitBody-inspired hero headings — lime in Figma → orange (MR primary) in MR
const HERO_HEADINGS = [
  'CONSISTENCY IS THE KEY',
  'BUILD YOUR PATH',
  "WHAT'S YOUR GENDER",
  'WHAT IS YOUR WEIGHT?',
  'CHASE YOUR GOAL',
  'STAY CONSISTENT',
  'TRAIN ANYWHERE',
  'YOUR PLAN AWAITS',
  'START YOUR JOURNEY',
];

const HERO_EMOJIS = ['🏋️', '🧭', '♂♀', '⚖️', '🎯', '📅', '🏠', '✨', '🚀'];

// Weight ruler constants — Figma shows 73-77 centered on 75
const WEIGHT_MIN = 40;
const WEIGHT_MAX = 150;
const WEIGHT_DEFAULT = 75;
const RULER_ITEM_WIDTH = 52;

export function OnboardingScreen({ onComplete }: Props) {
  const { height: screenH, width: screenW } = useWindowDimensions();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [sports, setSports] = useState<string[]>([]);
  const [modality, setModality] = useState('');
  const [level, setLevel] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [weight, setWeight] = useState(WEIGHT_DEFAULT);
  const [weightUnit, setWeightUnit] = useState<'KG' | 'LB'>('KG');
  const [goal, setGoal] = useState('');
  const [frequency, setFrequency] = useState(4);
  const [duration, setDuration] = useState(60);
  const [equipment, setEquipment] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rulerRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (step + 1) / STEP_COUNT,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step, progressAnim]);

  // Keep ruler centered on selected weight when entering weight step or weight changes
  useEffect(() => {
    if (step === 3 && rulerRef.current) {
      const index = weight - WEIGHT_MIN;
      const x = Math.max(0, index * RULER_ITEM_WIDTH);
      // small delay so ScrollView is mounted
      setTimeout(() => rulerRef.current?.scrollTo({ x, animated: true }), 80);
    }
  }, [step, weight]);

  const toggle = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((s) => s !== item) : [...list, item]);
  };

  const handleWeightUnitChange = (unit: 'KG' | 'LB') => {
    if (unit === weightUnit) return;
    setWeightUnit(unit);
  };

  const clampWeight = (v: number) => Math.min(WEIGHT_MAX, Math.max(WEIGHT_MIN, v));

  const buildData = (): OnboardingData => ({
    sports,
    modality,
    experienceLevel: level,
    goal,
    sessionsPerWeek: frequency,
    sessionDuration: duration,
    equipment,
    athleteRoutineAccepted: true,
    gender,
    weight,
    weightUnit,
  });

  const canNext = () => {
    if (step === 0) return sports.length > 0;
    if (step === 1) return modality !== '' && level !== '';
    if (step === 2) return gender !== '';
    if (step === 3) return true; // weight always has a default
    if (step === 4) return goal !== '';
    if (step === 5) return true;
    if (step === 6) return equipment !== '';
    return true;
  };

  const goNext = () => {
    if (step < STEP_COUNT - 1) {
      setStep((s) => s + 1);
    } else {
      onComplete(buildData());
    }
  };

  const goBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const heroHeight = Math.round(screenH * 0.45);
  const isLastStep = step === STEP_COUNT - 1;
  const rulerPadding = Math.round(screenW / 2 - RULER_ITEM_WIDTH / 2 - spacing.lg);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Hero area — top 45% */}
      <View style={[styles.heroArea, { height: heroHeight }]}>
        <View style={styles.heroPlaceholder}>
          <Text style={styles.heroEmoji}>{HERO_EMOJIS[step] ?? '🏋️'}</Text>
        </View>
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroHeading}>{HERO_HEADINGS[step]}</Text>
          <Text style={styles.heroSubtitle}>{STEP_TITLES[step]}</Text>
        </View>
      </View>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: STEP_COUNT }).map((_, idx) => (
          <View
            key={idx}
            style={[styles.dot, idx === step ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>

      {/* Choices area — scrollable, rounded top, MR palette */}
      <View style={styles.choicesWrapper}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* STEP 0: Sports */}
          {step === 0 && (
            <View style={styles.choicesInner}>
              {SPORTS.map((s) => {
                const active = sports.includes(s.id);
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => toggle(sports, s.id, setSports)}
                    style={[styles.choiceCard, active && styles.choiceCardActive]}
                  >
                    <Text style={styles.choiceEmoji}>{s.emoji}</Text>
                    <View style={styles.choiceContent}>
                      <Text style={[styles.choiceLabel, active && styles.choiceLabelActive]}>{s.label}</Text>
                      <Text style={styles.choiceDesc}>{s.desc}</Text>
                    </View>
                    {active ? (
                      <View style={styles.checkCircle}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.checkCircleInactive} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* STEP 1: Modality + Level */}
          {step === 1 && (
            <View style={styles.choicesInner}>
              <Text style={styles.sectionTitle}>How do you train?</Text>
              {MODALITIES.map((m) => {
                const active = modality === m.id;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => setModality(m.id)}
                    style={[styles.choiceCard, active && styles.choiceCardActive]}
                  >
                    <Text style={styles.choiceEmoji}>{m.emoji}</Text>
                    <View style={styles.choiceContent}>
                      <Text style={[styles.choiceLabel, active && styles.choiceLabelActive]}>{m.label}</Text>
                      <Text style={styles.choiceDesc}>{m.desc}</Text>
                    </View>
                    {active ? (
                      <View style={styles.checkCircle}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.checkCircleInactive} />
                    )}
                  </Pressable>
                );
              })}
              <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Your experience level</Text>
              {LEVELS.map((l) => {
                const active = level === l.id;
                return (
                  <Pressable
                    key={l.id}
                    onPress={() => setLevel(l.id)}
                    style={[styles.choiceCard, active && styles.choiceCardActive]}
                  >
                    <Text style={styles.choiceEmoji}>{l.emoji}</Text>
                    <View style={styles.choiceContent}>
                      <Text style={[styles.choiceLabel, active && styles.choiceLabelActive]}>{l.label}</Text>
                      <Text style={styles.choiceDesc}>{l.desc}</Text>
                    </View>
                    {active ? (
                      <View style={styles.checkCircle}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.checkCircleInactive} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* STEP 2: Gender — two 140px circles, MR palette */}
          {step === 2 && (
            <View style={styles.choicesInner}>
              {/* Figma subtitle lila bar → MR muted surfaceRaised with subtle border */}
              <View style={styles.fitBodySubtitleBar}>
                <Text style={styles.fitBodySubtitleText}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.
                </Text>
              </View>

              <View style={styles.genderRow}>
                {/* Male */}
                <Pressable
                  onPress={() => setGender('male')}
                  style={styles.genderItem}
                  accessibilityRole="button"
                  accessibilityLabel="Select Male"
                >
                  <View
                    style={[
                      styles.genderCircle,
                      gender === 'male' ? styles.genderCircleSelected : styles.genderCircleUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderSymbol,
                        gender === 'male' ? styles.genderSymbolSelected : styles.genderSymbolUnselected,
                      ]}
                    >
                      ♂
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.genderLabel,
                      gender === 'male' && styles.genderLabelSelected,
                    ]}
                  >
                    Male
                  </Text>
                </Pressable>

                {/* Female */}
                <Pressable
                  onPress={() => setGender('female')}
                  style={styles.genderItem}
                  accessibilityRole="button"
                  accessibilityLabel="Select Female"
                >
                  <View
                    style={[
                      styles.genderCircle,
                      gender === 'female' ? styles.genderCircleSelected : styles.genderCircleUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderSymbol,
                        gender === 'female' ? styles.genderSymbolSelected : styles.genderSymbolUnselected,
                      ]}
                    >
                      ♀
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.genderLabel,
                      gender === 'female' && styles.genderLabelSelected,
                    ]}
                  >
                    Female
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* STEP 3: Weight — KG/LB toggle + ruler + large display, MR palette */}
          {step === 3 && (
            <View style={styles.choicesInner}>
              {/* Same lila subtitle bar as Gender */}
              <View style={styles.fitBodySubtitleBar}>
                <Text style={styles.fitBodySubtitleText}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Track your progress accurately.
                </Text>
              </View>

              {/* KG / LB toggle pill — segmented control, lime → primary */}
              <View style={styles.unitToggleContainer}>
                <Pressable
                  onPress={() => handleWeightUnitChange('KG')}
                  style={[styles.unitToggleBtn, weightUnit === 'KG' && styles.unitToggleBtnActive]}
                >
                  <Text style={[styles.unitToggleText, weightUnit === 'KG' && styles.unitToggleTextActive]}>KG</Text>
                </Pressable>
                <View style={styles.unitToggleDivider} />
                <Pressable
                  onPress={() => handleWeightUnitChange('LB')}
                  style={[styles.unitToggleBtn, weightUnit === 'LB' && styles.unitToggleBtnActive]}
                >
                  <Text style={[styles.unitToggleText, weightUnit === 'LB' && styles.unitToggleTextActive]}>LB</Text>
                </Pressable>
              </View>

              {/* Large weight display — 75 white 48px black 900, Kg gray 16px */}
              <View style={styles.weightDisplayRow}>
                <Pressable
                  onPress={() => setWeight((w) => clampWeight(w - 1))}
                  style={styles.weightArrowBtn}
                  hitSlop={12}
                >
                  <Text style={styles.weightArrowText}>−</Text>
                </Pressable>

                <View style={styles.weightValueBox}>
                  <Text style={styles.weightNumber}>{weight}</Text>
                  <Text style={styles.weightUnitLabel}>{weightUnit}</Text>
                </View>

                <Pressable
                  onPress={() => setWeight((w) => clampWeight(w + 1))}
                  style={styles.weightArrowBtn}
                  hitSlop={12}
                >
                  <Text style={styles.weightArrowText}>+</Text>
                </Pressable>
              </View>

              {/* Center indicator triangle — yellow in Figma → primary in MR */}
              <View style={styles.rulerIndicatorWrap}>
                <View style={styles.rulerTriangle} />
              </View>

              {/* Ruler bar — lila #B8A0FF in Figma → surfaceRaised in MR, ticks border, center line primary */}
              <View style={styles.rulerBar}>
                <View style={styles.rulerCenterLine} />
                <ScrollView
                  ref={rulerRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={RULER_ITEM_WIDTH}
                  decelerationRate="fast"
                  contentContainerStyle={{ paddingHorizontal: rulerPadding }}
                  onMomentumScrollEnd={(e) => {
                    const x = e.nativeEvent.contentOffset.x;
                    const idx = Math.round(x / RULER_ITEM_WIDTH);
                    const next = clampWeight(WEIGHT_MIN + idx);
                    if (next !== weight) setWeight(next);
                  }}
                >
                  {Array.from({ length: WEIGHT_MAX - WEIGHT_MIN + 1 }, (_, i) => {
                    const v = WEIGHT_MIN + i;
                    const isSelected = v === weight;
                    const isMajor = v % 5 === 0;
                    return (
                      <Pressable
                        key={v}
                        onPress={() => setWeight(v)}
                        style={styles.rulerItem}
                      >
                        <Text
                          style={[
                            styles.rulerNumber,
                            isSelected ? styles.rulerNumberSelected : styles.rulerNumberUnselected,
                            isMajor && !isSelected ? styles.rulerNumberMajor : null,
                          ]}
                        >
                          {v}
                        </Text>
                        <View
                          style={[
                            styles.rulerTick,
                            isMajor ? styles.rulerTickMajor : styles.rulerTickMinor,
                            isSelected && styles.rulerTickSelected,
                          ]}
                        />
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
              <Text style={styles.rulerHint}>Tap a number or use + / − to adjust</Text>
            </View>
          )}

          {/* STEP 4: Goal (was 2) */}
          {step === 4 && (
            <View style={styles.choicesInner}>
              {GOALS.map((g) => {
                const active = goal === g.id;
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => setGoal(g.id)}
                    style={[styles.choiceCard, active && styles.choiceCardActive]}
                  >
                    <Text style={styles.choiceEmoji}>{g.emoji}</Text>
                    <View style={styles.choiceContent}>
                      <Text style={[styles.choiceLabel, active && styles.choiceLabelActive]}>{g.label}</Text>
                      <Text style={styles.choiceDesc}>{g.desc}</Text>
                    </View>
                    {active ? (
                      <View style={styles.checkCircle}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.checkCircleInactive} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* STEP 5: Frequency + Duration (was 3) */}
          {step === 5 && (
            <View style={styles.choicesInner}>
              <Text style={styles.sectionTitle}>How many days per week?</Text>
              <View style={styles.chipRow}>
                {FREQUENCIES.map((f) => {
                  const active = frequency === f;
                  return (
                    <Pressable
                      key={f}
                      onPress={() => setFrequency(f)}
                      style={[styles.freqChip, active && styles.freqChipActive]}
                    >
                      <Text style={[styles.freqText, active && styles.freqTextActive]}>{f}</Text>
                      <Text style={[styles.freqSub, active && styles.freqSubActive]}>days</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.freqBar}>
                {FREQUENCIES.map((f) => (
                  <View key={f} style={[styles.freqBarDot, frequency >= f && styles.freqBarDotActive]} />
                ))}
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Session duration</Text>
              <View style={styles.chipRow}>
                {DURATIONS.map((d) => {
                  const active = duration === d;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => setDuration(d)}
                      style={[styles.durChip, active && styles.durChipActive]}
                    >
                      <Text style={[styles.durText, active && styles.durTextActive]}>{d}</Text>
                      <Text style={[styles.durSub, active && styles.durSubActive]}>min</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 6: Equipment (was 4) */}
          {step === 6 && (
            <View style={styles.choicesInner}>
              <Text style={styles.sectionTitle}>What equipment do you have?</Text>
              {EQUIPMENT_OPTIONS.map((e) => {
                const active = equipment === e.id;
                return (
                  <Pressable
                    key={e.id}
                    onPress={() => setEquipment(e.id)}
                    style={[styles.choiceCard, active && styles.choiceCardActive]}
                  >
                    <Text style={styles.choiceEmoji}>{e.emoji}</Text>
                    <View style={styles.choiceContent}>
                      <Text style={[styles.choiceLabel, active && styles.choiceLabelActive]}>{e.label}</Text>
                      <Text style={styles.choiceDesc}>{e.desc}</Text>
                    </View>
                    {active ? (
                      <View style={styles.checkCircle}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.checkCircleInactive} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* STEP 7: Summary (was 5) */}
          {step === 7 && (
            <View style={styles.choicesInner}>
              <View style={styles.summaryHero}>
                <Text style={styles.summaryEmoji}>🎯</Text>
                <Text style={styles.summaryTitle}>Your Personalized Plan</Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Sports</Text>
                  <View style={styles.summaryChips}>
                    {sports.map((s) => {
                      const sport = SPORTS.find((x) => x.id === s);
                      return (
                        <View key={s} style={styles.miniChip}>
                          <Text style={styles.miniChipText}>
                            {sport?.emoji} {sport?.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Modality</Text>
                  <Text style={styles.summaryVal}>
                    {MODALITIES.find((m) => m.id === modality)?.emoji} {MODALITIES.find((m) => m.id === modality)?.label}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Level</Text>
                  <Text style={styles.summaryVal}>
                    {LEVELS.find((l) => l.id === level)?.emoji} {LEVELS.find((l) => l.id === level)?.label}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Gender</Text>
                  <Text style={styles.summaryVal}>{gender ? (gender === 'male' ? '♂ Male' : '♀ Female') : '—'}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Weight</Text>
                  <Text style={styles.summaryVal}>
                    {weight} {weightUnit}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Goal</Text>
                  <Text style={styles.summaryVal}>
                    {GOALS.find((g) => g.id === goal)?.emoji} {GOALS.find((g) => g.id === goal)?.label}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Schedule</Text>
                  <Text style={styles.summaryVal}>
                    {frequency}x/week · {duration} min
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Equipment</Text>
                  <Text style={styles.summaryVal}>
                    {EQUIPMENT_OPTIONS.find((e) => e.id === equipment)?.emoji}{' '}
                    {EQUIPMENT_OPTIONS.find((e) => e.id === equipment)?.label}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* STEP 8: Your Choice (was 6) */}
          {step === 8 && (
            <View style={styles.choicesInner}>
              <Text style={styles.sectionTitle}>We have created a routine based on your profile.</Text>
              <Text style={styles.desc}>What would you like to do?</Text>

              <Pressable
                onPress={() => setShowScheduleModal(true)}
                style={[styles.choiceCard, { borderColor: `${colors.primary}30` }]}
              >
                <View style={styles.choiceIconBox}>
                  <Text style={styles.choiceEmojiLarge}>📅</Text>
                </View>
                <View style={styles.choiceContent}>
                  <Text style={styles.choiceLabel}>Schedule with your Coach</Text>
                  <Text style={styles.choiceDesc}>Book a call to review and personalize your routine together</Text>
                </View>
                <Text style={styles.choiceArrow}>→</Text>
              </Pressable>

              <Pressable onPress={() => onComplete(buildData())} style={styles.choiceCard}>
                <View style={styles.choiceIconBox}>
                  <Text style={styles.choiceEmojiLarge}>✅</Text>
                </View>
                <View style={styles.choiceContent}>
                  <Text style={styles.choiceLabel}>Accept System Routine</Text>
                  <Text style={styles.choiceDesc}>Start training immediately with the AI-generated plan</Text>
                </View>
                <Text style={styles.choiceArrow}>→</Text>
              </Pressable>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>

      {/* Bottom pill button */}
      <View style={styles.bottom}>
        <Pressable
          onPress={goNext}
          disabled={!canNext()}
          style={[styles.nextBtn, isLastStep ? styles.nextBtnPrimary : styles.nextBtnOutline, !canNext() && styles.nextDisabled]}
        >
          <Text style={[styles.nextText, isLastStep ? styles.nextTextPrimary : styles.nextTextOutline]}>
            {isLastStep ? 'Complete' : 'Next'}
          </Text>
        </Pressable>
        {0 < step && step < STEP_COUNT - 1 && (
          <Pressable onPress={() => setStep(STEP_COUNT - 1)} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
        {step > 0 && (
          <Pressable onPress={goBack} style={styles.backLink}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        )}
      </View>

      <CoachScheduleModal
        visible={showScheduleModal}
        coachId=""
        athleteId={user?.id ?? ''}
        athleteName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Athlete'}
        onScheduled={() => {
          setShowScheduleModal(false);
          onComplete(buildData());
        }}
        onClose={() => setShowScheduleModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e' },
  // Hero — top 45%
  heroArea: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 72, opacity: 0.9 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14,14,14,0.45)',
  },
  heroContent: {
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroHeading: {
    fontFamily: fontFamilies.displayBlack,
    fontSize: 24,
    lineHeight: 28.8,
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    marginTop: 8,
    fontFamily: fontFamilies.heading,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    opacity: 0.85,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  // Progress dots
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#0e0e0e',
  },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 24, backgroundColor: colors.primary },
  dotInactive: { width: 8, backgroundColor: colors.border },
  // Choices wrapper — rounded top, MR palette
  choicesWrapper: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  scrollContent: { padding: spacing.lg, paddingTop: spacing.lg, flexGrow: 1 },
  choicesInner: { gap: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  // Choice cards — FitBody structure, MR palette
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 10,
  },
  choiceCardActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}14`,
  },
  choiceEmoji: { fontSize: 32, width: 40, textAlign: 'center' },
  choiceContent: { flex: 1 },
  choiceLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  choiceLabelActive: { color: colors.primary },
  choiceDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleInactive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  checkText: { color: colors.base, fontSize: 12, fontWeight: '700' },
  // FitBody lila subtitle bar → MR surfaceRaised
  fitBodySubtitleBar: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  fitBodySubtitleText: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Gender — two 140px circles, MR palette (lime → primary, gray → surfaceRaised)
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 24,
    paddingVertical: 12,
  },
  genderItem: { alignItems: 'center', gap: 12 },
  genderCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  genderCircleUnselected: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
  },
  genderCircleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderSymbol: { fontSize: 64, lineHeight: 72, fontWeight: '400' },
  genderSymbolUnselected: { color: colors.text },
  genderSymbolSelected: { color: colors.base },
  genderLabel: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  genderLabelSelected: { color: colors.primary },
  // Weight — KG/LB toggle, display, ruler
  unitToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    gap: 0,
  },
  unitToggleBtn: {
    paddingHorizontal: 28,
    paddingVertical: 8,
    borderRadius: radius.full,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitToggleBtnActive: { backgroundColor: colors.primary },
  unitToggleText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  unitToggleTextActive: { color: colors.base },
  unitToggleDivider: { width: 1, height: 20, backgroundColor: colors.border, marginHorizontal: 2 },
  weightDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 8,
  },
  weightArrowBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightArrowText: { fontSize: 22, fontWeight: '700', color: colors.text, lineHeight: 24 },
  weightValueBox: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, minWidth: 120, justifyContent: 'center' },
  weightNumber: {
    fontFamily: fontFamilies.displayBlack,
    fontSize: 48,
    lineHeight: 48,
    color: colors.text,
    fontWeight: '900',
  },
  weightUnitLabel: { fontSize: 16, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  rulerIndicatorWrap: { alignItems: 'center', height: 12, marginBottom: 0, marginTop: 8 },
  rulerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
  },
  rulerBar: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    marginTop: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  rulerCenterLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    marginLeft: -1,
    backgroundColor: colors.primary,
    opacity: 0.9,
    zIndex: 0,
  },
  rulerItem: { width: 52, alignItems: 'center', justifyContent: 'flex-start', gap: 6, zIndex: 1 },
  rulerNumber: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  rulerNumberUnselected: { color: colors.textSecondary, fontSize: 13, opacity: 0.9 },
  rulerNumberMajor: { color: colors.text, opacity: 0.7 },
  rulerNumberSelected: { color: colors.primary, fontSize: 32, fontWeight: '900', lineHeight: 32 },
  rulerTick: { borderRadius: 1, backgroundColor: colors.border },
  rulerTickMinor: { width: 1.5, height: 10, opacity: 0.6 },
  rulerTickMajor: { width: 1.5, height: 18, backgroundColor: colors.textSecondary, opacity: 0.9 },
  rulerTickSelected: { backgroundColor: colors.primary, width: 2, height: 22, opacity: 1 },
  rulerHint: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginTop: 10, opacity: 0.8 },
  // Chips — frequency / duration
  chipRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  freqChip: {
    width: 52,
    height: 72,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  freqChipActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}14` },
  freqText: { fontSize: 20, fontWeight: '800', color: colors.textSecondary },
  freqTextActive: { color: colors.primary },
  freqSub: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  freqSubActive: { color: colors.primary },
  freqBar: { flexDirection: 'row', gap: 7, marginTop: 16, paddingHorizontal: 2 },
  freqBarDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  freqBarDotActive: { backgroundColor: colors.primary },
  durChip: {
    flex: 1,
    height: 72,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durChipActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}14` },
  durText: { fontSize: 20, fontWeight: '800', color: colors.textSecondary },
  durTextActive: { color: colors.primary },
  durSub: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  durSubActive: { color: colors.primary },
  // Summary
  summaryHero: { alignItems: 'center', marginBottom: 20 },
  summaryEmoji: { fontSize: 48, marginBottom: 12 },
  summaryTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  summaryCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  summaryDivider: { height: 1, backgroundColor: colors.border },
  summaryKey: { fontSize: 14, color: colors.textSecondary, fontWeight: '600', width: 90 },
  summaryVal: { fontSize: 14, color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
  summaryChips: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6 },
  miniChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: `${colors.primary}14` },
  miniChipText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  // Bottom pill button
  bottom: {
    padding: spacing.lg,
    paddingBottom: 32,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextBtn: {
    width: 200,
    height: 48,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
  },
  nextBtnOutline: { backgroundColor: 'transparent', borderColor: colors.border },
  nextBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  nextText: { fontSize: 16, fontWeight: '700' },
  nextTextOutline: { color: colors.text },
  nextTextPrimary: { color: colors.base },
  nextDisabled: { opacity: 0.35 },
  skipBtn: { paddingVertical: 10, paddingHorizontal: 16, marginTop: 4 },
  skipText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  backLink: { paddingVertical: 8, marginTop: 2 },
  backText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  desc: { fontSize: 14, color: colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  choiceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${colors.primary}14`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceEmojiLarge: { fontSize: 22 },
  choiceArrow: { fontSize: 18, color: colors.primary, fontWeight: '600', marginLeft: 4 },
});
