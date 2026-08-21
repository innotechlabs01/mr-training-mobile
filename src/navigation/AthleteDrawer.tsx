import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerContentComponentProps,
  DrawerItem,
} from '@react-navigation/drawer';
import { useUser } from '@clerk/clerk-expo';

import { TodayScreen } from '../features/training/presentation/screens/TodayScreen';
import { HistoryScreen } from '../features/training/presentation/screens/HistoryScreen';
import { NutritionScreen } from '../features/nutrition/presentation/screens/NutritionScreen';
import { RecoveryScreen } from '../features/recovery/presentation/screens/RecoveryScreen';
import { ProfileScreen } from '../features/auth/presentation/screens/ProfileScreen';
import { EventsScreen } from '../features/events/presentation/screens/EventsScreen';
import { StoreScreen } from '../features/store/presentation/screens/StoreScreen';
import { MembershipScreen } from '../features/membership/presentation/screens/MembershipScreen';
import { darkTheme } from '../shared/theme';

export type AthleteDrawerParamList = {
  Today: undefined;
  Training: undefined;
  Nutrition: undefined;
  Recovery: undefined;
  Events: undefined;
  Store: undefined;
  Membership: undefined;
  Profile: undefined;
};

const Drawer = createDrawerNavigator<AthleteDrawerParamList>();

// ---------------------------------------------------------------------------
// Geometric icons — scaled for drawer (18px zone)
// ---------------------------------------------------------------------------

function DrawerTodayIcon({ focused }: { focused: boolean }) {
  const color = focused ? darkTheme.colors.primary : darkTheme.colors.textSecondary;
  return (
    <View style={[styles.drawerIconBox, { width: 18, height: 18 }]}>
      <View style={[styles.todayRingSm, { borderColor: color }]}>
        <View style={[styles.todayDotSm, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function DrawerTrainingIcon({ focused }: { focused: boolean }) {
  const color = focused ? darkTheme.colors.primary : darkTheme.colors.textSecondary;
  return (
    <View style={[styles.drawerIconBox, { width: 18, height: 18 }]}>
      <View style={styles.barsColSm}>
        <View style={[styles.barSm, { backgroundColor: color, width: 12 }]} />
        <View style={[styles.barSm, { backgroundColor: color, width: 8 }]} />
        <View style={[styles.barSm, { backgroundColor: color, width: 12 }]} />
      </View>
    </View>
  );
}

function DrawerNutritionIcon({ focused }: { focused: boolean }) {
  const color = focused ? darkTheme.colors.primary : darkTheme.colors.textSecondary;
  return (
    <View style={[styles.drawerIconBox, { width: 18, height: 18 }]}>
      <View style={[styles.macroRingSm, { borderColor: color }]}>
        <View style={[styles.macroInnerSm, { borderColor: `${color}55` }]} />
      </View>
    </View>
  );
}

function DrawerRecoveryIcon({ focused }: { focused: boolean }) {
  const color = focused ? darkTheme.colors.primary : darkTheme.colors.textSecondary;
  return (
    <View style={[styles.drawerIconBox, { width: 18, height: 18 }]}>
      <View style={[styles.pulseOuterSm, { borderColor: `${color}40` }]}>
        <View style={[styles.pulseInnerSm, { borderColor: color }]}>
          <View style={[styles.pulseDotSm, { backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

function DrawerEventsIcon({ focused }: { focused: boolean }) {
  const color = focused ? darkTheme.colors.primary : darkTheme.colors.textSecondary;
  const border = focused ? darkTheme.colors.primary : darkTheme.colors.textSecondary;
  return (
    <View style={[styles.drawerIconBox, { width: 18, height: 18 }]}>
      <View style={[styles.calendarBox, { borderColor: border }]}>
        <View style={[styles.calendarTopBar, { backgroundColor: color }]} />
        <View style={styles.calendarGrid}>
          <View style={[styles.calendarDot, { backgroundColor: color }]} />
          <View style={[styles.calendarDot, { backgroundColor: color }]} />
          <View style={[styles.calendarDot, { backgroundColor: `${color}55` }]} />
          <View style={[styles.calendarDot, { backgroundColor: `${color}55` }]} />
        </View>
      </View>
    </View>
  );
}

function DrawerStoreIcon({ focused }: { focused: boolean }) {
  const color = focused ? darkTheme.colors.primary : darkTheme.colors.textSecondary;
  const border = focused ? darkTheme.colors.primary : darkTheme.colors.textSecondary;
  return (
    <View style={[styles.drawerIconBox, { width: 18, height: 18 }]}>
      <View style={styles.bagWrap}>
        <View style={[styles.bagHandle, { borderColor: color }]} />
        <View style={[styles.bagBody, { borderColor: border }]} />
      </View>
    </View>
  );
}

function DrawerMembershipIcon({ focused }: { focused: boolean }) {
  const color = focused ? darkTheme.colors.primary : darkTheme.colors.textSecondary;
  const border = focused ? darkTheme.colors.primary : darkTheme.colors.textSecondary;
  return (
    <View style={[styles.drawerIconBox, { width: 18, height: 18 }]}>
      <View style={[styles.cardBox, { borderColor: border }]}>
        <View style={[styles.cardStripe, { backgroundColor: color }]} />
        <View style={styles.cardLineRow}>
          <View style={[styles.cardLine, { backgroundColor: `${color}55`, width: 8 }]} />
          <View style={[styles.cardLine, { backgroundColor: `${color}35`, width: 6 }]} />
        </View>
      </View>
    </View>
  );
}

function DrawerProfileIcon({ focused }: { focused: boolean }) {
  const color = focused ? darkTheme.colors.primary : darkTheme.colors.textSecondary;
  return (
    <View style={[styles.drawerIconBox, { width: 18, height: 18 }]}>
      <View style={styles.profileWrapSm}>
        <View style={[styles.profileHeadSm, { backgroundColor: color }]} />
        <View style={[styles.profileBodySm, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function getDrawerIcon(routeName: string, focused: boolean) {
  switch (routeName) {
    case 'Today':
      return <DrawerTodayIcon focused={focused} />;
    case 'Training':
      return <DrawerTrainingIcon focused={focused} />;
    case 'Nutrition':
      return <DrawerNutritionIcon focused={focused} />;
    case 'Recovery':
      return <DrawerRecoveryIcon focused={focused} />;
    case 'Events':
      return <DrawerEventsIcon focused={focused} />;
    case 'Store':
      return <DrawerStoreIcon focused={focused} />;
    case 'Membership':
      return <DrawerMembershipIcon focused={focused} />;
    case 'Profile':
      return <DrawerProfileIcon focused={focused} />;
    default:
      return <View style={styles.fallbackDotSm} />;
  }
}

// ---------------------------------------------------------------------------
// Custom drawer content
// ---------------------------------------------------------------------------

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { state, navigation } = props;
  const { user } = useUser();

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.firstName
        ? user.firstName[0].toUpperCase()
        : 'AT';

  const displayName = user?.firstName
    ? `${user.firstName}${user?.lastName ? ` ${user.lastName}` : ''}`
    : 'Athlete';
  const email = user?.emailAddresses?.[0]?.emailAddress ?? '';

  const activeRouteName = state.routeNames[state.index];

  const renderItem = (label: string, routeName: keyof AthleteDrawerParamList) => {
    const focused = activeRouteName === routeName;
    return (
      <DrawerItem
        key={routeName}
        label={label}
        focused={focused}
        onPress={() => navigation.navigate(routeName as never)}
        activeTintColor={darkTheme.colors.primary}
        inactiveTintColor={darkTheme.colors.textSecondary}
        labelStyle={[styles.drawerLabel, focused && styles.drawerLabelFocused]}
        style={[styles.drawerItem, focused && styles.drawerItemFocused]}
        icon={({ focused: f }: { focused: boolean }) => getDrawerIcon(routeName, f)}
      />
    );
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerScrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Brand */}
      <View style={styles.brandBlock}>
        <Text style={styles.brandTitle}>MR TRAINING</Text>
        <Text style={styles.brandSubtitle}>ELITE PERFORMANCE</Text>
      </View>

      {/* Athlete info */}
      <View style={styles.athleteBlock}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
        <View style={styles.athleteMeta}>
          <Text style={styles.athleteName} numberOfLines={1}>
            {displayName}
          </Text>
          {!!email && (
            <Text style={styles.athleteEmail} numberOfLines={1}>
              {email}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Section: Entrenamiento */}
      <Text style={styles.sectionLabel}>ENTRENAMIENTO</Text>
      {renderItem('Today', 'Today')}
      {renderItem('Training', 'Training')}
      {renderItem('Nutrition', 'Nutrition')}
      {renderItem('Recovery', 'Recovery')}

      {/* Section: Coach */}
      <Text style={[styles.sectionLabel, { marginTop: 20 }]}>COACH</Text>
      {renderItem('Events', 'Events')}
      {renderItem('Store', 'Store')}

      {/* Section: Cuenta */}
      <Text style={[styles.sectionLabel, { marginTop: 20 }]}>CUENTA</Text>
      {renderItem('Membership', 'Membership')}
      {renderItem('Profile', 'Profile')}

      <View style={{ height: 24 }} />
    </DrawerContentScrollView>
  );
}

// ---------------------------------------------------------------------------
// Navigator
// ---------------------------------------------------------------------------

export function AthleteDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props: DrawerContentComponentProps) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.6)',
        drawerStyle: {
          backgroundColor: '#0A0A0A',
          width: 300,
          borderRightWidth: 1,
          borderRightColor: '#38383A',
        },
        drawerActiveTintColor: '#FF8C3D',
        drawerInactiveTintColor: '#98989D',
        drawerLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        sceneStyle: { backgroundColor: '#000000' },
      }}
    >
      <Drawer.Screen name="Today" component={TodayScreen} options={{ drawerLabel: 'Today' }} />
      <Drawer.Screen name="Training" component={HistoryScreen} options={{ drawerLabel: 'Training' }} />
      <Drawer.Screen name="Nutrition" component={NutritionScreen} options={{ drawerLabel: 'Nutrition' }} />
      <Drawer.Screen name="Recovery" component={RecoveryScreen} options={{ drawerLabel: 'Recovery' }} />
      <Drawer.Screen name="Events" component={EventsScreen} options={{ drawerLabel: 'Events' }} />
      <Drawer.Screen name="Store" component={StoreScreen} options={{ drawerLabel: 'Store' }} />
      <Drawer.Screen name="Membership" component={MembershipScreen} options={{ drawerLabel: 'Membership' }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ drawerLabel: 'Profile' }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerScrollContent: { paddingTop: 16, paddingBottom: 16 },
  brandBlock: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 5,
    color: darkTheme.colors.text,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: darkTheme.colors.primary,
    marginTop: 4,
  },
  athleteBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 12,
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: darkTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  athleteMeta: { flex: 1, gap: 2 },
  athleteName: { fontSize: 14, fontWeight: '700', color: darkTheme.colors.text },
  athleteEmail: { fontSize: 12, fontWeight: '400', color: darkTheme.colors.textSecondary },
  divider: { height: 1, backgroundColor: darkTheme.colors.border, marginHorizontal: 16, marginBottom: 16, opacity: 0.6 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: `${darkTheme.colors.textSecondary}99`,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  drawerItem: {
    borderRadius: 8,
    marginHorizontal: 12,
    marginVertical: 2,
    borderLeftWidth: 0,
    paddingLeft: 0,
  },
  drawerItemFocused: {
    backgroundColor: 'rgba(255,140,61,0.10)',
    borderLeftWidth: 3,
    borderLeftColor: darkTheme.colors.primary,
  },
  drawerLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  drawerLabelFocused: { color: darkTheme.colors.primary },
  drawerIconBox: { alignItems: 'center', justifyContent: 'center' },

  // Today small
  todayRingSm: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  todayDotSm: { width: 6, height: 6, borderRadius: 3 },

  // Training small
  barsColSm: { gap: 2, alignItems: 'flex-start', justifyContent: 'center' },
  barSm: { height: 2.5, borderRadius: 1.25 },

  // Nutrition small
  macroRingSm: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  macroInnerSm: { width: 6, height: 6, borderRadius: 3, borderWidth: 1.2 },

  // Recovery small
  pulseOuterSm: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pulseInnerSm: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.2, alignItems: 'center', justifyContent: 'center' },
  pulseDotSm: { width: 4, height: 4, borderRadius: 2 },

  // Calendar
  calendarBox: { width: 14, height: 14, borderRadius: 2, borderWidth: 1.2, overflow: 'hidden', alignItems: 'center' },
  calendarTopBar: { width: '100%', height: 3 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center', paddingTop: 2, width: 10 },
  calendarDot: { width: 2, height: 2, borderRadius: 1 },

  // Bag
  bagWrap: { width: 14, height: 14, alignItems: 'center', justifyContent: 'flex-end' },
  bagHandle: {
    width: 8,
    height: 6,
    borderTopWidth: 1.2,
    borderLeftWidth: 1.2,
    borderRightWidth: 1.2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomWidth: 0,
    marginBottom: -1,
  },
  bagBody: { width: 14, height: 10, borderWidth: 1.2, borderRadius: 2 },

  // Card
  cardBox: { width: 16, height: 12, borderRadius: 3, borderWidth: 1.2, overflow: 'hidden', justifyContent: 'flex-start' },
  cardStripe: { width: '100%', height: 4, marginTop: 2 },
  cardLineRow: { flexDirection: 'row', gap: 2, paddingHorizontal: 2, marginTop: 2 },
  cardLine: { height: 1.5, borderRadius: 1 },

  // Profile small
  profileWrapSm: { alignItems: 'center', justifyContent: 'center', width: 16, height: 16 },
  profileHeadSm: { width: 6, height: 6, borderRadius: 3 },
  profileBodySm: { width: 12, height: 6, borderTopLeftRadius: 6, borderTopRightRadius: 6, marginTop: 1 },

  fallbackDotSm: { width: 6, height: 6, borderRadius: 3, backgroundColor: darkTheme.colors.textSecondary },
});
