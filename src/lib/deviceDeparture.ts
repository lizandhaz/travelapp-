import { cityNear, type DepartureCity } from './nearbyTrips';

export const canUseDeviceLocation = true;
export type DeviceDeparture = { city: DepartureCity } | { reason: 'denied' | 'unavailable' };

export async function findDeviceDeparture(askPermission: boolean): Promise<DeviceDeparture> {
  // A preview host without this native module can still use the manual city picker.
  const { Location, LocationProfile, RequestPermissionsAccuracyOption } = await import('expo-location/next');
  let permission = await Location.getForegroundPermissions();
  if (askPermission && !permission.granted && permission.canAskAgain) {
    permission = await Location.requestForegroundPermissions({ accuracy: RequestPermissionsAccuracyOption.REDUCED });
  }
  if (!permission.granted) return { reason: 'denied' };

  const position = await Location.getPosition({ profile: LocationProfile.LOW_POWER, timeout: 10, maxCachedAge: 120 });
  if (!position || Date.now() - position.timestamp > 120_000) return { reason: 'unavailable' };
  const { latitude, longitude } = position.coordinates;
  const city = cityNear([latitude, longitude]);
  return city ? { city } : { reason: 'unavailable' };
}
