/**
 * Geo utilities for "Wineries Near Me" — distance calculation, sorting, formatting.
 *
 * Haversine formula for great-circle distance over a sphere. Accurate enough for
 * estate proximity at the Western Cape scale (< 300 km). No external dependency.
 */

import type { MockEstate } from './mockData.js';

/** Western Cape default centroid (Stellenbosch) used when location is unavailable. */
export const WC_CENTROID = { lat: -33.9249, lng: 18.8607, label: 'Stellenbosch · WC default' };

/** Earth radius in km. */
const R_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Great-circle distance between two coordinates, in km.
 * Uses the haversine formula.
 */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R_KM * c;
}

/** Check whether an estate has real (non-zero, in-range) coordinates. */
export function hasRealGeo(lat: number, lng: number): boolean {
  return (
    lat !== 0 &&
    lng !== 0 &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}

/**
 * Sort estates by proximity to a point. Filters out un-geocoded estates.
 * Returns a new array; does not mutate input.
 */
export function sortByDistance(
  estates: MockEstate[],
  lat: number,
  lng: number,
): { estate: MockEstate; distanceKm: number }[] {
  return estates
    .filter((e) => hasRealGeo(e.lat, e.lng))
    .map((e) => ({ estate: e, distanceKm: haversineKm(lat, lng, e.lat, e.lng) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Format a distance in km for display: "3.2 km", "12 km", "145 km". */
export function formatDistance(km: number): string {
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
