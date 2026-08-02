/**
 * Kelder — app root.
 * Tab navigation: Discover · Scan · Cellar · Events · Profile.
 * Mobile-first, dark canvas, AISP DESIGN.md spec.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
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
    primary: color.twilight,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PalateProvider>
          <StatusBar style="light" />
          <NavigationContainer theme={KelderTheme}>
            <Tab.Navigator
              screenOptions={{
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
                tabBarItemStyle: {
                  paddingVertical: 4,
                },
              }}
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
