/**
 * The matching engine: how well a place fits someone ("% match") and how good it's
 * likely to be for them (score out of 10), from what they've done in the app.
 *
 * Pure maths, no app code: everything comes in as plain data, so it can be tested on
 * its own (tests/match.test.mjs). The app builds the inputs in lib/placeFeatures.ts
 * and lib/taste.tsx.
 *
 * In short:
 *  1. Every place is described by features: types of holiday (beach, city, food…),
 *     where it is, how warm it is when people go, who it suits, and a base rating.
 *  2. A person's taste profile is built from signals, each with a weight:
 *       - trips they've added: a 9.5 pulls towards places like it, a 5 pushes away
 *         (more recent and longer trips count a bit more);
 *       - places on their Want to go list (a strong "like") and other lists (a lighter one);
 *       - who they travel with, and the kinds of stay they rated well.
 *  3. Fit (0–1) compares the profile with a place on five things: the same kind of
 *     holiday, near places they loved, the right warmth, the right company and the
 *     right price. What they've enjoyed and what they want next are two interests: a
 *     place that suits either one well fits (not a lukewarm average of both).
 *     With little to go on, fit stays near neutral and sharpens as signals add up.
 *  4. Score = the place's base rating (blended with friends' ratings, friends whose
 *     taste is like theirs counting more), moved by fit: a little up for a great fit,
 *     a lot down for a poor one, so a place that isn't for them reads 5–7, not 8.
 */

import { buildHotelTaste, EMPTY_HOTEL_TASTE, hotelFit, type HotelEvent, type HotelPrefs, type HotelTaste } from './hotels';

export type Tags = Record<string, number>;

export type PlaceFeatures = {
  /** Plain "name|country" (see placeKey). */
  key: string;
  name: string;
  /** Holiday types, 0–1 each ("beach", "food", "lakes"…). */
  tags: Tags;
  /** Latitude, longitude. */
  pos: [number, number] | null;
  /** Typical daytime high when people go, °C. */
  warmth: number | null;
  /** Who it suits: "couples", "friends", "families", "solo". */
  goodFor: string[];
  /** Typical stay price, £ a night. */
  priceFrom: number | null;
  /** A base rating out of 10 from everyone (sample data until real ratings exist). */
  baseScore: number | null;
};

export type Companions = 'solo' | 'partner' | 'friends' | 'family';

export type Signal =
  | {
      kind: 'trip';
      place: PlaceFeatures;
      score: number;
      /** "YYYY-MM" */
      month: string;
      nights: number | null;
      companions: Companions | null;
      stay?: { type: string; score: number } | null;
      /** An extra stop on a trip already counted (shapes taste, but isn't a separate trip). */
      extraStop?: boolean;
      /** A place ticked as "been" in first-time setup: shapes taste, but has no score of yours to show. */
      told?: boolean;
    }
  /** A place on a list: Want to go (wish) or one of your own lists. savedAt is an ISO date. */
  | { kind: 'save'; place: PlaceFeatures; wish: boolean; savedAt?: string | null }
  /** A place page you've looked at: how many times, for how long in total, and when last. */
  | { kind: 'view'; place: PlaceFeatures; views: number; seconds: number; lastViewed: string }
  /** A hint with no place, e.g. a list called "Ski trips" (holiday types only). */
  | { kind: 'interest'; tags: Tags; label: string }
  /** A hotel you rated on a trip (weight from your score) or saved to a board (lib/hotels.ts). */
  | ({ kind: 'hotel' } & HotelEvent)
  /** What you told us on the "Hotels you love" page. */
  | { kind: 'hotelPrefs'; prefs: HotelPrefs };

/** A friend's rating of a place (or of a stay at a place). */
export type FriendRating = { friend: string; placeKey: string; score: number; /** The place's holiday types (to learn the friend's taste). */ tags?: Tags };

export type Anchor = {
  name: string;
  kind: 'trip' | 'wish' | 'list' | 'view';
  weight: number;
  score?: number;
  place: PlaceFeatures;
  /** From first-time setup ("I've been"), with no score of yours. */
  told?: boolean;
};

/**
 * One half of someone's taste. "Enjoyed" comes from trips (what they've liked);
 * "next" comes from saves, list names and pages they look at (what they want now).
 */
export type TasteHalf = { tags: Tags; anchors: Anchor[]; warmth: number | null; evidence: number };

export type Profile = {
  /** What they've enjoyed (trips). */
  enjoyed: TasteHalf;
  /** What they want next (Want to go, lists, list names, pages they look at). */
  next: TasteHalf;
  /** Both halves added up (for "Your taste" and food). */
  tags: Tags;
  /** Every place that shapes the taste (for "Because…"). */
  anchors: Anchor[];
  /** Preferred warmth, °C: the two halves count equally. */
  warmth: number | null;
  /** Share of trips with each kind of company. */
  companions: Partial<Record<Companions, number>>;
  /** Who the places they want next suit ("couples": 0.8…), from Want to go and lists. */
  nextGoodFor: Record<string, number>;
  /** Signed preference per kind of stay ("Villa": +1.2…). */
  stayTypes: Record<string, number>;
  /** Typical stay price they liked, £ a night. */
  price: number | null;
  /** Hotel brands, class, styles and budget (lib/hotels.ts). */
  hotels: HotelTaste;
  /** Share of their trips that were short (3 nights or fewer): weekenders want places nearby. */
  shortTrips: number;
  /** How telling each holiday type is (rare types like "ski" count more than "food", which almost everywhere has). */
  tagWeights: Tags;
  /** How much we know: the sum of signal strengths. */
  evidence: number;
  /** 0–1: how far to trust the profile (rises with evidence). */
  confidence: number;
  /** Places they've been, by key, with their own score. */
  been: Record<string, number>;
  /** Places on their lists, by key. */
  saved: Record<string, 'wish' | 'list'>;
  /** Place pages they've looked at, by key. */
  viewed: Record<string, { views: number; seconds: number; weight: number }>;
  /** How much each friend's ratings count (friends whose taste is like yours count more). */
  friendWeights: Record<string, number>;
  /** How far each friend rates above everyone's average (a friend who gives everything 9.5 is evened out). */
  friendOffsets: Record<string, number>;
  counts: { trips: number; wish: number; lists: number; views: number };
};

export type PlaceResult = {
  /** Out of 10, one decimal. */
  score: number;
  /** The score before rounding, for putting places in order (so the order always follows the numbers shown). */
  raw: number;
  /** 40–99. */
  match: number;
  /** 0–1 before turning into a percentage. */
  fit: number;
  /** Your own score if you've been. */
  yours: number | null;
  reasons: string[];
  breakdown: {
    base: number;
    baseFrom: 'friends' | 'everyone' | 'friends and everyone' | 'nobody yet';
    friendsCount: number;
    tasteNudge: number;
    parts: { label: string; value: number }[];
  };
};

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

export function plainText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/^the /, '');
}

export function placeKey(name: string, country: string): string {
  return `${plainText(name)}|${plainText(country)}`;
}

/** Kilometres between two points. */
export function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Cosine similarity of two tag sets, using only positive values. 0–1. */
export function tagSimilarity(a: Tags, b: Tags): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const v of Object.values(a)) if (v > 0) na += v * v;
  for (const [k, v] of Object.entries(b)) {
    if (v <= 0) continue;
    nb += v * v;
    const av = a[k] ?? 0;
    if (av > 0) dot += av * v;
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/** Years between a "YYYY-MM" month and now. */
function yearsAgo(month: string, now: Date): number {
  const [y, m] = month.split('-').map(Number);
  if (!y || !m) return 0;
  return Math.max(0, (now.getFullYear() - y) + (now.getMonth() + 1 - m) / 12);
}

// ---------------------------------------------------------------------------
// 1. Signals → profile
// ---------------------------------------------------------------------------

/** How strongly one trip pulls: a 10 is +1, a 6.5 is neutral, a 3.5 is −1. */
export function tripWeight(score: number, month: string, nights: number | null, now = new Date()): number {
  const liking = clamp((score - 6.5) / 3, -1, 1);
  const recency = Math.max(0.35, 0.5 ** (yearsAgo(month, now) / 3)); // halves every 3 years
  const length = 0.8 + 0.2 * Math.min(1, (nights ?? 3) / 7); // a long stay is a little more telling
  return liking * recency * length;
}

/**
 * Saves are what you want next, so a Want to go place counts as much as a loved trip
 * (a list a little less). They fade slowly: half as much after a year, never below 60%.
 */
export const SAVE_WEIGHT = { wish: 1, list: 0.7 };
export function saveWeight(wish: boolean, savedAt: string | null | undefined, now = new Date()): number {
  const years = savedAt ? Math.max(0, (now.getTime() - new Date(savedAt).getTime()) / (365.25 * 864e5)) : 0;
  return (wish ? SAVE_WEIGHT.wish : SAVE_WEIGHT.list) * Math.max(0.6, 0.5 ** years);
}

/**
 * Looking at a place page is a light hint: more visits and more time count more
 * (up to 0.5, half a loved trip), fading by half every 45 days.
 */
export function viewWeight(views: number, seconds: number, lastViewed: string, now = new Date()): number {
  if (views <= 0) return 0;
  const days = Math.max(0, (now.getTime() - new Date(lastViewed).getTime()) / 864e5);
  const dwell = 1 + Math.min(1, seconds / views / 45); // 45 seconds a visit on average doubles it
  return Math.min(0.5, 0.12 * views ** 0.6 * dwell) * 0.5 ** (days / 45);
}

/** A list name that says something ("Ski trips") counts like a small save of that kind of place. */
export const INTEREST_WEIGHT = 0.35;

function emptyHalf(): TasteHalf & { warmthSum: number; warmthW: number } {
  return { tags: {}, anchors: [], warmth: null, evidence: 0, warmthSum: 0, warmthW: 0 };
}

/**
 * Builds someone's taste from their signals, in two halves (enjoyed / want next).
 * Friends' ratings are used to work out how much each friend agrees with them.
 */
export function buildProfile(signals: Signal[], friendRatings: FriendRating[] = [], now = new Date(), tagWeights: Tags = {}): Profile {
  const halves = { enjoyed: emptyHalf(), next: emptyHalf() };
  const stayTypes: Record<string, number> = {};
  const companionCount: Partial<Record<Companions, number>> = {};
  const been: Record<string, number> = {};
  const saved: Record<string, 'wish' | 'list'> = {};
  const viewed: Record<string, { views: number; seconds: number; weight: number }> = {};
  let priceSum = 0;
  let priceW = 0;
  const counts = { trips: 0, wish: 0, lists: 0, views: 0 };
  let shortN = 0;
  let nightsN = 0;
  const goodForSum: Record<string, number> = {};
  let goodForW = 0;

  const hotelEvents: HotelEvent[] = [];
  let hotelPrefs: HotelPrefs | null = null;
  for (const s of signals) {
    if (s.kind === 'hotel') {
      hotelEvents.push(s);
      continue;
    }
    if (s.kind === 'hotelPrefs') {
      hotelPrefs = s.prefs;
      continue;
    }
    if (s.kind === 'interest') {
      const h = halves.next;
      for (const [t, v] of Object.entries(s.tags)) h.tags[t] = (h.tags[t] ?? 0) + INTEREST_WEIGHT * v;
      h.evidence += INTEREST_WEIGHT;
      continue;
    }
    let w: number;
    let half: 'enjoyed' | 'next';
    if (s.kind === 'trip') {
      half = 'enjoyed';
      w = tripWeight(s.score, s.month, s.nights, now);
      if (!s.extraStop) counts.trips++;
      if (!s.extraStop && s.nights != null && w > 0) {
        nightsN++;
        if (s.nights <= 3) shortN++;
      }
      // Several trips to one place: keep the best score as "yours" (not for places only ticked in setup).
      if (!s.told) been[s.place.key] = Math.max(been[s.place.key] ?? 0, s.score);
      if (s.companions) companionCount[s.companions] = (companionCount[s.companions] ?? 0) + 1;
      if (s.stay) stayTypes[s.stay.type] = (stayTypes[s.stay.type] ?? 0) + clamp((s.stay.score - 6.5) / 3, -1, 1);
      halves.enjoyed.anchors.push({ name: s.place.name, kind: 'trip', weight: w, score: s.score, place: s.place, told: s.told });
    } else if (s.kind === 'save') {
      half = 'next';
      w = saveWeight(s.wish, s.savedAt, now);
      if (s.wish) counts.wish++;
      else counts.lists++;
      if (saved[s.place.key] !== 'wish') saved[s.place.key] = s.wish ? 'wish' : 'list';
      if (s.place.goodFor.length) {
        for (const g of s.place.goodFor) goodForSum[g] = (goodForSum[g] ?? 0) + w / s.place.goodFor.length;
        goodForW += w;
      }
      halves.next.anchors.push({ name: s.place.name, kind: s.wish ? 'wish' : 'list', weight: w, place: s.place });
    } else {
      half = 'next';
      // Looking again at somewhere you've saved or been adds little.
      const known = been[s.place.key] != null || saved[s.place.key] != null;
      w = viewWeight(s.views, s.seconds, s.lastViewed, now) * (known ? 0.3 : 1);
      counts.views++;
      viewed[s.place.key] = { views: s.views, seconds: s.seconds, weight: w };
      if (w > 0.01) halves.next.anchors.push({ name: s.place.name, kind: 'view', weight: w, place: s.place });
    }
    const h = halves[half];
    h.evidence += Math.abs(w);
    for (const [t, v] of Object.entries(s.place.tags)) h.tags[t] = (h.tags[t] ?? 0) + w * v;
    if (w > 0 && s.place.warmth != null && (s.place.tags.ski ?? 0) < 0.5) {
      h.warmthSum += w * s.place.warmth;
      h.warmthW += w;
    }
    if (w > 0 && s.place.priceFrom != null) {
      priceSum += w * s.place.priceFrom;
      priceW += w;
    }
  }

  const finish = (h: ReturnType<typeof emptyHalf>): TasteHalf => ({
    tags: h.tags,
    anchors: h.anchors,
    warmth: h.warmthW > 0 ? h.warmthSum / h.warmthW : null,
    evidence: h.evidence,
  });
  const enjoyed = finish(halves.enjoyed);
  const next = finish(halves.next);

  const tags: Tags = { ...enjoyed.tags };
  for (const [t, v] of Object.entries(next.tags)) tags[t] = (tags[t] ?? 0) + v;
  const warmths = [enjoyed.warmth, next.warmth].filter((x): x is number => x != null);

  const totalCompany = Object.values(companionCount).reduce((a, b) => a + (b ?? 0), 0);
  const companions: Partial<Record<Companions, number>> = {};
  for (const [c, n] of Object.entries(companionCount)) companions[c as Companions] = (n ?? 0) / totalCompany;

  const { friendWeights, friendOffsets } = friendTrust(friendRatings, been, tags, 1 - Math.exp(-(enjoyed.evidence + next.evidence) / 1.5));

  const nextGoodFor: Record<string, number> = {};
  for (const [g, v] of Object.entries(goodForSum)) nextGoodFor[g] = v / goodForW;

  const evidence = enjoyed.evidence + next.evidence;
  const hotels = hotelEvents.length || hotelPrefs ? buildHotelTaste(hotelEvents, hotelPrefs) : EMPTY_HOTEL_TASTE;
  // A budget you told us also says what kind of place you go for: half from your trips, half from the budget.
  const placePrice = priceW > 0 ? priceSum / priceW : null;
  const toldPrice = hotelPrefs?.budget && hotels.band ? (Number.isFinite(hotels.band[1]) ? Math.sqrt(Math.max(80, hotels.band[0]) * hotels.band[1]) : hotels.band[0] * 1.3) : null;
  return {
    tagWeights,
    enjoyed,
    next,
    tags,
    anchors: [...enjoyed.anchors, ...next.anchors],
    warmth: warmths.length ? warmths.reduce((a, b) => a + b, 0) / warmths.length : null,
    companions,
    nextGoodFor,
    stayTypes,
    price: toldPrice != null ? (placePrice != null ? (placePrice + toldPrice) / 2 : toldPrice) : placePrice,
    hotels,
    shortTrips: nightsN ? shortN / nightsN : 0,
    evidence,
    confidence: 1 - Math.exp(-evidence / 1.5), // ~50% after one loved trip, ~85% after three
    been,
    saved,
    viewed,
    friendWeights,
    friendOffsets,
    counts,
  };
}

/**
 * How much to trust each friend, and how to even out how generously they rate (owner, Nov 2026: friends barely moved
 * scores). A friend counts more (up to 2.5×) when their taste is like yours: the kinds of places they rate above their
 * own average are the kinds you love. Rating the places you've both been to like you do counts too. A friend whose taste
 * is the opposite of yours counts less (down to 0.4×). Each friend's ratings are also evened out against everyone's:
 * someone who gives everything 9.5 doesn't count as a rave every time.
 */
export function friendTrust(friendRatings: FriendRating[], been: Record<string, number>, yourTags: Tags, confidence: number) {
  const friendWeights: Record<string, number> = {};
  const friendOffsets: Record<string, number> = {};
  if (!friendRatings.length) return { friendWeights, friendOffsets };
  const everyone = friendRatings.reduce((a, r) => a + r.score, 0) / friendRatings.length;
  const byFriend = new Map<string, FriendRating[]>();
  for (const r of friendRatings) byFriend.set(r.friend, [...(byFriend.get(r.friend) ?? []), r]);
  for (const [friend, list] of byFriend) {
    const mean = list.reduce((a, r) => a + r.score, 0) / list.length;
    friendOffsets[friend] = (mean - everyone) * (list.length / (list.length + 3)); // only trusted once they've rated a few
    // Their taste: the kinds of places they rate above their own average.
    const theirs: Tags = {};
    for (const r of list) for (const [t, v] of Object.entries(r.tags ?? {})) theirs[t] = (theirs[t] ?? 0) + (r.score - mean) * v;
    const alike = signedSimilarity(yourTags, theirs) * confidence; // −1…1, gentle while we know little about you
    // Places you've both been: how close their scores are to yours.
    const shared = list.filter((r) => been[r.placeKey] != null);
    let agree = 0;
    if (shared.length) {
      const meanGap = shared.reduce((a, r) => a + Math.abs(r.score - been[r.placeKey]), 0) / shared.length;
      agree = Math.min(1, shared.length / 3) * (1 - meanGap / 1.5);
    }
    friendWeights[friend] = clamp(1 + 1.2 * alike + agree, 0.4, 2.5);
  }
  return { friendWeights, friendOffsets };
}

/** Cosine similarity that keeps signs: −1 (opposite tastes) to 1 (the same). */
function signedSimilarity(a: Tags, b: Tags): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const v of Object.values(a)) na += v * v;
  for (const [k, v] of Object.entries(b)) {
    nb += v * v;
    dot += (a[k] ?? 0) * v;
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

// ---------------------------------------------------------------------------
// 2. Fit
// ---------------------------------------------------------------------------

const COMPANY_TO_GOOD_FOR: Record<Companions, string> = { solo: 'solo', partner: 'couples', friends: 'friends', family: 'families' };
// The kind of holiday matters most (owner, Nov 2026: a beach lover's picks should be beaches); price joined in Nov 2026
// (a luxury traveller and a family on a budget were getting the same picks).
const PART_WEIGHTS = { kind: 0.5, near: 0.13, warmth: 0.12, company: 0.12, price: 0.13 };

/** Ski places are judged in winter, so warmth says nothing about them (either way). */
const skiPlace = (p: PlaceFeatures) => (p.tags.ski ?? 0) >= 0.5;

/**
 * How much "want next" counts against "enjoyed": up to an equal say, less while you've saved much less than you've
 * travelled (two saves shouldn't outweigh four loved trips), but never under a quarter, so a long trip history can't
 * drown out what you want now.
 */
export const NEXT_SHARE = 0.5;
export function nextShare(enjoyedEvidence: number, nextEvidence: number): number {
  if (enjoyedEvidence <= 0) return 1;
  if (nextEvidence <= 0) return 0;
  return clamp(NEXT_SHARE * Math.sqrt(nextEvidence / enjoyedEvidence), 0.25, NEXT_SHARE);
}

/**
 * Two interests, not one average (owner, Nov 2026: a city lover who saved two islands got only islands): a place that
 * suits what you've enjoyed OR what you want next fits well. Half the weighted average, half the better of the two.
 */
const EITHER = 0.5;
function blend(enjoyed: number | null, next: number | null, share = NEXT_SHARE): number | null {
  if (enjoyed == null) return next;
  if (next == null) return enjoyed;
  const average = (1 - share) * enjoyed + share * next;
  return (1 - EITHER) * average + EITHER * Math.max(enjoyed, next);
}

/**
 * How telling each holiday type is, from a catalogue of places: a type most places have ("food",
 * "culture") counts half, one a quarter of places have counts 1, a rare one ("ski", "wildlife") up to 2.
 */
export function tagRarity(catalogue: Tags[]): Tags {
  const df: Record<string, number> = {};
  for (const tags of catalogue) for (const [t, v] of Object.entries(tags)) if (v >= 0.3) df[t] = (df[t] ?? 0) + 1;
  const n = catalogue.length;
  const out: Tags = {};
  for (const [t, d] of Object.entries(df)) out[t] = clamp(Math.sqrt(n / d / 4), 0.5, 2);
  return out;
}

const weighted = (tags: Tags, w: Tags): Tags => Object.fromEntries(Object.entries(tags).map(([t, v]) => [t, v * (w[t] ?? 1)]));

/** Same kind of holiday, for one half: overlap with likes, minus overlap with dislikes (rare types count more). */
function kindFit(tags: Tags, place: PlaceFeatures, rarity: Tags = {}): number | null {
  const likes: Tags = {};
  const dislikes: Tags = {};
  for (const [t, v] of Object.entries(tags)) {
    if (v > 0) likes[t] = v;
    else if (v < 0) dislikes[t] = -v;
  }
  if (!Object.keys(likes).length && !Object.keys(dislikes).length) return null;
  if (!Object.keys(place.tags).length) return null;
  const pt = weighted(place.tags, rarity);
  // 0 overlap really is a poor fit (it used to start at 0.2, so a skier's beach still looked half right).
  return clamp(0.05 + 0.95 * tagSimilarity(weighted(likes, rarity), pt) - 0.7 * tagSimilarity(weighted(dislikes, rarity), pt), 0, 1);
}

/** Near places in one half (a 1,200 km falloff: the same region, not the same town). */
function nearFit(anchors: Anchor[], place: PlaceFeatures): number | null {
  if (!place.pos) return null;
  let pull = 0;
  let total = 0;
  for (const a of anchors) {
    if (!a.place.pos) continue;
    pull += a.weight * Math.exp(-distanceKm(a.place.pos, place.pos) / 1200);
    total += Math.abs(a.weight);
  }
  return total > 0 ? clamp(0.15 + 0.85 * (pull / total), 0, 1) : null;
}

/** The warmth one half goes for (gentle: 7 °C off is still fine). Ski places are judged in winter, so not on warmth. */
function warmthFit(want: number | null, place: PlaceFeatures): number | null {
  return want != null && place.warmth != null && !skiPlace(place) ? Math.exp(-(((place.warmth - want) / 7) ** 2)) : null;
}

/**
 * A price like you usually pay (from the places you loved and saved). Pricier than usual counts against a place
 * quickly; cheaper only gently (a luxury traveller may still love a simple place).
 */
function priceFit(usual: number | null, place: PlaceFeatures): number | null {
  if (usual == null || place.priceFrom == null) return null;
  const r = Math.log(place.priceFrom / usual);
  return r > 0 ? Math.exp(-((r / 0.7) ** 2)) : Math.exp(-((r / 1.3) ** 2));
}

/** The five parts of fit, each 0–1 (or null when we can't tell). */
export function fitParts(profile: Profile, place: PlaceFeatures) {
  const share = nextShare(profile.enjoyed.evidence, profile.next.evidence);
  const kind = blend(kindFit(profile.enjoyed.tags, place, profile.tagWeights), kindFit(profile.next.tags, place, profile.tagWeights), share);
  const near = blend(nearFit(profile.enjoyed.anchors, place), nearFit(profile.next.anchors, place), share);
  const warmth = blend(warmthFit(profile.enjoyed.warmth, place), warmthFit(profile.next.warmth, place), share);

  // Suits who they travel with (from trips) and who the places they want next suit.
  let past: number | null = null;
  const shares = Object.entries(profile.companions);
  if (shares.length && place.goodFor.length) {
    past = 0.25 + 0.75 * shares.reduce((a, [c, s]) => a + (place.goodFor.includes(COMPANY_TO_GOOD_FOR[c as Companions]) ? (s ?? 0) : 0), 0);
  }
  let ahead: number | null = null;
  const wanted = Object.entries(profile.nextGoodFor);
  if (wanted.length && place.goodFor.length) {
    ahead = 0.25 + 0.75 * wanted.reduce((a, [g, s]) => a + (place.goodFor.includes(g) ? s : 0), 0);
  }
  const company = blend(past, ahead, share);
  const price = priceFit(profile.price, place);

  return { kind, near, warmth, company, price };
}

/** Overall fit, 0–1, pulled towards a neutral 0.5 when we don't know much yet. */
export function fitFor(profile: Profile, place: PlaceFeatures): number {
  const parts = fitParts(profile, place);
  let sum = 0;
  let w = 0;
  for (const [name, value] of Object.entries(parts)) {
    if (value == null) continue;
    // Someone whose trips are weekends cares much more about being near (owner, Nov 2026: a Bath-and-York weekender got Kyoto).
    const pw = PART_WEIGHTS[name as keyof typeof PART_WEIGHTS] * (name === 'near' ? 1 + 3 * profile.shortTrips : 1);
    sum += pw * value;
    w += pw;
  }
  let raw = w ? sum / w : 0.5;
  // Gates: being near, warm or the right company can't rescue the wrong kind of holiday (a skier's beach resort), and a
  // price far beyond what you pay counts against everything else (a budget traveller's £650-a-night island).
  if (parts.kind != null) raw = Math.min(raw, parts.kind + 0.15);
  if (parts.price != null) raw *= 0.75 + 0.25 * parts.price;
  // …and for someone who takes weekends, somewhere far away can't score as a great fit (a Bath-and-York weekender got Kyoto).
  if (parts.near != null && profile.shortTrips >= 0.5) raw = Math.min(raw, parts.near + 0.2);
  return clamp(0.5 + (raw - 0.5) * profile.confidence + interestLift(profile, place), 0, 1);
}

/**
 * Somewhere you keep coming back to look at gets a direct lift (up to +0.15 fit,
 * about +10% match), fading as the views get older. Not for places you've saved or been.
 */
export function interestLift(profile: Profile, place: PlaceFeatures): number {
  const v = profile.viewed[place.key];
  if (!v || profile.been[place.key] != null || profile.saved[place.key] != null) return 0;
  return 0.15 * Math.min(1, v.weight / 0.5);
}

/** Fit as a percentage: 40–99, with 0.5 (neutral) at 70%. */
export function matchPercent(fit: number): number {
  return Math.round(clamp(70 + (fit - 0.5) * 70, 40, 99));
}

// ---------------------------------------------------------------------------
// 3. Score and reasons
// ---------------------------------------------------------------------------

/**
 * The base rating: the place's own rating blended with friends' ratings (a Bayesian
 * average, so one friend's 10 doesn't swamp everything).
 */
export function baseRating(profile: Profile, place: PlaceFeatures, friendRatings: FriendRating[]) {
  const mine = friendRatings.filter((r) => r.placeKey === place.key);
  const PRIOR = 1.5; // the place's own rating counts like one and a half friends (friends are the point of the app)
  let sum = 0;
  let w = 0;
  if (place.baseScore != null) {
    sum += PRIOR * place.baseScore;
    w += PRIOR;
  }
  for (const r of mine) {
    const fw = profile.friendWeights[r.friend] ?? 1;
    sum += fw * (r.score - (profile.friendOffsets[r.friend] ?? 0));
    w += fw;
  }
  const base = w ? sum / w : 7;
  const baseFrom: PlaceResult['breakdown']['baseFrom'] =
    mine.length && place.baseScore != null ? 'friends and everyone' : mine.length ? 'friends' : place.baseScore != null ? 'everyone' : 'nobody yet';
  return { base, baseFrom, friends: mine };
}

/**
 * Scores level off above 9 (10 → 9.6), so the very best matches stay in order instead of all
 * reading 10.0. A 10 is kept for places you rated 10 yourself.
 */
export function softTop(s: number): number {
  return s <= 9 ? s : 9 + 0.9 * (1 - Math.exp(-(s - 9) / 0.9));
}

/**
 * How far fit moves the score. Lopsided on purpose (owner, Nov 2026: everything scored 7.5–9.6, so a poor fit still
 * looked good): the places here are already well loved, so a great fit adds a little (up to +1.5) but a poor one takes
 * a lot away (down to −3.5). With little to go on, fit stays near neutral, so new people see each place's own rating.
 */
const UP_SWING = 3;
const DOWN_SWING = 7;
const tasteShift = (fit: number) => (fit >= 0.5 ? UP_SWING : DOWN_SWING) * (fit - 0.5);

/**
 * Other people's rating says less when a place isn't your kind of thing: a beach resort's 8.6 comes from people who
 * chose a beach holiday, not from skiers. So below a neutral fit the base slides towards an ordinary 7 (up to 60% of
 * the way for the poorest fit).
 */
const ORDINARY = 7;
export function relevantBase(base: number, fit: number): number {
  const relevance = fit >= 0.5 ? 1 : 0.4 + 1.2 * fit;
  return ORDINARY + (base - ORDINARY) * relevance;
}

export function scorePlace(profile: Profile, place: PlaceFeatures, friendRatings: FriendRating[]): PlaceResult {
  const fit = fitFor(profile, place);
  const { base: rated, baseFrom, friends } = baseRating(profile, place, friendRatings);
  const base = relevantBase(rated, fit);
  const tasteNudge = tasteShift(fit);
  const yours = profile.been[place.key] ?? null;
  const parts = fitParts(profile, place);
  const labels: Record<string, string> = {
    kind: 'The kind of holiday you love',
    near: 'Near places you loved',
    warmth: 'The warmth you go for',
    company: 'Suits who you travel with',
    price: 'A price like you usually pay',
  };
  const raw = yours ?? clamp(softTop(base + tasteNudge), 1, 9.9);
  return {
    score: yours ?? round1(raw),
    raw,
    match: matchPercent(fit),
    fit,
    yours,
    reasons: reasonsFor(profile, place, friends),
    breakdown: {
      // What the place is rated (by everyone and friends), and how far your taste moves it in all (shown on place pages).
      base: round1(rated),
      baseFrom,
      friendsCount: new Set(friends.map((f) => f.friend)).size,
      tasteNudge: yours != null ? 0 : round1(raw - rated),
      parts: Object.entries(parts)
        .filter(([, v]) => v != null)
        .map(([k, v]) => ({ label: labels[k], value: v as number })),
    },
  };
}

/**
 * How fair it is to say one place is "like" another, 0–1 (owner, Nov 2026: "Tenerife is not like the Maldives").
 * The same kind of holiday isn't enough: nearby places with the same feel compare easily, but places far apart
 * (over 3,500 km) only when they're very alike in kind, price and weather, and never for cities. 0 means don't compare them.
 */
export function likeness(a: PlaceFeatures, b: PlaceFeatures): number {
  const kind = tagSimilarity(a.tags, b.tags);
  if (kind < 0.4) return 0;
  const km = a.pos && b.pos ? distanceKm(a.pos, b.pos) : null;
  const priceRatio = a.priceFrom && b.priceFrom ? Math.min(a.priceFrom, b.priceFrom) / Math.max(a.priceFrom, b.priceFrom) : null;
  const warmGap = a.warmth != null && b.warmth != null ? Math.abs(a.warmth - b.warmth) : null;
  if (km == null || km > 3500) {
    // A city is its own culture: never "like" a city on the other side of the world (Madrid isn't like Kyoto).
    if ((a.tags.city ?? 0) >= 0.5 || (b.tags.city ?? 0) >= 0.5) return 0;
    // …and a tropical island isn't like a Mediterranean one (Mauritius isn't like Corfu).
    const tropical = (pos: [number, number] | null) => !!pos && Math.abs(pos[0]) < 23.5;
    if (tropical(a.pos) !== tropical(b.pos)) return 0;
    if (kind < 0.85 || priceRatio == null || priceRatio < 0.5 || warmGap == null || warmGap > 5) return 0;
  }
  const near = km == null ? 0 : Math.exp(-km / 1500);
  const price = priceRatio == null ? 0.8 : 0.5 + 0.5 * priceRatio;
  const warm = warmGap == null ? 0.8 : Math.max(0, 1 - warmGap / 15);
  return kind * (0.5 + 0.5 * near) * price * warm;
}

/** Up to three short reasons, most telling first. */
export function reasonsFor(profile: Profile, place: PlaceFeatures, friends: FriendRating[]): string[] {
  const out: { text: string; strength: number }[] = [];
  if (profile.been[place.key] != null) out.push({ text: `You gave it ${profile.been[place.key].toFixed(1)}`, strength: 10 });

  // The place in their history most like this one (only a realistic comparison: see likeness).
  let best: { a: Anchor; sim: number } | null = null;
  for (const a of profile.anchors) {
    if (a.weight <= 0 || a.place.key === place.key) continue;
    const sim = likeness(a.place, place) * a.weight;
    if (sim > 0 && (!best || sim > best.sim)) best = { a, sim };
  }
  if (best && best.sim > 0.18) {
    const { a } = best;
    const text =
      a.kind === 'trip'
        ? a.told
          ? `Like ${a.name}, where you’ve been`
          : `Like ${a.name}, which you gave ${a.score!.toFixed(1)}`
        : a.kind === 'wish'
          ? `Like ${a.name} on your Want to go list`
          : a.kind === 'list'
            ? `Like ${a.name}, which you saved`
            : `Like ${a.name}, which you’ve been looking at`;
    out.push({ text, strength: 1 + best.sim });
  }

  // Somewhere they keep coming back to look at.
  const seen = profile.viewed[place.key];
  if (seen && seen.views >= 2 && profile.been[place.key] == null && profile.saved[place.key] == null) {
    out.push({ text: `You’ve looked at it ${seen.views} times`, strength: 0.9 + Math.min(0.5, seen.views / 20) });
  }

  // The friend who loved it most.
  const top = [...friends].sort((x, y) => y.score - x.score)[0];
  if (top && top.score >= 8) {
    const others = new Set(friends.map((f) => f.friend)).size - 1;
    out.push({ text: `${top.friend} gave it ${top.score.toFixed(1)}${others > 0 ? ` (+${others} more ${others === 1 ? 'friend' : 'friends'})` : ''}`, strength: 0.8 + (top.score - 8) / 4 });
  }

  // Who they travel with.
  const parts = fitParts(profile, place);
  if (parts.company != null && parts.company > 0.8) {
    const main = Object.entries(profile.companions).sort((x, y) => (y[1] ?? 0) - (x[1] ?? 0))[0]?.[0] as Companions | undefined;
    const phrase = { solo: 'Good on your own, like most of your trips', partner: 'Good for couples, like most of your trips', friends: 'Good with friends, like most of your trips', family: 'Good for families, like most of your trips' };
    if (main) out.push({ text: phrase[main], strength: 0.6 });
  }

  return out
    .sort((x, y) => y.strength - x.strength)
    .slice(0, 3)
    .map((r) => r.text);
}

// ---------------------------------------------------------------------------
// 4. Stays and places to eat
// ---------------------------------------------------------------------------

/**
 * A stay's % match: the kind of stay you rate well, a price like you usually pay,
 * and the friend's score if one stayed. Neutral (70%) for anything we can't tell.
 */
export function stayMatch(profile: Profile, stay: { type: string; priceFrom: number | null; friendScore: number | null }): number {
  const parts: [number, number][] = [];
  const pref = profile.stayTypes[stay.type];
  // The kind of stay: what you've rated before, or neutral if you haven't rated one yet.
  parts.push([pref != null ? 0.5 : 0.3, pref != null ? 0.5 + 0.5 * Math.tanh(pref) : 0.5]);
  if (profile.price != null && stay.priceFrom != null) {
    // Pricier than you usually go for counts against it; cheaper only a little.
    const r = Math.log(stay.priceFrom / profile.price);
    parts.push([0.3, r > 0 ? Math.exp(-((r / 0.6) ** 2)) : Math.max(0.75, Math.exp(-((r / 1.2) ** 2)))]);
  }
  if (stay.friendScore != null) parts.push([0.3, clamp(0.1 + (0.85 * (stay.friendScore - 6.5)) / 3, 0, 1)]);
  if (pref == null && profile.price == null && stay.friendScore == null) return 70;
  const w = parts.reduce((a, [pw]) => a + pw, 0);
  const fit = parts.reduce((a, [pw, v]) => a + pw * v, 0) / w;
  return matchPercent(0.5 + (fit - 0.5) * Math.max(0.4, profile.confidence));
}

/** A place to eat's % match: how much you go for food-led trips, and the friend's score. */
export function eatMatch(profile: Profile, eat: { friendScore: number | null }): number {
  const food = profile.tags.food ?? 0;
  const foodFit = 0.5 + 0.5 * Math.tanh(food);
  const friendFit = eat.friendScore != null ? clamp((eat.friendScore - 6) / 4, 0, 1) : 0.5;
  const fit = 0.5 * foodFit + 0.5 * friendFit;
  return matchPercent(0.5 + (fit - 0.5) * Math.max(0.4, profile.confidence));
}

/** The holiday types they like most (for "Your taste" on You). */
export function topTastes(profile: Profile, n = 4): string[] {
  return Object.entries(profile.tags)
    .filter(([, v]) => v > 0.15)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([t]) => t);
}

/**
 * How to order places "for you": by your score, exactly (owner, Nov 2026: one number; the order used to mix in a hidden
 * % match, so a 9.4 could sit above a 9.5). Fit now moves the score itself, so a famous place you'd only half enjoy
 * already scores lower. Unrounded, so two places showing 9.4 still come in the right order.
 */
export function rankValue(r: { score: number; raw?: number }): number {
  return r.raw ?? r.score;
}

/**
 * The best n, without near-duplicates (owner, Nov 2026: someone with two interests should see both, not eight of the
 * same): each pick is the highest value left, minus a little for being very like a place already picked. `alike` is
 * 0–1 (e.g. likeness()); `spread` is how many points full alikeness costs.
 */
export function diversify<T>(items: T[], n: number, value: (x: T) => number, alike: (a: T, b: T) => number, spread = 0.3): T[] {
  const pool = [...items].sort((a, b) => value(b) - value(a)).slice(0, Math.max(n * 4, n));
  const picked: T[] = [];
  while (picked.length < n && pool.length) {
    let best = 0;
    let bestValue = -Infinity;
    pool.forEach((x, i) => {
      const v = value(x) - spread * Math.max(0, ...picked.map((p) => alike(x, p)));
      if (v > bestValue) {
        bestValue = v;
        best = i;
      }
    });
    picked.push(pool.splice(best, 1)[0]);
  }
  return picked;
}

/**
 * % match for a single thing to eat, drink, do or stay at ("Made for your taste"), from
 * the thing itself: how much you go for that kind of thing (e.g. food for cafés, culture
 * for a museum) and what friends made of it (a friend's score, or just a recommendation).
 */
export function itemMatch(profile: Profile, item: { tasteTag: string | null; friendScore: number | null; friendRecommended: boolean }): number {
  const parts: [number, number][] = [];
  // How much this kind of thing stands out among your interests (your top interest = 1).
  const top = Math.max(0, ...Object.values(profile.tags));
  if (item.tasteTag && top > 0) parts.push([0.5, 0.25 + 0.7 * clamp((profile.tags[item.tasteTag] ?? 0) / top, 0, 1)]);
  // What friends made of it: their score, a recommendation, or a little below neutral if none of them has been.
  const friend =
    item.friendScore != null ? clamp(0.1 + (0.85 * (item.friendScore - 6.5)) / 3, 0, 1) : item.friendRecommended ? 0.6 : 0.4;
  parts.push([0.5, friend]);
  const w = parts.reduce((a, [pw]) => a + pw, 0);
  const fit = parts.reduce((a, [pw, v]) => a + pw * v, 0) / w;
  return matchPercent(0.5 + (fit - 0.5) * Math.max(0.4, profile.confidence));
}

// ---------------------------------------------------------------------------
// Scores out of 10 for single things (the app shows only scores, no % match)
// ---------------------------------------------------------------------------

/** How much a kind of thing stands out among your interests (your top interest = 0.95), or null. */
function interestFor(profile: Profile, tag: string | null): number | null {
  const top = Math.max(0, ...Object.values(profile.tags));
  if (!tag || top <= 0) return null;
  return 0.25 + 0.5 * clamp((profile.tags[tag] ?? 0) / top, 0, 1); // 0.25 (not your thing) – 0.75 (your top interest)
}

/** How far taste moves a single thing's score: gentle, about ±0.6 at most. A friend's score leads. */
const ITEM_SWING = 2.4;

/** A base nudged by fit, gentler while we know little. */
function nudge(base: number, fit: number | null, profile: Profile): number {
  const f = fit == null ? 0.5 : 0.5 + (fit - 0.5) * Math.max(0.4, profile.confidence);
  return round1(clamp(base + ITEM_SWING * (f - 0.5), 1, 10));
}

/**
 * Your score out of 10 for a restaurant, café, drink or thing to do: the friend's score
 * (or a starting point: 7.6 if a friend recommends it, 7.2 if none has been), nudged by
 * how much you go for that kind of thing.
 */
export function itemScore(profile: Profile, item: { tasteTag: string | null; friendScore: number | null; friendRecommended: boolean }): number {
  const base = item.friendScore ?? (item.friendRecommended ? 7.6 : 7.2);
  return nudge(base, interestFor(profile, item.tasteTag), profile);
}

/** A stay to score: its name (for the brand and class), kind, price a night and a friend's score. */
export type StayInput = {
  name?: string;
  /** The kind you can pick on a trip (Hotel, Airbnb, Villa, B&B, Other). */
  type: string;
  /** The place page's own word for it ("Apartment", "Riad"), when it says more than `type`. */
  label?: string;
  priceFrom: number | null;
  friendScore: number | null;
  /** In a city (a city hotel, not a resort). */
  city?: boolean;
};

/** How far hotel taste moves a stay's score once we know it: up to about ±1.6. */
const STAY_SWING = 3.2;

/**
 * Your score out of 10 for a stay, and the main reason: the friend's score (or 7.6), moved by your hotel taste (owner,
 * Nov 2026: "I love Ikos, Four Seasons, luxury but not too expensive"): a brand you love or one like it, the class and
 * styles you go for and your budget a night (lib/hotels.ts), plus the kind of stay you rate well. Without a budget, a
 * price like you usually pay is a small plus and pricier counts against it.
 */
export function stayVerdict(profile: Profile, stay: StayInput): { score: number; reason: string | null; against: boolean } {
  const parts: [number, number][] = [];
  const pref = profile.stayTypes[stay.type];
  if (pref != null) parts.push([0.6, 0.5 + 0.25 * Math.tanh(pref)]); // a kind of stay you rate well: up to +; badly: up to −
  const hotels = profile.hotels ?? EMPTY_HOTEL_TASTE;
  const h = stay.name ? hotelFit(hotels, { name: stay.name, type: stay.label ?? stay.type, priceFrom: stay.priceFrom, city: stay.city }) : null;
  if (!hotels.band && profile.price != null && stay.priceFrom != null) {
    // Your usual price is a small plus; pricier counts against it; cheaper is roughly neutral.
    const r = Math.log(stay.priceFrom / profile.price);
    parts.push([0.4, r > 0 ? 0.25 + 0.4 * Math.exp(-((r / 0.6) ** 2)) : 0.5 + 0.15 * Math.exp(-((r / 0.6) ** 2))]);
  }
  if (h?.fit != null) parts.push([h.weight, h.fit]);
  const w = parts.reduce((a, [pw]) => a + pw, 0);
  const base = stay.friendScore ?? 7.6;
  if (!w) return { score: round1(base), reason: null, against: false };
  const fit = parts.reduce((a, [pw, v]) => a + pw * v, 0) / w;
  if (h?.fit == null) return { score: nudge(base, fit, profile), reason: null, against: false };
  // Hotel taste you've told us (or shown us) is trusted more than a guess from your places.
  const conf = Math.max(0.4, profile.confidence, hotels.told ? 0.9 : Math.min(0.8, 0.5 * hotels.evidence));
  const shift = STAY_SWING * (0.5 + (fit - 0.5) * conf - 0.5);
  // Going up, the less room is left the less it moves (a friend's 9.5 doesn't become 10); going down, the full amount.
  const score = shift > 0 ? Math.min(9.9, base + shift * clamp((10 - base) / 2.4, 0, 1)) : base + shift;
  return { score: round1(clamp(score, 1, 10)), reason: h.reason, against: h.against };
}

/** Your score out of 10 for a stay (see stayVerdict). */
export function stayScore(profile: Profile, stay: StayInput): number {
  return stayVerdict(profile, stay).score;
}
