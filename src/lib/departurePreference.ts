import AsyncStorage from '@react-native-async-storage/async-storage';

import { departureCity, type DepartureCity } from './nearbyTrips';

type DeparturePreference = { city: DepartureCity; source: 'manual' | 'device' };
const storageKey = (userId: string) => `departure-city:${userId}`;

export async function getDeparturePreference(userId: string): Promise<DeparturePreference | null> {
  const stored = await AsyncStorage.getItem(storageKey(userId));
  if (!stored) return null;
  const { cityId, source } = JSON.parse(stored) as { cityId: string; source: string };
  const city = departureCity(cityId);
  return city && (source === 'manual' || source === 'device') ? { city, source } : null;
}

export async function setDeparturePreference(userId: string, preference: DeparturePreference | null) {
  if (!preference) return AsyncStorage.removeItem(storageKey(userId));
  return AsyncStorage.setItem(storageKey(userId), JSON.stringify({ cityId: preference.city.id, source: preference.source }));
}
