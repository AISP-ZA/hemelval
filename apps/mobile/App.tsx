/**
 * Hemelval — app root.
 * Tab navigation: Discover · Scan · Cellar · Events · Profile.
 * Mobile-first, dark canvas, AISP DESIGN.md spec.
 *
 * Loads Cormorant Garamond (serif display), Inter (body), and GeistMono
 * (caption mono) via expo-google-fonts before rendering the navigator.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DiscoverIcon, ScanIcon, CellarIcon, EventsIcon, ProfileIcon } from './components/TabIcons.js';
import { useFonts } from 'expo-font';
import { color } from './theme/tokens.js';
import { PalateProvider } from './hooks/usePalate.js';
import { AuthProvider } from './hooks/useAuth.js';
import { DiscoverScreen } from './screens/DiscoverScreen.js';
import { ScanScreen } from './screens/ScanScreen.js';
import { CellarScreen } from './screens/CellarScreen.js';
import { EventsScreen } from './screens/EventsScreen.js';
import { ProfileScreen } from './screens/ProfileScreen.js';

const Tab = createBottomTabNavigator();

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
  Profile: ProfileIcon,
};

export default function App() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond: require('@expo-google-fonts/cormorant-garamond/400Regular/CormorantGaramond_400Regular.ttf'),
    Inter: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    GeistMono: require('./theme/assets/GeistMono-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Splash — fonts must load before first paint to prevent fallback flash
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PalateProvider>
          <StatusBar style="light" />
          <NavigationContainer theme={KelderTheme}>
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
              <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'PROFILE' }} />
            </Tab.Navigator>
          </NavigationContainer>
        </PalateProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
