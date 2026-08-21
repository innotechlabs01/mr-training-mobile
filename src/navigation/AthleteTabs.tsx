import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TodayScreen } from '../features/training/presentation/screens/TodayScreen';
import { HistoryScreen } from '../features/training/presentation/screens/HistoryScreen';
import { NutritionScreen } from '../features/nutrition/presentation/screens/NutritionScreen';
import { RecoveryScreen } from '../features/recovery/presentation/screens/RecoveryScreen';
import { ProfileScreen } from '../features/auth/presentation/screens/ProfileScreen';
import { darkTheme } from '../shared/theme';

export type AthleteTabParamList = {
  Today: undefined;
  Training: undefined;
  Nutrition: undefined;
  Recovery: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AthleteTabParamList>();

// Geometric icons — no emoji, pure View compositions

function TodayIcon({ focused }: { focused: boolean }) {
  const color = focused ? darkTheme.colors.primary : `${darkTheme.colors.textSecondary}99`;
  return (
    <View style={styles.iconWrap}>
      {focused && <View style={styles.topIndicator} />}
      <View style={[styles.todayRing, { borderColor: color }]}>
        <View style={[styles.todayDot, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function TrainingIcon({ focused }: { focused: boolean }) {
  const color = focused ? darkTheme.colors.primary : `${darkTheme.colors.textSecondary}99`;
  return (
    <View style={styles.iconWrap}>
      {focused && <View style={styles.topIndicator} />}
      <View style={styles.barsCol}>
        <View style={[styles.bar, { backgroundColor: color, width: 14 }]} />
        <View style={[styles.bar, { backgroundColor: color, width: 10 }]} />
        <View style={[styles.bar, { backgroundColor: color, width: 14 }]} />
      </View>
    </View>
  );
}

function NutritionIcon({ focused }: { focused: boolean }) {
  const color = focused ? darkTheme.colors.primary : `${darkTheme.colors.textSecondary}99`;
  return (
    <View style={styles.iconWrap}>
      {focused && <View style={styles.topIndicator} />}
      <View style={[styles.macroRing, { borderColor: color }]}>
        <View style={[styles.macroInner, { borderColor: `${color}55` }]} />
      </View>
    </View>
  );
}

function RecoveryIcon({ focused }: { focused: boolean }) {
  const color = focused ? darkTheme.colors.primary : `${darkTheme.colors.textSecondary}99`;
  return (
    <View style={styles.iconWrap}>
      {focused && <View style={styles.topIndicator} />}
      <View style={[styles.pulseOuter, { borderColor: `${color}40` }]}>
        <View style={[styles.pulseInner, { borderColor: color }]}>
          <View style={[styles.pulseDot, { backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

function ProfileIcon({ focused }: { focused: boolean }) {
  const color = focused ? darkTheme.colors.primary : `${darkTheme.colors.textSecondary}99`;
  return (
    <View style={styles.iconWrap}>
      {focused && <View style={styles.topIndicator} />}
      <View style={styles.profileWrap}>
        <View style={[styles.profileHead, { backgroundColor: color }]} />
        <View style={[styles.profileBody, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function TabIcon({ name, focused }: { name: keyof AthleteTabParamList; focused: boolean }) {
  switch (name) {
    case 'Today':
      return <TodayIcon focused={focused} />;
    case 'Training':
      return <TrainingIcon focused={focused} />;
    case 'Nutrition':
      return <NutritionIcon focused={focused} />;
    case 'Recovery':
      return <RecoveryIcon focused={focused} />;
    case 'Profile':
      return <ProfileIcon focused={focused} />;
    default:
      return <View style={styles.fallbackDot} />;
  }
}

export function AthleteTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name as keyof AthleteTabParamList} focused={focused} />,
        tabBarActiveTintColor: darkTheme.colors.primary,
        tabBarInactiveTintColor: `${darkTheme.colors.textSecondary}99`,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} options={{ tabBarLabel: 'Today' }} />
      <Tab.Screen name="Training" component={HistoryScreen} options={{ tabBarLabel: 'Training' }} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} options={{ tabBarLabel: 'Nutrition' }} />
      <Tab.Screen name="Recovery" component={RecoveryScreen} options={{ tabBarLabel: 'Recovery' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// Drawer-ready extensibility:
// To add more modules (e.g., 6-7 tabs) or a side drawer, wrap AthleteTabs with createDrawerNavigator:
//   const Drawer = createDrawerNavigator();
//   <Drawer.Navigator><Drawer.Screen name="Main" component={AthleteTabs} /> ...</Drawer.Navigator>
// Tabs are designed at 5 but compress gracefully to 6-7 (flex:1 item, 10px label, 18px icons).

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderTopColor: `${darkTheme.colors.border}66`,
    height: 84,
    paddingTop: 8,
    paddingBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 22,
  },
  topIndicator: {
    position: 'absolute',
    top: -10,
    width: 24,
    height: 2,
    borderRadius: 1,
    backgroundColor: darkTheme.colors.primary,
  },
  // Today: ring + dot
  todayRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Training: stacked bars
  barsCol: {
    gap: 3,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  bar: {
    height: 3,
    borderRadius: 1.5,
  },
  // Nutrition: macro ring
  macroRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  // Recovery: pulse circle
  pulseOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // Profile: silhouette
  profileWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
  },
  profileHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  profileBody: {
    width: 14,
    height: 7,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    marginTop: 2,
  },
  fallbackDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: darkTheme.colors.textSecondary,
  },
});
