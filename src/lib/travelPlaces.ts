import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { fetchBoards, type BoardItem } from './boards';
import { countryOf } from './knownPlaces';
import { getPlace, places as samplePlaces } from './sample';
import { countriesIn, fetchMyTrips, type Place, type Trip } from './trips';

/** A place on your travel map, and the page it opens. */
export type MapPlace = Place & { href: string | null };

/** Places you've been (every stop on your trips, once each), opening the trip. */
export function beenPlaces(trips: Trip[]): MapPlace[] {
  const seen = new Map<string, MapPlace>();
  for (const t of trips)
    for (const s of t.stops) {
      const place = { name: s.name, country: countryOf(s) };
      const key = `${place.name.toLowerCase()}|${place.country.toLowerCase()}`;
      if (!seen.has(key)) seen.set(key, { ...place, href: `/trip/${t.id}` });
    }
  return [...seen.values()];
}

/** Places on your Want to go list, opening their place page when there is one. */
export function wishPlaces(items: BoardItem[]): MapPlace[] {
  return items.filter((i) => i.kind === 'place').map((i) => {
    const n = i.name.trim().toLowerCase().replace(/^the /, '');
    const slug = i.slug && getPlace(i.slug) ? i.slug : samplePlaces.find((p) => p.name.toLowerCase().replace(/^the /, '') === n)?.slug;
    return { name: i.name, country: countryOf(i), href: slug ? `/place/${slug}` : null };
  });
}

/** Your map's places, loaded each time the screen comes into view (for the full-screen map). */
export function useTravelPlaces() {
  const [data, setData] = useState<{ been: MapPlace[]; wish: MapPlace[]; countries: number; failed?: string } | null>(null);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([fetchMyTrips(), fetchBoards().catch(() => [])])
        .then(([trips, boards]) => {
          if (!active) return;
          setData({
            been: beenPlaces(trips),
            wish: wishPlaces(boards.find((b) => b.kind === 'wish')?.items ?? []),
            countries: countriesIn(trips),
          });
        })
        // A failed load says so, rather than an empty map that looks like you've been nowhere (overnight audit).
        .catch((e: Error) => active && setData({ been: [], wish: [], countries: 0, failed: e.message }));
      return () => {
        active = false;
      };
    }, []),
  );
  return data;
}
