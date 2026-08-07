/**
 * Decanta — app root.
 * Tab navigation: Discover · Scan · Cellar · Events · Profile.
 * Mobile-first, dark canvas, AISP DESIGN.md spec.
 *
 * Loads Cormorant Garamond (serif display), Inter (body), and GeistMono
 * (caption mono) via expo-google-fonts before rendering the navigator.
 */

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiscoverIcon, ScanIcon, CellarIcon, EventsIcon, LearnIcon } from './components/TabIcons.js';
import { useFonts } from 'expo-font';
import { color } from './theme/tokens.js';
import { PalateProvider } from './hooks/usePalate.js';
import { AuthProvider } from './hooks/useAuth.js';
import { DiscoverScreen } from './screens/DiscoverScreen.js';
import { ScanScreen } from './screens/ScanScreen.js';
import { CellarScreen } from './screens/CellarScreen.js';
import { EventsScreen } from './screens/EventsScreen.js';
import { LearnScreen } from './screens/LearnScreen.js';
import { OnboardingScreen } from './screens/OnboardingScreen.js';

const ONBOARDED_KEY = 'decanta.onboarded.v1';

const Tab = createBottomTabNavigator();

const linking = {
  prefixes: [],
  config: {
    screens: {
      Discover: 'Discover',
      Scan: 'Scan',
      Cellar: 'Cellar',
      Events: 'Events',
      Learn: 'Learn',
    },
  },
};

const KelderTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: color.canvas,
    card: color.canvasSoft,
    text: color.ink,
    border: color.hairline,
    primary: color.gold,
  },
};

// Tab bar icon configuration — custom SVG icons
const tabIconComponents: Record<string, React.FC<{ size?: number; color: string; focused: boolean }>> = {
  Discover: DiscoverIcon,
  Scan: ScanIcon,
  Cellar: CellarIcon,
  Events: EventsIcon,
  Learn: LearnIcon,
};

export default function App() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond: require('@expo-google-fonts/cormorant-garamond/400Regular/CormorantGaramond_400Regular.ttf'),
    Inter: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    GeistMono: require('./theme/assets/GeistMono-Regular.ttf'),
  });

  // First-run onboarding gate.
  // On web, ?onboard=1 forces the flow for testing/review.
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  useEffect(() => {
    (async () => {
      // Dev override: ?onboard=1 shows the flow even if already complete
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.search?.includes('onboard=1')) {
        setOnboarded(false);
        return;
      }
      try {
        const v = await AsyncStorage.getItem(ONBOARDED_KEY);
        setOnboarded(v === '1');
      } catch {
        setOnboarded(true); // storage failure → don't block the app
      }
    })();
  }, []);

  const completeOnboarding = () => {
    AsyncStorage.setItem(ONBOARDED_KEY, '1').catch(() => {});
    setOnboarded(true);
  };

  if (!fontsLoaded || onboarded === null) {
    return null; // Splash — fonts + onboarding flag must load before first paint
  }

  // Onboarding renders outside the PalateProvider (it reads/writes the palate
  // store, so it must be inside one). Wrap it in its own minimal provider.
  if (!onboarded) {
    const onboardingContent = (
      <SafeAreaProvider>
        <PalateProvider>
          <StatusBar style="light" />
          <OnboardingScreen onComplete={completeOnboarding} />
        </PalateProvider>
      </SafeAreaProvider>
    );
    if (Platform.OS === 'web') {
      return (
        <View style={webStyles.outer}>
          <View style={webStyles.frame}>
            {onboardingContent}
          </View>
        </View>
      );
    }
    return onboardingContent;
  }

  const appContent = (
    <SafeAreaProvider>
      <AuthProvider>
        <PalateProvider>
          <StatusBar style="light" />
          <NavigationContainer theme={KelderTheme} linking={linking}>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: color.gold,
                tabBarInactiveTintColor: color.bodyMid,
                tabBarStyle: {
                  backgroundColor: color.canvas,
                  borderTopColor: color.hairline,
                  borderTopWidth: 1,
                  height: 64,
                  paddingBottom: 12,
                  paddingTop: 8,
                },
                tabBarLabelStyle: {
                  fontFamily: 'GeistMono',
                  fontSize: 10,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  marginTop: 2,
                },
                tabBarIcon: ({ color: iconColor, focused }) => {
                  const Icon = tabIconComponents[route.name];
                  if (!Icon) return null;
                  return <Icon size={22} color={iconColor} focused={focused} />;
                },
                tabBarItemStyle: {
                  paddingVertical: 4,
                },
              })}
            >
              <Tab.Screen name="Discover" component={DiscoverScreen} options={{ tabBarLabel: 'DISCOVER' }} />
              <Tab.Screen name="Scan" component={ScanScreen} options={{ tabBarLabel: 'SCAN' }} />
              <Tab.Screen name="Cellar" component={CellarScreen} options={{ tabBarLabel: 'CELLAR' }} />
              <Tab.Screen name="Events" component={EventsScreen} options={{ tabBarLabel: 'EVENTS' }} />
              <Tab.Screen name="Learn" component={LearnScreen} options={{ tabBarLabel: 'LEARN' }} />
            </Tab.Navigator>
          </NavigationContainer>
        </PalateProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={webStyles.outer}>
        <View style={webStyles.frame}>
          {appContent}
        </View>
      </View>
    );
  }

  return appContent;
}

const webStyles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#08030a',
    // Box shadow via CSS on web — React Native Web accepts these as camelCase
    ...(({
      boxShadow: '0 0 120px rgba(0,0,0,0.95), 0 0 1px rgba(196,151,60,0.15)',
    }) as any),
  },
});
