/**
 * Hotels in COVA's terms (owner, Nov 2026: "I love Ikos resorts, Four Seasons etc, something that's luxury but not too
 * expensive"). Each hotel gets a brand (when it has one), a class from 1 (simple) to 5 (ultra-luxury) and a few styles
 * (all-inclusive, beach resort, grand old hotel…). A person's hotel taste comes from the hotels they've rated and saved,
 * plus what they tell us on the "Hotels you love" page (brands, styles and a budget a night). hotelFit() then says how
 * well one hotel suits them and why ("Ikos, a brand you love", "Luxury within your budget").
 * Pure functions, no app imports (tested in tests/hotels.test.mjs).
 */

export type HotelStyle = 'allinclusive' | 'resort' | 'family' | 'design' | 'heritage' | 'wellness' | 'boutique' | 'villas' | 'city';

export const STYLE_LABEL: Record<HotelStyle, string> = {
  allinclusive: 'All-inclusive',
  resort: 'Beach & pool resorts',
  villas: 'Villas & private pools',
  family: 'Great with kids',
  heritage: 'Grand old hotels',
  design: 'Design hotels',
  boutique: 'Small & boutique',
  wellness: 'Spa & wellness',
  city: 'City hotels',
};

/** The class words, 1–5. */
export const TIER_LABEL = ['', 'Simple', 'Comfortable', 'Upscale', 'Luxury', 'Ultra-luxury'];

export type Brand = { id: string; name: string; tier: number; styles: HotelStyle[]; re: RegExp; /** Offered on the "Hotels you love" page. */ pick?: boolean };

/** Well-known brands, matched on the hotel's name (lower case, no accents). The first match wins. */
export const BRANDS: Brand[] = [
  { id: 'ikos', name: 'Ikos', tier: 4, styles: ['allinclusive', 'resort', 'family'], re: /\bikos\b/, pick: true },
  { id: 'fourseasons', name: 'Four Seasons', tier: 4, styles: ['resort', 'city', 'family'], re: /four seasons|ocean club, a four/, pick: true },
  { id: 'aman', name: 'Aman', tier: 5, styles: ['wellness', 'boutique'], re: /\baman(\b|gani|galla|jena|dari|puri|kila|yara|wana|noi|zoe)/, pick: true },
  { id: 'oneandonly', name: 'One&Only', tier: 5, styles: ['resort', 'family', 'wellness'], re: /one ?& ?only|one and only/, pick: true },
  { id: 'sixsenses', name: 'Six Senses', tier: 4, styles: ['wellness', 'villas', 'resort'], re: /six senses/, pick: true },
  { id: 'mandarin', name: 'Mandarin Oriental', tier: 4, styles: ['city', 'wellness', 'heritage'], re: /mandarin oriental/, pick: true },
  { id: 'rosewood', name: 'Rosewood', tier: 4, styles: ['city', 'resort', 'design'], re: /rosewood/, pick: true },
  { id: 'belmond', name: 'Belmond', tier: 4, styles: ['heritage', 'boutique'], re: /belmond/, pick: true },
  { id: 'ritzcarlton', name: 'Ritz-Carlton', tier: 4, styles: ['resort', 'city', 'family'], re: /ritz-carlton|ritz carlton/, pick: true },
  { id: 'stregis', name: 'St. Regis', tier: 4, styles: ['resort', 'city'], re: /st\.? regis/, pick: true },
  { id: 'jumeirah', name: 'Jumeirah', tier: 4, styles: ['resort', 'family'], re: /jumeirah/, pick: true },
  { id: 'roccoforte', name: 'Rocco Forte', tier: 4, styles: ['heritage', 'city'], re: /rocco forte|hotel de russie|verdura|villa igiea|the balmoral/, pick: true },
  { id: 'como', name: 'COMO', tier: 4, styles: ['wellness', 'boutique', 'resort'], re: /\bcomo (parrot|uma|shambhala|castello|the|metropolitan|cocoa|maalifushi|point)/, pick: true },
  { id: 'soneva', name: 'Soneva', tier: 5, styles: ['villas', 'wellness', 'resort'], re: /soneva/, pick: true },
  { id: 'domes', name: 'Domes', tier: 4, styles: ['design', 'resort'], re: /\bdomes\b/, pick: true },
  { id: 'grecotel', name: 'Grecotel', tier: 4, styles: ['resort', 'family'], re: /grecotel/, pick: true },
  { id: 'lux', name: 'LUX*', tier: 4, styles: ['resort', 'family'], re: /\blux\*/, pick: true },
  { id: 'raffles', name: 'Raffles', tier: 5, styles: ['heritage', 'city'], re: /raffles/, pick: true },
  { id: 'sohohouse', name: 'Soho House', tier: 3, styles: ['design', 'city'], re: /soho (house|farmhouse)|babington house|soho roman/, pick: true },
  { id: 'hoxton', name: 'The Hoxton', tier: 3, styles: ['design', 'city'], re: /\bhoxton\b/, pick: true },
  { id: 'chevalblanc', name: 'Cheval Blanc', tier: 5, styles: ['villas', 'design'], re: /cheval blanc/ },
  { id: 'bulgari', name: 'Bulgari', tier: 5, styles: ['design', 'city'], re: /bulgari/ },
  { id: 'peninsula', name: 'The Peninsula', tier: 5, styles: ['heritage', 'city'], re: /the peninsula/ },
  { id: 'waldorf', name: 'Waldorf Astoria', tier: 4, styles: ['resort', 'city'], re: /waldorf astoria/ },
  { id: 'conrad', name: 'Conrad', tier: 4, styles: ['resort', 'villas'], re: /\bconrad\b/ },
  { id: 'fairmont', name: 'Fairmont', tier: 4, styles: ['heritage', 'city'], re: /fairmont/ },
  { id: 'parkhyatt', name: 'Park Hyatt', tier: 4, styles: ['city', 'design'], re: /park hyatt/ },
  { id: 'oberoi', name: 'Oberoi', tier: 4, styles: ['resort', 'heritage'], re: /oberoi/ },
  { id: 'anantara', name: 'Anantara', tier: 4, styles: ['resort', 'wellness'], re: /anantara/ },
  { id: 'banyantree', name: 'Banyan Tree', tier: 4, styles: ['villas', 'wellness'], re: /banyan tree/ },
  { id: 'shangrila', name: 'Shangri-La', tier: 4, styles: ['resort', 'family'], re: /shangri-la/ },
  { id: 'kempinski', name: 'Kempinski', tier: 4, styles: ['heritage', 'resort'], re: /kempinski/ },
  { id: 'nobu', name: 'Nobu', tier: 4, styles: ['design'], re: /\bnobu hotel/ },
  { id: 'whotels', name: 'W Hotels', tier: 4, styles: ['design', 'city'], re: /^w [a-z]/ },
  { id: 'intercontinental', name: 'InterContinental', tier: 4, styles: ['city', 'resort'], re: /intercontinental/ },
  { id: 'hoshinoya', name: 'Hoshinoya', tier: 5, styles: ['boutique', 'wellness'], re: /hoshinoya/ },
  { id: 'pestana', name: 'Pestana', tier: 3, styles: ['resort', 'heritage'], re: /pestana/ },
  { id: 'lopesan', name: 'Lopesan', tier: 3, styles: ['resort', 'family'], re: /lopesan/ },
  { id: 'melia', name: 'Meliá', tier: 3, styles: ['resort', 'family'], re: /melia\b/ },
  { id: 'iberostar', name: 'Iberostar', tier: 3, styles: ['resort', 'family', 'allinclusive'], re: /iberostar/ },
  { id: 'roommate', name: 'Room Mate', tier: 2, styles: ['design', 'city'], re: /room mate/ },
  { id: '25hours', name: '25hours', tier: 3, styles: ['design', 'city'], re: /25hours/ },
  { id: 'mamashelter', name: 'Mama Shelter', tier: 2, styles: ['design', 'city'], re: /mama shelter/ },
  { id: 'acehotel', name: 'Ace Hotel', tier: 3, styles: ['design', 'city'], re: /\bace hotel/ },
  { id: 'novotel', name: 'Novotel', tier: 2, styles: ['city', 'family'], re: /novotel/ },
  { id: 'rove', name: 'Rove', tier: 2, styles: ['design', 'city'], re: /^rove\b/ },
];

/** Brands offered on the "Hotels you love" page, in that order. */
export const PICK_BRANDS = BRANDS.filter((b) => b.pick);

/**
 * Hotels without a brand that we know a bit more about than their price says (the sample places' stays and well-known
 * resorts). Class and styles only: no made-up review scores for real hotels.
 */
const KNOWN: Record<string, { tier: number; styles: HotelStyle[] }> = {
  'blue palace elounda': { tier: 4, styles: ['resort', 'villas'] },
  'daios cove': { tier: 4, styles: ['resort', 'villas', 'family'] },
  'casa delfino': { tier: 3, styles: ['boutique', 'heritage'] },
  'elounda beach hotel & villas': { tier: 4, styles: ['resort', 'villas'] },
  'minos beach art hotel': { tier: 4, styles: ['design', 'resort'] },
  'abaton island resort': { tier: 4, styles: ['resort', 'villas'] },
  'st. nicolas bay': { tier: 4, styles: ['resort', 'villas', 'family'] },
  'elounda mare hotel': { tier: 4, styles: ['resort', 'villas'] },
  'cap rocat': { tier: 5, styles: ['boutique', 'heritage'] },
  'marbella club hotel': { tier: 4, styles: ['resort', 'heritage', 'family'] },
  'puente romano beach resort': { tier: 4, styles: ['resort', 'family'] },
  'finca cortesin': { tier: 5, styles: ['resort', 'design'] },
  'bahia del duque': { tier: 4, styles: ['resort', 'family'] },
  'vila vita parc': { tier: 4, styles: ['resort', 'family'] },
  'pine cliffs': { tier: 4, styles: ['resort', 'family'] },
  'anassa': { tier: 4, styles: ['resort', 'family', 'wellness'] },
  'almyra': { tier: 3, styles: ['design', 'family', 'resort'] },
  'hotel arts barcelona': { tier: 4, styles: ['city', 'design'] },
  'le sirenuse': { tier: 5, styles: ['boutique', 'heritage'] },
  'il sereno': { tier: 5, styles: ['design', 'boutique'] },
  'borgo egnazia': { tier: 4, styles: ['resort', 'family', 'wellness'] },
  'castello di casole': { tier: 4, styles: ['heritage', 'villas'] },
  'hotel cala di volpe': { tier: 5, styles: ['resort', 'heritage'] },
  'hotel du cap-eden-roc': { tier: 5, styles: ['heritage', 'resort'] },
  'hotel negresco': { tier: 4, styles: ['heritage', 'city'] },
  'hotel grande bretagne': { tier: 4, styles: ['heritage', 'city'] },
  'hotel danieli': { tier: 4, styles: ['heritage', 'city'] },
  'reid\'s palace': { tier: 4, styles: ['heritage', 'resort'] },
  'the victoria falls hotel': { tier: 4, styles: ['heritage'] },
  'gili lankanfushi': { tier: 5, styles: ['villas', 'wellness'] },
  'joali': { tier: 5, styles: ['villas', 'design'] },
  'kuramathi island': { tier: 3, styles: ['resort', 'family'] },
  'the omnia': { tier: 4, styles: ['design', 'boutique'] },
  'hotel de paris monte-carlo': { tier: 5, styles: ['heritage', 'city'] },
  'canaves oia': { tier: 4, styles: ['boutique', 'villas'] },
  'cavo tagoo': { tier: 4, styles: ['design', 'boutique'] },
  'porto zante villas': { tier: 5, styles: ['villas'] },
  'princesa yaiza suite hotel resort': { tier: 3, styles: ['resort', 'family'] },
};

/** Lower case, no accents or curly quotes, single spaces. */
export function hotelKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function brandOf(name: string): Brand | null {
  const k = hotelKey(name);
  return BRANDS.find((b) => b.re.test(k)) ?? null;
}

/** A class from the price a night, when we know nothing else. */
function tierFromPrice(p: number): number {
  return p < 110 ? 1 : p < 190 ? 2 : p < 330 ? 3 : p < 800 ? 4 : 5;
}

export type HotelInput = { name: string; type?: string; priceFrom?: number | null; city?: boolean };
export type HotelInfo = { brand: Brand | null; tier: number | null; styles: HotelStyle[] };

/** What we can tell about one hotel: its brand, class and styles. */
export function hotelInfo({ name, type = 'Hotel', priceFrom = null, city = false }: HotelInput): HotelInfo {
  const k = hotelKey(name);
  const brand = brandOf(name);
  const known = KNOWN[k];
  const home = /airbnb|apartment/i.test(type);
  const styles = new Set<HotelStyle>(brand?.styles ?? known?.styles ?? []);
  if (!brand && !known) {
    if (/villa/i.test(type) || /\bvillas?\b/.test(k)) styles.add('villas');
    if (/b&b|riad|ryokan|inn/i.test(type) || /\b(suites|boutique|house|rooms|relais|townhouse)\b/.test(k)) styles.add('boutique');
    if (/\b(resort|beach|bay|cove|club)\b/.test(k) && !city) styles.add('resort');
    if (/\b(palace|palacio|palazzo|grand|castle|castello|schloss|chateau)\b/.test(k)) styles.add('heritage');
    if (/\b(spa|wellness|thalasso)\b/.test(k)) styles.add('wellness');
    if (city && !home) styles.add('city');
  }
  let tier = brand?.tier ?? known?.tier ?? (priceFrom != null ? tierFromPrice(priceFrom) : null);
  // Someone's flat or a B&B isn't a luxury hotel, whatever it costs.
  if (tier != null && !brand && !known && (home || /b&b/i.test(type))) tier = Math.min(tier, 3);
  return { brand, tier, styles: [...styles] };
}

// ---------------------------------------------------------------------------
// Your hotel taste
// ---------------------------------------------------------------------------

export type HotelBudget = 'value' | 'mid' | 'luxe' | 'splurge';

/** Budgets a night on the "Hotels you love" page. */
export const BUDGETS: Record<HotelBudget, { label: string; sub: string; band: [number, number]; tier: number }> = {
  value: { label: 'Good value', sub: 'Under £150 a night', band: [0, 150], tier: 2 },
  mid: { label: 'Comfortable', sub: '£150 to £300 a night', band: [150, 300], tier: 3 },
  luxe: { label: 'Luxury, sensibly priced', sub: '£300 to £600 a night', band: [300, 600], tier: 4 },
  splurge: { label: 'Money no object', sub: '£600 a night and up', band: [600, Infinity], tier: 5 },
};

/** What you told us on the "Hotels you love" page. */
export type HotelPrefs = { brands: string[]; styles: HotelStyle[]; budget: HotelBudget | null };
export const EMPTY_HOTEL_PREFS: HotelPrefs = { brands: [], styles: [], budget: null };

/** A hotel you've rated (weight −1 to +1 from your score) or saved (weight about 0.6). */
export type HotelEvent = HotelInput & { weight: number };

export type HotelTaste = {
  /** How much you like each brand (by id): about +1.5 when you say you love it. */
  brands: Record<string, number>;
  /** A rated hotel of each brand you loved, for reasons ("Like your stay at Ikos Dassia"). */
  lovedStay: Record<string, string>;
  /** Brands you picked yourself. */
  toldBrands: string[];
  /** The class you go for (1–5), or null. */
  tier: number | null;
  styles: Partial<Record<HotelStyle, number>>;
  /** Your budget a night [from, to], or null when we can't tell. */
  band: [number, number] | null;
  /** True when you've told us anything on the "Hotels you love" page. */
  told: boolean;
  /** How much we have to go on (0 = nothing). */
  evidence: number;
};

export const EMPTY_HOTEL_TASTE: HotelTaste = { brands: {}, lovedStay: {}, toldBrands: [], tier: null, styles: {}, band: null, told: false, evidence: 0 };

export function buildHotelTaste(events: HotelEvent[], prefs: HotelPrefs | null = null): HotelTaste {
  const brands: Record<string, number> = {};
  const lovedStay: Record<string, string> = {};
  const styles: Partial<Record<HotelStyle, number>> = {};
  let tierSum = 0;
  let tierW = 0;
  let logPrice = 0;
  let priceW = 0;
  let evidence = 0;
  const loved = new Map<string, number>();

  for (const e of events) {
    const info = hotelInfo(e);
    evidence += Math.abs(e.weight);
    if (info.brand) {
      brands[info.brand.id] = (brands[info.brand.id] ?? 0) + e.weight;
      if (e.weight > (loved.get(info.brand.id) ?? 0.3)) {
        loved.set(info.brand.id, e.weight);
        lovedStay[info.brand.id] = e.name;
      }
    }
    for (const s of info.styles) styles[s] = (styles[s] ?? 0) + 0.6 * e.weight;
    if (e.weight > 0 && info.tier != null) {
      tierSum += e.weight * info.tier;
      tierW += e.weight;
    }
    if (e.weight > 0 && e.priceFrom != null) {
      logPrice += e.weight * Math.log(e.priceFrom);
      priceW += e.weight;
    }
  }

  const p = prefs ?? EMPTY_HOTEL_PREFS;
  const toldBrands = p.brands.filter((id) => BRANDS.some((b) => b.id === id));
  for (const id of toldBrands) {
    const b = BRANDS.find((x) => x.id === id)!;
    brands[id] = (brands[id] ?? 0) + 1.5;
    for (const s of b.styles) styles[s] = (styles[s] ?? 0) + 0.4;
    tierSum += b.tier;
    tierW += 1;
  }
  for (const s of p.styles) styles[s] = (styles[s] ?? 0) + 1;
  const budget = p.budget ? BUDGETS[p.budget] : null;
  if (budget) {
    // Your budget says a lot about the class you go for.
    tierSum += 2 * budget.tier;
    tierW += 2;
  }
  // Without a budget, a band around what you've paid for hotels you loved.
  const usual = priceW > 0 ? Math.exp(logPrice / priceW) : null;
  const band: [number, number] | null = budget ? budget.band : usual != null ? [Math.round(usual / 1.6), Math.round(usual * 1.4)] : null;
  const told = toldBrands.length > 0 || p.styles.length > 0 || !!budget;
  return {
    brands,
    lovedStay,
    toldBrands,
    tier: tierW > 0 ? tierSum / tierW : null,
    styles,
    band,
    told,
    evidence: evidence + (told ? 2 : 0),
  };
}

const brandById = (id: string) => BRANDS.find((b) => b.id === id) ?? null;

/** How alike two sets of styles are (0–1). */
function styleOverlap(a: HotelStyle[], b: HotelStyle[]): number {
  if (!a.length || !b.length) return 0;
  const shared = a.filter((s) => b.includes(s)).length;
  return shared / new Set([...a, ...b]).size;
}

/** How a price sits against your budget: 1 inside it, falling fast above it, gently below it. */
export function budgetFit(price: number, [lo, hi]: [number, number]): number {
  if (price > hi) return Math.exp(-((Math.log(price / hi) / 0.4) ** 2));
  if (price < lo) return 0.45 + 0.4 * Math.exp(-((Math.log(lo / price) / 0.6) ** 2));
  return 1;
}

export type HotelVerdict = {
  /** 0–1 (0.5 = neutral), or null when we can't tell anything. */
  fit: number | null;
  /** How much this verdict should count next to other signals. */
  weight: number;
  /** One line on why, or null. */
  reason: string | null;
  /** The reason counts against it ("Over your usual budget"). */
  against: boolean;
};

/** How well one hotel suits your hotel taste, and the main reason why. */
export function hotelFit(t: HotelTaste, h: HotelInput): HotelVerdict {
  const info = hotelInfo(h);
  const parts: [number, number][] = [];
  const reasons: [number, string, boolean][] = [];

  // 1. Its brand: one you love (or didn't enjoy).
  const own = info.brand ? t.brands[info.brand.id] : undefined;
  if (info.brand && own != null) {
    const s = Math.tanh(own);
    parts.push([1.2, 0.5 + 0.5 * s]);
    if (s > 0.3) {
      const stay = t.lovedStay[info.brand.id];
      reasons.push([4, t.toldBrands.includes(info.brand.id) || !stay || stay === h.name ? `${info.brand.name}, a brand you love` : `Like your stay at ${stay}`, false]);
    }
  }
  // 2. Like a brand you love: the same class and much the same style ("Like Ikos, which you love").
  if (!(own != null && own > 0)) {
    let best = 0;
    let like: Brand | null = null;
    for (const [id, v] of Object.entries(t.brands)) {
      const b = brandById(id);
      if (!b || v <= 0.3 || info.tier == null) continue;
      const d = Math.abs(b.tier - info.tier);
      const sim = (d === 0 ? 1 : d === 1 ? 0.5 : 0) * styleOverlap(info.styles, b.styles) * Math.tanh(v);
      if (sim > best) {
        best = sim;
        like = b;
      }
    }
    if (like && best > 0.2) {
      parts.push([0.7, 0.5 + 0.45 * best]);
      if (best >= 0.4) reasons.push([3, `Like ${like.name}, which you love`, false]);
    } else if (Object.values(t.brands).some((v) => v > 0.3)) {
      // Not a brand you love, nor like one: fine, but those come first.
      parts.push([0.6, 0.6]);
    }
  }
  // 3. Its class against the class you go for (below it counts against more than above it).
  if (t.tier != null && info.tier != null) {
    const d = info.tier - t.tier;
    parts.push([0.9, 0.15 + 0.85 * (d >= 0 ? Math.exp(-((d / 1.2) ** 2)) : Math.exp(-((d / 0.7) ** 2)))]);
  }
  // 4. Styles you go for (all-inclusive, villas…).
  let bestStyle: HotelStyle | null = null;
  let styleV = 0;
  for (const s of info.styles) {
    const v = Math.tanh(t.styles[s] ?? 0);
    if (v > styleV) {
      styleV = v;
      bestStyle = s;
    }
  }
  if (bestStyle && styleV > 0.1) {
    parts.push([0.5, 0.5 + 0.45 * styleV]);
    if (styleV > 0.6) reasons.push([1, `${STYLE_LABEL[bestStyle]}, your kind of stay`, false]);
  }
  // 5. The price against your budget.
  if (t.band && h.priceFrom != null) {
    const v = budgetFit(h.priceFrom, t.band);
    parts.push([1, v]);
    if (v === 1) reasons.push([info.tier != null && info.tier >= 4 ? 2 : 0.5, info.tier != null && info.tier >= 4 ? 'Luxury within your budget' : 'Within your budget', false]);
    else if (h.priceFrom > t.band[1] * 1.25) reasons.push([2.5, 'Over your usual budget', true]);
  }

  const weight = parts.reduce((a, [w]) => a + w, 0);
  if (!weight) return { fit: null, weight: 0, reason: null, against: false };
  let fit = parts.reduce((a, [w, v]) => a + w * v, 0) / weight;
  // Far over your budget can't be rescued by a brand you love (owner: "luxury but not too expensive").
  if (t.band && h.priceFrom != null) {
    const v = budgetFit(h.priceFrom, t.band);
    if (v < 0.5) fit = Math.min(fit, 0.2 + 0.6 * v);
  }
  // The strongest reason that agrees with the verdict: a good fit leads with what's for it, a poor one with what's against.
  const agree = reasons.filter(([, , against]) => against === fit < 0.5);
  const top = (agree.length ? agree : reasons).sort((a, b) => b[0] - a[0])[0];
  return { fit, weight: Math.min(weight, 3), reason: top?.[1] ?? null, against: top?.[2] ?? false };
}
