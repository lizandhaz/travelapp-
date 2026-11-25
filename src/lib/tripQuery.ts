/**
 * Explore's search: understands the way people describe a holiday ("beach in February",
 * "romantic weekend", "ski", "Greece", "no flying", "cheap city break") and ranks places
 * against it, with the reasons it found ("27° in February", "Good for couples").
 *
 * Pure (no app imports), so it's tested in tests/tripQuery.test.mjs. explore.ts turns the
 * sample places into SearchablePlace; real places plug in the same way in plan Step E.
 */

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export type Who = 'couples' | 'families' | 'friends' | 'solo';

export type TripQuery = {
  /** Months asked about (0 = January), e.g. "February", "summer", "Christmas". */
  months: number[];
  /** "warm", "sun", "winter sun"… */
  warm: boolean;
  /** Holiday types, in the matching engine's terms (beach, ski, city…), each with a label. */
  tags: { tag: string; label: string }[];
  who: Who[];
  /** "weekend", "short break", "one night". */
  short: boolean;
  /** "no flying", "train", "UK". */
  noFly: boolean;
  budget: 'value' | 'luxury' | null;
  /** "under £200", "up to £150 a night": the most a stay may cost a night (£). */
  maxPrice: number | null;
  /** Words left over: place names, countries, regions ("greece", "lisbon"). */
  words: string[];
};

export type SearchablePlace = {
  slug: string;
  name: string;
  /** Region and country words, e.g. "Crete Greece". */
  where: string;
  tags: Record<string, number>;
  /** Average daytime highs Jan–Dec (°C). */
  temps: number[] | null;
  bestMonths: number[];
  goodFor: string[];
  /** Cheapest stay a night (£). */
  priceFrom: number | null;
  /** Reachable without flying from the UK. */
  noFly: boolean;
  /** Friends' / base rating out of 10, to break ties. */
  rating: number | null;
};

/** fit: the share of what was asked that it has (0–1); strength breaks ties (how strongly it has it). */
export type QueryResult = {
  slug: string;
  fit: number;
  strength: number;
  reasons: string[];
};

const plain = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9£]+/g, ' ')
    .trim();

const MONTH_WORDS: Record<string, number[]> = {};
MONTH_NAMES.forEach((m, i) => {
  MONTH_WORDS[m.toLowerCase()] = [i];
  if (m !== 'May') MONTH_WORDS[m.slice(0, 3).toLowerCase()] = [i];
});
MONTH_WORDS.sept = [8];
// Several words long first, so "half term" wins over "term".
const PHRASES: [RegExp, (q: TripQuery) => void][] = [
  [/\bwinter sun\b/, (q) => ((q.warm = true), (q.months = add(q.months, [10, 11, 0, 1, 2])))],
  [/\b(no|without|not) (fly|flying|flights?|plane)\b|\bby (train|car|ferry|eurostar)\b|\bstaycation\b|\bclose to home\b/, (q) => (q.noFly = true)],
  [/\bhalf term\b/, (q) => (q.months = add(q.months, [1, 4, 9]))],
  [/\b(summer holidays?|school holidays?)\b/, (q) => (q.months = add(q.months, [6, 7]))],
  [/\bnew year\b/, (q) => (q.months = add(q.months, [11, 0]))],
  [/\bone night\b|\bovernight\b/, (q) => (q.short = true)],
  [/\bcity breaks?\b/, (q) => ((q.short = true), addTag(q, 'city', 'City'))],
  [/\btheme parks?\b/, (q) => addTag(q, 'themeparks', 'Theme parks')],
  [/\bfive star\b|\b5 star\b/, (q) => (q.budget = 'luxury')],
  [/\bgood value\b/, (q) => (q.budget = 'value')],
];

const WORDS: Record<string, (q: TripQuery) => void> = {};
const on = (words: string, fn: (q: TripQuery) => void) => words.split(' ').forEach((w) => (WORDS[w] = fn));
on('summer', (q) => (q.months = add(q.months, [5, 6, 7])));
on('winter', (q) => (q.months = add(q.months, [11, 0, 1])));
on('spring', (q) => (q.months = add(q.months, [2, 3, 4])));
on('autumn fall', (q) => (q.months = add(q.months, [8, 9, 10])));
on('christmas xmas festive', (q) => (q.months = add(q.months, [11])));
on('easter', (q) => (q.months = add(q.months, [3])));
on('warm hot sun sunny sunshine heat tropical', (q) => (q.warm = true));
on('beach beaches seaside sand', (q) => addTag(q, 'beach', 'Beach'));
on('island islands', (q) => addTag(q, 'island', 'Islands'));
on('coast coastal sea', (q) => addTag(q, 'coast', 'Coast'));
on('ski skiing snow slopes snowboard snowboarding apres', (q) => addTag(q, 'ski', 'Ski'));
on('city cities urban', (q) => addTag(q, 'city', 'City'));
on('culture museum museums art galleries gallery', (q) => addTag(q, 'culture', 'Culture'));
on('history historic castle castles ruins', (q) => addTag(q, 'history', 'History'));
on('food foodie eat eating restaurants restaurant wine', (q) => addTag(q, 'food', 'Food'));
on('hike hikes hiking walk walks walking trek trekking outdoors nature', (q) => addTag(q, 'hiking', 'Walking'));
on('lake lakes', (q) => addTag(q, 'lakes', 'Lakes'));
on('mountain mountains alps', (q) => addTag(q, 'mountains', 'Mountains'));
on('safari wildlife animals', (q) => addTag(q, 'wildlife', 'Wildlife'));
on('spa wellness relax relaxing retreat', (q) => addTag(q, 'wellness', 'Spa and slow'));
on('slow quiet peaceful chilled', (q) => addTag(q, 'slow', 'Slow'));
on('party nightlife clubs clubbing', (q) => addTag(q, 'nightlife', 'Nightlife'));
on('countryside cottage cottages rural', (q) => addTag(q, 'countryside', 'Countryside'));
on('disney', (q) => addTag(q, 'themeparks', 'Theme parks'));
on('romantic romance couple couples honeymoon anniversary babymoon', (q) => addWho(q, 'couples'));
on('family families kids kid children toddlers', (q) => addWho(q, 'families'));
on('friends group girls lads hen stag', (q) => addWho(q, 'friends'));
on('solo alone myself', (q) => addWho(q, 'solo'));
on('weekend weekender short quick', (q) => (q.short = true));
on('train eurostar uk britain england staycation', (q) => (q.noFly = true));
on('cheap budget affordable value', (q) => (q.budget = 'value'));
on('luxury luxurious splurge fancy treat', (q) => (q.budget = 'luxury'));

// Words that carry no meaning on their own.
const STOP = new Set(
  'a an and the in on at to for of with by from somewhere place places trip trips holiday holidays break breaks go going away get getaway idea ideas best good great nice lovely perfect really very some any where what want looking like near this next year time days day week weeks month our my me us we i is it that'.split(
    ' ',
  ),
);

function add(a: number[], b: number[]) {
  return [...new Set([...a, ...b])];
}
function addTag(q: TripQuery, tag: string, label: string) {
  if (!q.tags.some((t) => t.tag === tag)) q.tags.push({ tag, label });
}
function addWho(q: TripQuery, who: Who) {
  if (!q.who.includes(who)) q.who.push(who);
}

export function parseTripQuery(text: string): TripQuery {
  const q: TripQuery = {
    months: [],
    warm: false,
    tags: [],
    who: [],
    short: false,
    noFly: false,
    budget: null,
    maxPrice: null,
    words: [],
  };
  let s = ` ${plain(text)} `;
  // A nightly budget: "under £200", "below 150", "up to £300 a night", "max £120".
  const price = s.match(/\b(?:under|below|less than|up to|max|maximum)\s*£?\s*(\d{2,4})\b(?:\s*(?:a|per)\s*night)?/);
  if (price) {
    q.maxPrice = Number(price[1]);
    s = s.replace(price[0], ' ');
  }
  for (const [re, fn] of PHRASES) {
    if (re.test(s)) {
      fn(q);
      s = s.replace(new RegExp(re.source, 'g'), ' ');
    }
  }
  for (const w of s.split(/\s+/).filter(Boolean)) {
    if (MONTH_WORDS[w]) q.months = add(q.months, MONTH_WORDS[w]);
    else if (WORDS[w]) WORDS[w](q);
    else if (w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)) q.words.push(w.replace(/s$/, ''));
  }
  return q;
}

/** True when the search asked for anything at all. */
export function hasCriteria(q: TripQuery) {
  return q.months.length > 0 || q.warm || q.tags.length > 0 || q.who.length > 0 || q.short || q.noFly || q.budget !== null || q.maxPrice !== null || q.words.length > 0;
}

/** What we understood, for the line above the results: "Beach · Warm · February · Couples". */
export function describeQuery(q: TripQuery): string[] {
  const out: string[] = [];
  if (q.warm) out.push('Warm');
  out.push(...q.tags.map((t) => t.label));
  if (q.months.length) out.push(monthsLabel(q.months));
  out.push(...q.who.map((w) => w[0].toUpperCase() + w.slice(1)));
  if (q.short) out.push('Short break');
  if (q.noFly) out.push('No flying');
  if (q.budget) out.push(q.budget === 'value' ? 'Good value' : 'Luxury');
  if (q.maxPrice) out.push(`Under £${q.maxPrice} a night`);
  out.push(...q.words.map((w) => `“${w}”`));
  return out;
}

function monthsLabel(months: number[]) {
  const sorted = [...months].sort((a, b) => a - b);
  return sorted.length <= 3 ? sorted.map((m) => MONTH_NAMES[m]).join(', ') : `${sorted.length} months`;
}

const WHO_LABEL: Record<Who, string> = {
  couples: 'Good for couples',
  families: 'Good for families',
  friends: 'Good with friends',
  solo: 'Good solo',
};

/**
 * How well one place fits the search, 0–1 (the share of what was asked that it has), with
 * reasons. Null when it shares nothing with the search. `thisMonth` is used for "warm" when no
 * month was given.
 */
export function placeForQuery(q: TripQuery, p: SearchablePlace, thisMonth: number): QueryResult | null {
  let asked = 0;
  let got = 0;
  let strength = 0;
  const reasons: string[] = [];
  const hit = (ok: boolean, why?: string, weight = 1) => {
    asked += weight;
    if (ok) {
      got += weight;
      if (why) reasons.push(why);
    }
    return ok;
  };

  // Place names and countries count double: "Greece" should only show Greek places.
  if (q.words.length) {
    const hay = ` ${plain(`${p.name} ${p.where} ${p.slug}`)} `;
    const found = q.words.filter((w) => hay.includes(` ${w}`));
    if (!found.length) return null;
    hit(true, undefined, 2 * found.length);
    asked += 2 * (q.words.length - found.length);
  }

  // Months: warm then (if asked), else one of its best months.
  const months = q.months.length ? q.months : q.warm ? [thisMonth] : [];
  if (months.length) {
    const warmest = p.temps ? months.reduce((b, m) => ((p.temps![m] ?? 0) > (p.temps![b] ?? 0) ? m : b), months[0]) : null;
    if (q.warm) {
      const t = warmest != null && p.temps ? p.temps[warmest] : null;
      hit(t != null && t >= 24, t != null ? `${t}° in ${MONTH_NAMES[warmest!]}` : undefined, 1.5);
    }
    if (q.months.length) {
      const best = months.find((m) => p.bestMonths.includes(m));
      // In ski season, a ski place's own best months stand in for the weather.
      hit(best != null, best != null ? `At its best in ${MONTH_NAMES[best]}` : undefined, 1.5);
    }
  }

  for (const t of q.tags) {
    const v = p.tags[t.tag] ?? 0;
    if (hit(v >= 0.5, t.label, 1.5)) strength += v;
  }
  for (const w of q.who) {
    // A family place (theme parks, safari) suits families even more than one that's merely good for them.
    if (hit(p.goodFor.map((g) => g.toLowerCase()).includes(w) || (w === 'families' && (p.tags.family ?? 0) >= 0.5), WHO_LABEL[w]))
      strength += w === 'families' ? (p.tags.family ?? 0) : 0;
  }
  if (q.short) hit((p.tags.shortbreak ?? 0) >= 0.5 || p.noFly, 'Easy for a short break');
  if (q.noFly) hit(p.noFly, 'No flight needed');
  if (q.budget === 'value') hit(p.priceFrom != null && p.priceFrom <= 150, p.priceFrom != null ? `From £${p.priceFrom} a night` : undefined);
  if (q.maxPrice) hit(p.priceFrom != null && p.priceFrom <= q.maxPrice, p.priceFrom != null ? `Stays from £${p.priceFrom} a night` : undefined);
  if (q.budget === 'luxury') hit((p.tags.luxury ?? 0) >= 0.5 || (p.priceFrom ?? 0) >= 300, 'A real treat');

  if (!asked || !got) return null;
  return { slug: p.slug, fit: got / asked, strength, reasons };
}

/** Places for a search, best first: those with more than half of what was asked, by fit, then strength, then rating. */
export function searchPlaces(q: TripQuery, all: SearchablePlace[], thisMonth: number): QueryResult[] {
  const rating = new Map(all.map((p) => [p.slug, p.rating ?? 0]));
  return all
    .map((p) => placeForQuery(q, p, thisMonth))
    .filter((r): r is QueryResult => !!r && r.fit > 0.5)
    .sort((a, b) => b.fit - a.fit || b.strength - a.strength || (rating.get(b.slug) ?? 0) - (rating.get(a.slug) ?? 0));
}
