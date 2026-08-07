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
import { Platform, View, StyleSheet, Dimensions } from 'react-native';
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
import { LandingScreen } from './screens/LandingScreen.js';

const ONBOARDED_KEY = 'decanta.onboarded.v1';
const ENTERED_KEY = 'decanta.entered.v1';

/**
 * On web, only apply the desktop centering frame on wide viewports (>520px).
 * Mobile phones get full-width — the frame was leaking desktop assumptions onto mobile.
 */
function useDesktopFrame(): boolean {
  const [isWide, setIsWide] = useState(() => {
    if (Platform.OS !== 'web') return false;
    return Dimensions.get('window').width > 520;
  });
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = ({ window: w }: { window: { width: number } }) => setIsWide(w.width > 520);
    const sub = Dimensions.addEventListener('change', handler);
    return () => { sub?.remove?.(); };
  }, []);
  return isWide;
}

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

  // First-run landing + onboarding gate.
  // On web: LandingScreen → Enter → Onboarding → App
  // On native: Onboarding → App (app store listing is the landing page)
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [entered, setEntered] = useState<boolean>(Platform.OS !== 'web'); // native = already entered
  useEffect(() => {
    (async () => {
      // Dev override: ?onboard=1 shows the flow even if already complete
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.search?.includes('onboard=1')) {
        setEntered(true);
        setOnboarded(false);
        return;
      }
      try {
        const ent = await AsyncStorage.getItem(ENTERED_KEY);
        setEntered(ent === '1' || Platform.OS !== 'web');
        const v = await AsyncStorage.getItem(ONBOARDED_KEY);
        setOnboarded(v === '1');
      } catch {
        setEntered(true);
        setOnboarded(true); // storage failure → don't block the app
      }
    })();
  }, []);

  const completeOnboarding = () => {
    AsyncStorage.setItem(ONBOARDED_KEY, '1').catch(() => {});
    setOnboarded(true);
  };

  const enterApp = () => {
    AsyncStorage.setItem(ENTERED_KEY, '1').catch(() => {});
    setEntered(true);
  };

  const showDesktopFrame = useDesktopFrame();

  if (!fontsLoaded || onboarded === null) {
    return null; // Splash — fonts + onboarding flag must load before first paint
  }

  // ── Landing page (web first-time visitors only) ──
  // Shows a premium marketing surface before entering the app.
  // On native, the app store listing is the landing page — skip straight in.
  if (!entered && Platform.OS === 'web') {
    const landingContent = (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <LandingScreen onEnter={enterApp} />
      </SafeAreaProvider>
    );
    if (showDesktopFrame) {
      return (
        <View style={webStyles.outer}>
          <View style={webStyles.frame}>
            {landingContent}
          </View>
        </View>
      );
    }
    return landingContent;
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
    if (showDesktopFrame) {
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

  if (showDesktopFrame) {
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
