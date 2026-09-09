import { Store, GeofencingConfig } from '../types';

/**
 * Calcula la distancia en metros entre dos coordenadas geográficas usando la fórmula Haversine
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export interface NearestStoreResult {
  store: Store;
  distanceMeters: number;
  isInsideGeofence: boolean;
}

/**
 * Encuentra la tienda Tottus más cercana a la posición GPS actual
 */
export function findNearestTottusStore(
  userLat: number,
  userLng: number,
  stores: Store[],
  geofenceRadiusMeters: number = 150
): NearestStoreResult | null {
  const validStores = stores.filter(
    s => typeof s.latitud === 'number' && !isNaN(s.latitud) && typeof s.longitud === 'number' && !isNaN(s.longitud)
  );

  if (validStores.length === 0) return null;

  let nearest: Store = validStores[0];
  let minDistance = calculateDistanceMeters(
    userLat,
    userLng,
    validStores[0].latitud!,
    validStores[0].longitud!
  );

  for (let i = 1; i < validStores.length; i++) {
    const s = validStores[i];
    const dist = calculateDistanceMeters(userLat, userLng, s.latitud!, s.longitud!);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = s;
    }
  }

  return {
    store: nearest,
    distanceMeters: minDistance,
    isInsideGeofence: minDistance <= geofenceRadiusMeters
  };
}

export const DEFAULT_GEOFENCING_CONFIG: GeofencingConfig = {
  enabled: true,
  radiusMeters: 150, // 150 metros de la tienda
  autoCheckIn: true,
  autoCheckOut: true,
  highAccuracy: true,
  soundAlerts: true,
  activeTracking: false,
  nearestStoreCode: '103',
  nearestStoreName: 'Megaplaza Angamas',
  distanceToNearestMeters: 85,
  isInsideGeofence: true
};
