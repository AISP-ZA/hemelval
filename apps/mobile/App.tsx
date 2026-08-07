/**
 * Decanta — app root.
 * Tab navigation: Discover · Scan · Cellar · Events · Profile.
 * Mobile-first, dark canvas, AISP DESIGN.md spec.
 *
 * Loads Cormorant Garamond (serif display), Inter (body), and GeistMono
 * (caption mono) via expo-google-fonts before rendering the navigator.
 */

import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View, StyleSheet, Dimensions, Animated, Image, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiscoverIcon, ScanIcon, CellarIcon, EventsIcon, LearnIcon } from './components/TabIcons.js';
import { useFonts } from 'expo-font';
import { color, font } from './theme/tokens.js';
import { PalateProvider } from './hooks/usePalate.js';
import { AuthProvider } from './hooks/useAuth.js';
import { DiscoverScreen } from './screens/DiscoverScreen.js';
import { ScanScreen } from './screens/ScanScreen.js';
import { CellarScreen } from './screens/CellarScreen.js';
import { EventsScreen } from './screens/EventsScreen.js';
import { LearnScreen } from './screens/LearnScreen.js';
import { HERO_VINEYARD } from './lib/imagery.js';

const SPLASH_KEY = 'decanta.splash.v1';

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

  // ── Cinematic splash gate ──────────────────────────────────────────────────
  // ONE screen before wine: a 3-second atmospheric vineyard moment with the
  // DECANTA wordmark, then dissolves into the app. No marketing, no quiz,
  // no signup wall. Pure atmosphere → wine. Shows once (AsyncStorage gate),
  // ?splash=1 forces it for review.
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const forceSplash = Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.search?.includes('splash=1');
      const seen = await AsyncStorage.getItem(SPLASH_KEY);
      if (seen === '1' && !forceSplash) {
        setShowSplash(false);
        return;
      }
      // Wordmark fades in at 400ms
      Animated.timing(wordmarkOpacity, {
        toValue: 1,
        duration: 1200,
        delay: 400,
        useNativeDriver: true,
      }).start();
      // Splash dissolves at 2800ms
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 700,
        delay: 2800,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
        AsyncStorage.setItem(SPLASH_KEY, '1').catch(() => {});
      });
    })();
  }, []);

  const showDesktopFrame = useDesktopFrame();

  if (!fontsLoaded) {
    return null;
  }

  // ── The cinematic splash ──
  if (showSplash) {
    const splash = (
      <Animated.View style={[splashStyles.wrap, { opacity: splashOpacity }]}>
        <Image source={{ uri: HERO_VINEYARD.url }} style={splashStyles.bg} resizeMode="cover" />
        <LinearGradient colors={['rgba(10,4,16,0.3)', 'rgba(10,4,16,0.85)']} style={StyleSheet.absoluteFillObject} />
        <Animated.View style={[splashStyles.content, { opacity: wordmarkOpacity }]}>
          <Text style={splashStyles.wordmark}>DECANTA</Text>
          <Text style={splashStyles.tagline}>SOUTH AFRICAN WINE</Text>
        </Animated.View>
      </Animated.View>
    );
    if (showDesktopFrame) {
      return (
        <View style={webStyles.outer}>
          <View style={webStyles.frame}>{splash}</View>
        </View>
      );
    }
    return splash;
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
    backgroundColor: '#0a0410',
    // Box shadow via CSS on web — React Native Web accepts these as camelCase
    ...(({
      boxShadow: '0 0 120px rgba(0,0,0,0.95), 0 0 1px rgba(212,148,44,0.15)',
    }) as any),
  },
});

const splashStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: color.canvas,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: 'CormorantGaramond',
    fontSize: 36,
    fontWeight: '400',
    letterSpacing: 12,
    color: '#d4942c',
    marginBottom: 8,
  },
  tagline: {
    fontFamily: 'GeistMono',
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 4,
    color: '#8a7060',
  },
});
