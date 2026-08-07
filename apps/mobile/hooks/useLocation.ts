/**
 * useLocation — cross-platform foreground geolocation.
 *
 * Flow:
 *   1. On mount, check permission status (non-prompting).
 *   2. If granted, fetch current position immediately.
 *   3. If not granted, return permission='undetermined' and wait for explicit request().
 *   4. On denial or error, fall back to the Western Cape centroid (Stellenbosch)
 *      so the app is still useful — you see "near Stellenbosch" instead of nothing.
 *
 * expo-location delegates to navigator.geolocation on web, so the same code
 * path works everywhere. No background tracking.
 */

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { WC_CENTROID } from '../lib/geo.js';

export type LocationPermission = 'undetermined' | 'granted' | 'denied';

export interface UserLocation {
  lat: number;
  lng: number;
  /** Whether this is a real GPS fix or the WC fallback. */
  isFallback: boolean;
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permission, setPermission] = useState<LocationPermission>('undetermined');
  const [loading, setLoading] = useState(false);

  // Check existing permission on mount (non-prompting)
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === 'web') {
          // On web, expo-location getForegroundPermissionsAsync isn't fully reliable;
          // check navigator.permissions or just start in undetermined and prompt on request.
          if (navigator.geolocation) {
            setPermission('undetermined');
          } else {
            setPermission('denied');
            setLocation({ ...WC_CENTROID, isFallback: true });
          }
          return;
        }
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          setPermission('granted');
          await fetchPosition();
        } else {
          setPermission(status === 'denied' ? 'denied' : 'undetermined');
        }
      } catch {
        setPermission('denied');
        setLocation({ ...WC_CENTROID, isFallback: true });
      }
    })();
  }, []);

  const fetchPosition = useCallback(async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'web') {
        // Web: use navigator.geolocation directly
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, isFallback: false });
            setPermission('granted');
            setLoading(false);
          },
          () => {
            setLocation({ ...WC_CENTROID, isFallback: true });
            setPermission('denied');
            setLoading(false);
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
        );
      } else {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, isFallback: false });
        setPermission('granted');
        setLoading(false);
      }
    } catch {
      setLocation({ ...WC_CENTROID, isFallback: true });
      setPermission('denied');
      setLoading(false);
    }
  }, []);

  /** Prompt the user for permission and fetch position on grant. */
  const request = useCallback(async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'web') {
        fetchPosition(); // web prompts on getCurrentPosition
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermission('granted');
        await fetchPosition();
      } else {
        setPermission('denied');
        setLocation({ ...WC_CENTROID, isFallback: true });
        setLoading(false);
      }
    } catch {
      setPermission('denied');
      setLocation({ ...WC_CENTROID, isFallback: true });
      setLoading(false);
    }
  }, [fetchPosition]);

  return { location, permission, loading, request };
}
