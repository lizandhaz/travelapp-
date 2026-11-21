import { photos, type PhotoName } from './photos';
import { placeDetails, type PlaceDetail } from './placeDetails';
import { friendsFeed, type FeedItem } from './sample';

/**
 * A friend's trip summary (sample content for now): what they rated it, where they stayed,
 * where they ate, what they did and their tips, gathered from the place's details where
 * that friend is named. Real friends' trips arrive with friends (plan Step 3).
 */
export type FriendTrip = {
  id: string;
  item: FeedItem;
  photos: PhotoName[];
  stay: { name: string; type: string; score: number; sub: string | null; photo: PhotoName | null };
  eats: PlaceDetail['eats'];
  dos: PlaceDetail['dos'];
  tips: PlaceDetail['tips'];
};

export const friendTripId = (f: FeedItem) => `${f.who}-${f.slug}`.toLowerCase();

const isPhoto = (name: string): name is PhotoName => name in photos;

export function getFriendTrip(id: string): FriendTrip | null {
  const item = friendsFeed.find((f) => friendTripId(f) === id);
  if (!item) return null;
  const detail = placeDetails[item.slug];
  const theirs = <T extends { from: string | null }>(list: T[] | undefined) => (list ?? []).filter((x) => x.from === item.who);
  // Their photos: the one they posted, then more from the same place.
  const more = [1, 2, 3, 4, 5].map((n) => `${item.slug}-${n}`).filter(isPhoto);
  const pics = [...new Set([...(item.photo ? [item.photo] : []), ...more])];
  const known = detail?.stays.find((s) => s.name === item.stayName);
  return {
    id,
    item,
    photos: pics,
    stay: { name: item.stayName, type: item.stayType, score: item.stayScore, sub: known?.sub ?? null, photo: known?.photo ?? null },
    eats: theirs(detail?.eats).slice(0, 4),
    dos: theirs(detail?.dos).slice(0, 4),
    tips: theirs(detail?.tips).slice(0, 3),
  };
}
