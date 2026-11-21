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
 *  3. Fit (0–1) compares the profile with a place on four things: the same kind of
 *     holiday, near places they loved, the right warmth, and the right company.
 *     With little to go on, fit stays near neutral and sharpens as signals add up.
 *  4. Score = the place's base rating (blended with friends' ratings, friends who
 *     agree with you counting more), nudged up or down by fit.
 */

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
    }
  /** A place on a list: Want to go (wish) or one of your own lists. savedAt is an ISO date. */
  | { kind: 'save'; place: PlaceFeatures; wish: boolean; savedAt?: string | null }
  /** A place page you've looked at: how many times, for how long in total, and when last. */
  | { kind: 'view'; place: PlaceFeatures; views: number; seconds: number; lastViewed: string }
  /** A hint with no place, e.g. a list called "Ski trips" (holiday types only). */
  | { kind: 'interest'; tags: Tags; label: string };

/** A friend's rating of a place (or of a stay at a place). */
export type FriendRating = { friend: string; placeKey: string; score: number };

export type Anchor = {
  name: string;
  kind: 'trip' | 'wish' | 'list' | 'view';
  weight: number;
  score?: number;
  place: PlaceFeatures;
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
  /** How much each friend's ratings count (friends who agree with you count more). */
  friendWeights: Record<string, number>;
  counts: { trips: number; wish: number; lists: number; views: number };
};

export type PlaceResult = {
  /** Out of 10, one decimal. */
  score: number;
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
export function buildProfile(signals: Signal[], friendRatings: FriendRating[] = [], now = new Date()): Profile {
  const halves = { enjoyed: emptyHalf(), next: emptyHalf() };
  const stayTypes: Record<string, number> = {};
  const companionCount: Partial<Record<Companions, number>> = {};
  const been: Record<string, number> = {};
  const saved: Record<string, 'wish' | 'list'> = {};
  const viewed: Record<string, { views: number; seconds: number; weight: number }> = {};
  let priceSum = 0;
  let priceW = 0;
  const counts = { trips: 0, wish: 0, lists: 0, views: 0 };
  const goodForSum: Record<string, number> = {};
  let goodForW = 0;

  for (const s of signals) {
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
      // Several trips to one place: keep the best score as "yours".
      been[s.place.key] = Math.max(been[s.place.key] ?? 0, s.score);
      if (s.companions) companionCount[s.companions] = (companionCount[s.companions] ?? 0) + 1;
      if (s.stay) stayTypes[s.stay.type] = (stayTypes[s.stay.type] ?? 0) + clamp((s.stay.score - 6.5) / 3, -1, 1);
      halves.enjoyed.anchors.push({ name: s.place.name, kind: 'trip', weight: w, score: s.score, place: s.place });
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
    if (w > 0 && s.place.warmth != null) {
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

  // Friends who rate shared places like you do count for more (0.4–2×).
  const friendWeights: Record<string, number> = {};
  const byFriend = new Map<string, FriendRating[]>();
  for (const r of friendRatings) byFriend.set(r.friend, [...(byFriend.get(r.friend) ?? []), r]);
  for (const [friend, list] of byFriend) {
    const shared = list.filter((r) => been[r.placeKey] != null);
    if (!shared.length) {
      friendWeights[friend] = 1;
      continue;
    }
    const meanGap = shared.reduce((a, r) => a + Math.abs(r.score - been[r.placeKey]), 0) / shared.length;
    const trust = Math.min(1, shared.length / 3); // one shared place says less than three
    friendWeights[friend] = clamp(1 + trust * (1 - meanGap / 1.5), 0.4, 2);
  }

  const nextGoodFor: Record<string, number> = {};
  for (const [g, v] of Object.entries(goodForSum)) nextGoodFor[g] = v / goodForW;

  const evidence = enjoyed.evidence + next.evidence;
  return {
    enjoyed,
    next,
    tags,
    anchors: [...enjoyed.anchors, ...next.anchors],
    warmth: warmths.length ? warmths.reduce((a, b) => a + b, 0) / warmths.length : null,
    companions,
    nextGoodFor,
    stayTypes,
    price: priceW > 0 ? priceSum / priceW : null,
    evidence,
    confidence: 1 - Math.exp(-evidence / 1.5), // ~50% after one loved trip, ~85% after three
    been,
    saved,
    viewed,
    friendWeights,
    counts,
  };
}

// ---------------------------------------------------------------------------
// 2. Fit
// ---------------------------------------------------------------------------

const COMPANY_TO_GOOD_FOR: Record<Companions, string> = { solo: 'solo', partner: 'couples', friends: 'friends', family: 'families' };
const PART_WEIGHTS = { kind: 0.45, near: 0.2, warmth: 0.2, company: 0.15 };

/** How much "want next" counts against "enjoyed" when both are known: an equal say. */
export const NEXT_SHARE = 0.5;

/** Blends the two halves' answers: equal say when both know something, else whichever does. */
function blend(enjoyed: number | null, next: number | null): number | null {
  if (enjoyed == null) return next;
  if (next == null) return enjoyed;
  return (1 - NEXT_SHARE) * enjoyed + NEXT_SHARE * next;
}

/** Same kind of holiday, for one half: overlap with likes, minus overlap with dislikes. */
function kindFit(tags: Tags, place: PlaceFeatures): number | null {
  const likes: Tags = {};
  const dislikes: Tags = {};
  for (const [t, v] of Object.entries(tags)) {
    if (v > 0) likes[t] = v;
    else if (v < 0) dislikes[t] = -v;
  }
  if (!Object.keys(likes).length && !Object.keys(dislikes).length) return null;
  if (!Object.keys(place.tags).length) return null;
  return clamp(0.2 + 0.8 * tagSimilarity(likes, place.tags) - 0.6 * tagSimilarity(dislikes, place.tags), 0, 1);
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
  return total > 0 ? clamp(0.3 + 0.7 * (pull / total), 0, 1) : null;
}

/** The four parts of fit, each 0–1 (or null when we can't tell). */
export function fitParts(profile: Profile, place: PlaceFeatures) {
  const kind = blend(kindFit(profile.enjoyed.tags, place), kindFit(profile.next.tags, place));
  const near = blend(nearFit(profile.enjoyed.anchors, place), nearFit(profile.next.anchors, place));

  // The warmth they go for (gentle: 7 °C off is still fine).
  const warmth = profile.warmth != null && place.warmth != null ? Math.exp(-(((place.warmth - profile.warmth) / 7) ** 2)) : null;

  // Suits who they travel with (from trips) and who the places they want next suit.
  let past: number | null = null;
  const shares = Object.entries(profile.companions);
  if (shares.length && place.goodFor.length) {
    past = 0.25 + 0.75 * shares.reduce((a, [c, share]) => a + (place.goodFor.includes(COMPANY_TO_GOOD_FOR[c as Companions]) ? (share ?? 0) : 0), 0);
  }
  let ahead: number | null = null;
  const wanted = Object.entries(profile.nextGoodFor);
  if (wanted.length && place.goodFor.length) {
    ahead = 0.25 + 0.75 * wanted.reduce((a, [g, share]) => a + (place.goodFor.includes(g) ? share : 0), 0);
  }
  const company = blend(past, ahead);

  return { kind, near, warmth, company };
}

/** Overall fit, 0–1, pulled towards a neutral 0.5 when we don't know much yet. */
export function fitFor(profile: Profile, place: PlaceFeatures): number {
  const parts = fitParts(profile, place);
  let sum = 0;
  let w = 0;
  for (const [name, value] of Object.entries(parts)) {
    if (value == null) continue;
    const pw = PART_WEIGHTS[name as keyof typeof PART_WEIGHTS];
    sum += pw * value;
    w += pw;
  }
  const raw = w ? sum / w : 0.5;
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
  const PRIOR = 2; // the place's own rating counts like two friends
  let sum = 0;
  let w = 0;
  if (place.baseScore != null) {
    sum += PRIOR * place.baseScore;
    w += PRIOR;
  }
  for (const r of mine) {
    const fw = profile.friendWeights[r.friend] ?? 1;
    sum += fw * r.score;
    w += fw;
  }
  const base = w ? sum / w : 7;
  const baseFrom: PlaceResult['breakdown']['baseFrom'] =
    mine.length && place.baseScore != null ? 'friends and everyone' : mine.length ? 'friends' : place.baseScore != null ? 'everyone' : 'nobody yet';
  return { base, baseFrom, friends: mine };
}

/** How far fit moves the score: up to ±1.5 points. */
const TASTE_SWING = 3;

export function scorePlace(profile: Profile, place: PlaceFeatures, friendRatings: FriendRating[]): PlaceResult {
  const fit = fitFor(profile, place);
  const { base, baseFrom, friends } = baseRating(profile, place, friendRatings);
  const tasteNudge = TASTE_SWING * (fit - 0.5);
  const yours = profile.been[place.key] ?? null;
  const parts = fitParts(profile, place);
  const labels: Record<string, string> = { kind: 'The kind of holiday you love', near: 'Near places you loved', warmth: 'The warmth you go for', company: 'Suits who you travel with' };
  return {
    score: yours ?? round1(clamp(base + tasteNudge, 1, 10)),
    match: matchPercent(fit),
    fit,
    yours,
    reasons: reasonsFor(profile, place, friends),
    breakdown: {
      base: round1(base),
      baseFrom,
      friendsCount: new Set(friends.map((f) => f.friend)).size,
      tasteNudge: round1(tasteNudge),
      parts: Object.entries(parts)
        .filter(([, v]) => v != null)
        .map(([k, v]) => ({ label: labels[k], value: v as number })),
    },
  };
}

/** Up to three short reasons, most telling first. */
export function reasonsFor(profile: Profile, place: PlaceFeatures, friends: FriendRating[]): string[] {
  const out: { text: string; strength: number }[] = [];
  if (profile.been[place.key] != null) out.push({ text: `You gave it ${profile.been[place.key].toFixed(1)}`, strength: 10 });

  // The place in their history most like this one.
  let best: { a: Anchor; sim: number } | null = null;
  for (const a of profile.anchors) {
    if (a.weight <= 0 || a.place.key === place.key) continue;
    const kind = tagSimilarity(a.place.tags, place.tags);
    if (kind < 0.25) continue; // "Like X" only when it's the same kind of holiday, not just nearby
    const near = a.place.pos && place.pos ? Math.exp(-distanceKm(a.place.pos, place.pos) / 1200) : 0;
    const sim = (0.7 * kind + 0.3 * near) * a.weight;
    if (!best || sim > best.sim) best = { a, sim };
  }
  if (best && best.sim > 0.18) {
    const { a } = best;
    const text =
      a.kind === 'trip'
        ? `Like ${a.name}, which you gave ${a.score!.toFixed(1)}`
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
  if (pref != null) parts.push([0.5, 0.5 + 0.5 * Math.tanh(pref)]);
  if (profile.price != null && stay.priceFrom != null) parts.push([0.3, Math.exp(-((Math.log(stay.priceFrom / profile.price) / 0.6) ** 2))]);
  if (stay.friendScore != null) parts.push([0.2, clamp((stay.friendScore - 6) / 4, 0, 1)]);
  if (!parts.length) return 70;
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
 * How to order places "for you": mostly your score, with fit as a strong tie-breaker,
 * so a famous place you'd only half enjoy doesn't beat a great fit.
 */
export function rankValue(r: { score: number; match: number }): number {
  return 0.6 * r.score + 0.04 * r.match;
}
