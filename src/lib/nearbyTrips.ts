import { plain, WORLD_PLACES } from './knownPlaces';
import { distanceKm, placeKey } from './match';

type Point = [number, number];
export type DepartureCity = { id: string; name: string; region: string; point: Point };

const florida: DepartureCity = { id: 'region|florida|usa', name: 'Florida', region: 'USA', point: [27.8, -81.7] };
const cities = new Map<string, DepartureCity>([[florida.id, florida]]);
const majorCities = new Set<string>();
for (const [index, { name, country, lat, lon }] of WORLD_PLACES.entries()) {
  if (!name || !country || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  const id = placeKey(name, country);
  // The gazetteer is ordered by population. Keep the best-known city when names repeat within a country.
  if (!cities.has(id)) cities.set(id, { id, name, region: country, point: [lat, lon] });
  if (index < 400) majorCities.add(id);
}

export function departureCity(id: string) {
  return cities.get(id) ?? null;
}

export function searchDepartureCities(query: string, limit = 8): DepartureCity[] {
  const words = plain(query).split(/[\s,]+/).filter(Boolean);
  if (!words.length) return [];
  const exact: DepartureCity[] = [];
  const starts: DepartureCity[] = [];
  const other: DepartureCity[] = [];
  for (const city of cities.values()) {
    const name = plain(city.name);
    const label = `${name} ${plain(city.region)}`;
    if (!name.includes(words[0]) || !words.every((word) => label.includes(word))) continue;
    if (name === words.join(' ')) exact.push(city);
    else if (name.startsWith(words[0])) starts.push(city);
    else other.push(city);
  }
  return [...exact, ...starts, ...other].slice(0, limit);
}

/** Match approximate coordinates in memory. A sparse catalogue can leave a city unknown. */
export function cityNear([lat, lon]: Point): DepartureCity | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  const approximate: Point = [Math.round(lat * 20) / 20, Math.round(lon * 20) / 20];
  let nearest: DepartureCity | null = null;
  let best = 70;
  let major: DepartureCity | null = null;
  let bestMajor = 12;
  for (const city of cities.values()) {
    if (city === florida || Math.abs(city.point[0] - approximate[0]) > 0.7) continue;
    const distance = distanceKm(approximate, city.point);
    if (distance < best) {
      nearest = city;
      best = distance;
    }
    if (distance < bestMajor && majorCities.has(city.id)) {
      major = city;
      bestMajor = distance;
    }
  }
  // Prefer a nearby major city over a neighbourhood within its metro area.
  return major ?? nearest;
}

export const JOURNEY_GROUPS = [
  { id: 'weekend', label: 'Weekend trips' },
  { id: 'medium', label: 'Worth the journey' },
  { id: 'long', label: 'Big adventures' },
] as const;

type JourneyGroup = (typeof JOURNEY_GROUPS)[number]['id'];
type Journey = { group: JourneyGroup; ease: number };
type JourneyEstimate = (from: Point, to: Point) => Journey | null;

/** Straight-line distance is a proxy for effort. A future estimator can use real route data. */
export const estimateJourney: JourneyEstimate = (from, to) => {
  const km = distanceKm(from, to);
  if (km < 45) return null;
  const weekendLimit = 1650;
  const mediumLimit = 4000;
  if (km <= weekendLimit) return { group: 'weekend', ease: 1 - km / weekendLimit };
  if (km <= mediumLimit) return { group: 'medium', ease: 1 - (km - weekendLimit) / (mediumLimit - weekendLimit) };
  return { group: 'long', ease: 0 };
};

type Destination = { point: Point; bestMonths: number[]; taste: number };

export function groupNearbyTrips<T extends Destination>(
  from: Point,
  destinations: T[],
  month: number,
  estimate: JourneyEstimate = estimateJourney,
) {
  const ranked: Record<JourneyGroup, { place: T; value: number }[]> = { weekend: [], medium: [], long: [] };
  for (const place of destinations) {
    const journey = estimate(from, place.point);
    if (!journey) continue;
    const inSeason = place.bestMonths.includes(month);
    ranked[journey.group].push({ place, value: place.taste + (inSeason ? 0.45 : 0) + 0.35 * journey.ease });
  }
  return JOURNEY_GROUPS.map((group) => ({
    ...group,
    places: ranked[group.id].sort((a, b) => b.value - a.value).map(({ place }) => place),
  }));
}
