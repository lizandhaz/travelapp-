import { positionOf } from './geo';
import { countryOf } from './knownPlaces';
import { placeKey, type FriendRating, type PlaceFeatures, type Tags } from './match';
import { placeDetails } from './placeDetails';
import { friendsFeed, getPlace, places as samplePlaces } from './sample';
import type { Place } from './trips';

/**
 * Describes places in the matching engine's terms (lib/match.ts): holiday types,
 * position, warmth, who it suits and a base rating.
 *  - Sample places (place pages): from their details in placeDetails.ts.
 *  - Any other place (your own trips, typed list places): from a hand-made list of
 *    popular places, clues in the name ("Lake …", "… Island") and the country.
 * Also gathers the sample friends' ratings (until real friends arrive in plan Step C).
 */

// The words on place pages ("Hiking · Coast") → holiday types.
const KICKER: Record<string, Tags> = {
  City: { city: 1 },
  'One night': { shortbreak: 1 },
  Weekend: { shortbreak: 0.8 },
  Island: { island: 1 },
  Islands: { island: 1 },
  Beach: { beach: 1 },
  Seaside: { beach: 0.8, coast: 0.6 },
  Coast: { coast: 1 },
  'Spa town': { wellness: 1, culture: 0.4 },
  Lakes: { lakes: 1 },
  Slow: { slow: 1 },
  Countryside: { countryside: 1 },
  Food: { food: 1 },
  Mountains: { mountains: 1 },
  'Old town': { culture: 0.8, history: 0.6 },
  River: { countryside: 0.3, culture: 0.3 },
  Culture: { culture: 1 },
  Safari: { wildlife: 1, family: 0.5 },
  Hiking: { hiking: 1, outdoors: 0.6 },
  'Theme parks': { themeparks: 1, family: 0.8 },
  Family: { family: 1 },
  Ski: { ski: 1, mountains: 0.6 },
  Après: { nightlife: 0.6 },
  Town: { culture: 0.5 },
  Castle: { history: 1, family: 0.4 },
  // Words on newer place pages (owner Nov 2026: these were ignored, so Courchevel had no "luxury" and Cinque Terre no walking).
  Luxury: { luxury: 1 },
  Glamour: { luxury: 0.7, nightlife: 0.5 },
  Walking: { hiking: 0.8, outdoors: 0.6 },
  Adventure: { outdoors: 1, hiking: 0.6 },
  Nature: { outdoors: 1 },
  Wildlife: { wildlife: 1 },
  Wine: { food: 0.6, countryside: 0.4 },
  Party: { nightlife: 1 },
};

// "Things to do" and "Culture" tags → holiday types (lighter: they're one thing among many).
const ACTIVITY: Record<string, Tags> = {
  History: { history: 1, culture: 0.5 },
  Spa: { wellness: 1 },
  Wellness: { wellness: 1 },
  Relax: { slow: 0.6, wellness: 0.4 },
  Snorkel: { beach: 0.6, outdoors: 0.6 },
  Views: { outdoors: 0.4 },
  Walk: { outdoors: 0.6 },
  Hike: { hiking: 1, outdoors: 0.6 },
  Outdoors: { outdoors: 1 },
  Boat: { coast: 0.6 },
  Beach: { beach: 1 },
  Gardens: { slow: 0.4 },
  Art: { culture: 1 },
  Culture: { culture: 1 },
  Theatre: { culture: 0.8 },
  Show: { culture: 0.5, nightlife: 0.4 },
  Music: { culture: 0.6, nightlife: 0.4 },
  Festival: { culture: 0.6 },
  Custom: { culture: 0.6 },
  Food: { food: 1 },
  'Food ritual': { food: 0.8 },
  Evening: { nightlife: 0.6 },
  Animals: { wildlife: 1 },
  Family: { family: 1 },
  Fun: { family: 0.5 },
  Ski: { ski: 1 },
  River: { countryside: 0.4 },
  // Tags on newer things to do (owner, Nov 2026: Krka's waterfalls were being judged as "culture").
  Nature: { outdoors: 1, hiking: 0.4 },
  Wine: { food: 0.6, countryside: 0.4 },
  Golf: { golf: 1 },
  Market: { food: 0.6, culture: 0.4 },
  'Day out': { culture: 0.4, outdoors: 0.3 },
  Hiking: { hiking: 1, outdoors: 0.6 },
};

/**
 * Holiday types for popular places that aren't sample places (so your own trips can
 * shape your taste). Short codes: b beach, i island, c city, u culture, f food,
 * l lakes, m mountains, k ski, h hiking, s slow, o coast, w wellness, n nightlife,
 * y countryside, x history, t themeparks, a family, z wildlife, r luxury.
 */
const CODES: Record<string, string> = {
  b: 'beach', i: 'island', c: 'city', u: 'culture', f: 'food', l: 'lakes', m: 'mountains', k: 'ski', h: 'hiking', s: 'slow',
  o: 'coast', w: 'wellness', n: 'nightlife', y: 'countryside', x: 'history', t: 'themeparks', a: 'family', z: 'wildlife', r: 'luxury',
};
const KNOWN_TAGS = `
venice:cuf;rome:cuxf;florence:cuf;milan:cfu;naples:cfo;amalfi coast:obfr;positano:obfr;sorrento:obf;capri:iobr;lake garda:ls;tuscany:yfs;cinque terre:ohf;sicily:ibfx;palermo:cfx;taormina:obu;sardinia:ibo;puglia:obfy;bologna:cf;verona:cu;dolomites:mhk;
lisbon:cfu;porto:cfu;algarve:bo;lagos:bo;faro:bo;albufeira:bon;comporta:bs;sintra:ux;madeira:ho;funchal:co;azores:ihz;cascais:bo;douro valley:yf;
barcelona:cbfn;madrid:cuf;seville:cux;granada:ux;malaga:cbf;marbella:bnr;valencia:cbf;mallorca:ibo;majorca:ibo;palma:cbo;ibiza:ibn;menorca:ibs;tenerife:ib;lanzarote:ib;gran canaria:ib;fuerteventura:ib;san sebastian:fbo;bilbao:cuf;
paris:cuf;nice:cbo;cannes:bor;provence:ysf;bordeaux:cf;lyon:cf;marseille:cbo;chamonix:mkh;courchevel:kmr;val thorens:kmn;biarritz:bo;normandy:yx;corsica:ibh;saint-tropez:bnr;
athens:cux;santorini:ibr;mykonos:ibn;crete:ibf;chania:obf;rhodes:ibx;corfu:ib;paros:ib;naxos:ib;zakynthos:ib;kefalonia:ib;milos:ib;
amsterdam:cun;brussels:cf;bruges:cux;berlin:cun;munich:cf;vienna:cux;salzburg:cum;innsbruck:mk;zurich:cl;geneva:cl;lucerne:lm;interlaken:mlh;prague:cux;budapest:cuw;krakow:cux;dubrovnik:oux;split:obu;hvar:ibn;copenhagen:cf;stockholm:cu;oslo:cu;reykjavik:cz;iceland:hz;dublin:cn;kotor:ox;malta:ibx;istanbul:cuf;bodrum:bo;antalya:bo;
london:cuf;bath:cuw;york:cux;oxford:cu;cambridge:cu;brighton:cbn;cornwall:bo;st ives:bo;devon:ybo;cotswolds:ys;lake district:lhy;edinburgh:cux;isle of skye:ih;highlands:mhy;
marrakech:cuf;cape town:cfz;zanzibar:ibs;mauritius:ibr;seychelles:ibr;maldives:ibr;dubai:cbr;egypt:xb;kenya:z;
new york:cuf;orlando:ta;miami:cbn;los angeles:cb;san francisco:cf;las vegas:cn;hawaii:ib;boston:cu;chicago:cf;new orleans:cfn;toronto:c;vancouver:cm;mexico city:cuf;tulum:bo;cancun:bn;barbados:ib;antigua:ib;st lucia:ib;jamaica:ib;turks and caicos:ibr;bahamas:ib;havana:cun;costa rica:zh;cusco:hx;rio de janeiro:cb;buenos aires:cf;patagonia:hm;
val d isere:kmn;val d'isere:kmn;val disere:kmn;tignes:km;meribel:kmr;les arcs:km;la plagne:km;les deux alpes:km;alpe d huez:km;avoriaz:kma;morzine:kmh;megeve:kmr;la clusaz:km;serre chevalier:km;kitzbuhel:kmr;ischgl:kmn;lech:kmr;soll:km;mayrhofen:kmn;obergurgl:km;saalbach:kmn;st moritz:kmr;davos:km;grindelwald:mhk;wengen:mk;saas fee:km;crans montana:km;cortina d ampezzo:kmr;cervinia:km;livigno:km;andorra:km;whistler:kmh;aspen:kmr;vail:kmr;niseko:km;ayia napa:bn;protaras:ba;paphos:bx;limassol:cb;larnaca:b;quinta do lago:bor;vale do lobo:bo;vilamoura:bon;carvoeiro:bo;tavira:bo;costa adeje:bn;puerto de la cruz:o;los cristianos:b;puerto pollensa:boa;alcudia:ba;deia:os;soller:oh;santanyi:bs;cala d or:bs;costa brava:bo;begur:bos;sitges:bn;benidorm:bna;lake como:ls;varenna:ls;bellagio:ls;kassiopi:bo;paleokastritsa:bo;elounda:br;chania:obf;kos:ib;skiathos:ib;lefkada:ib;thassos:ib;halkidiki:bo;hamilton island:ib;whitsundays:ib;whitehaven beach:ib;airlie beach:bo;rottnest island:ibz;gold coast:bn;byron bay:bs;great barrier reef:ibz;victoria falls:zh;kruger national park:z;kruger:z;sabi sands:zr;serengeti:z;masai mara:z;botswana:z;namibia:zh;cancun:bn;punta cana:ba;st barts:ibr;anguilla:ibr;grand cayman:ib;aruba:ib;cabo san lucas:bn;maui:ibh;las vegas strip:cn;magic kingdom:ta;walt disney world:ta;disneyland paris:ta;disneyland:ta;tokyo:cfu;kyoto:cu;osaka:cf;bangkok:cfn;phuket:ib;koh samui:ib;koh lanta:ibs;chiang mai:cuf;bali:ibw;singapore:cf;hong kong:cf;seoul:cf;hanoi:cf;hoi an:cuf;sri lanka:bz;goa:bn;kerala:yw;sydney:cb;melbourne:cf;queenstown:mh;bora bora:ibr;fiji:ib`;
const TAGS_BY_NAME = new Map<string, Tags>();
for (const entry of KNOWN_TAGS.split(';')) {
  const [name, codes] = entry.trim().split(':');
  if (name && codes) TAGS_BY_NAME.set(name, Object.fromEntries([...codes].map((c) => [CODES[c], 1])));
}

/** Countries whose holidays lean one way, when we know nothing about the place itself. */
const COUNTRY_TAGS: Record<string, Tags> = {
  maldives: { beach: 1, island: 1 }, seychelles: { beach: 1, island: 1 }, mauritius: { beach: 1, island: 1 }, 'french polynesia': { beach: 1, island: 1 },
  barbados: { beach: 1, island: 1 }, jamaica: { beach: 1, island: 1 }, bahamas: { beach: 1, island: 1 }, fiji: { beach: 1, island: 1 },
  switzerland: { mountains: 1 }, austria: { mountains: 0.8 }, nepal: { hiking: 1, mountains: 1 }, iceland: { outdoors: 1 },
  cyprus: { beach: 0.8 }, malta: { beach: 0.6, history: 0.6 }, greece: { beach: 0.5, island: 0.4 }, croatia: { coast: 0.6 },
};

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/^the /, '');

/** Holiday types for any place, from what we know about it. */
export function tagsForPlace(p: Place): Tags {
  const n = norm(p.name);
  const known = TAGS_BY_NAME.get(n);
  if (known) return known;
  const tags: Tags = {};
  if (/\b(lake|lago|loch)\b/.test(n)) tags.lakes = 1;
  if (/\b(island|isle|islands|isla|ile|ilha|koh|ko)\b/.test(n)) Object.assign(tags, { island: 1, beach: 0.6 });
  if (/\b(beach|playa|praia|plage|bay|cove|sands)\b/.test(n)) Object.assign(tags, { beach: 1, coast: 0.6 });
  if (/\b(mount|mont|monte|mountains?|peak|alps?|valley)\b/.test(n)) tags.mountains = 1;
  if (/\b(national park|park|forest|falls)\b/.test(n)) Object.assign(tags, { outdoors: 1, hiking: 0.6 });
  if (/\b(coast|riviera|costa)\b/.test(n)) tags.coast = 1;
  if (Object.keys(tags).length) return tags;
  return COUNTRY_TAGS[norm(countryOf(p))] ?? {};
}

/** A rough warm-season high from latitude, for places without monthly temperatures. */
function warmthFromLatitude(lat: number) {
  return Math.round(33 - 0.3 * Math.max(0, Math.abs(lat) - 18));
}

const featureCache = new Map<string, PlaceFeatures>();

/** Features for any place you've typed or been to (or a sample place, if it is one). */
export function featuresForPlace(p: Place): PlaceFeatures {
  const country = countryOf(p);
  const key = placeKey(p.name, country);
  const hit = featureCache.get(key);
  if (hit) return hit;
  const sample = samplePlaces.find((s) => norm(s.name) === norm(p.name));
  const f = sample ? featuresForSlug(sample.slug)! : fromName(p, key);
  featureCache.set(key, f);
  return f;
}

function fromName(p: Place, key: string): PlaceFeatures {
  const pos = positionOf(p);
  const tags = { ...tagsForPlace(p) };
  deriveTags(tags, pos, null);
  return { key, name: p.name, tags, pos, warmth: pos ? warmthFromLatitude(pos[0]) : null, goodFor: [], priceFrom: null, baseScore: null };
}

/**
 * Types worked out from facts rather than words (owner, Nov 2026: the Maldives, Corfu and Lanzarote all looked like
 * "island + beach", so a luxury long-haul fan got Corfu): a beach or island in the tropics is "tropical", and a place
 * where even the cheapest stay costs £300+ leans "luxury" (fully from £500).
 */
function deriveTags(tags: Tags, pos: [number, number] | null, price: number | null) {
  const sunny = Math.max(tags.beach ?? 0, tags.island ?? 0);
  if (pos && Math.abs(pos[0]) < 23.5 && sunny >= 0.5) tags.tropical = Math.max(tags.tropical ?? 0, 1);
  if (price != null && price >= 300) tags.luxury = Math.max(tags.luxury ?? 0, Math.min(1, (price - 250) / 250));
}

/** The country part of a sample place's region ("Sicily, Italy" → "Italy"). */
export function sampleCountry(slug: string): string {
  const place = getPlace(slug);
  return place ? countryOf({ name: place.name, country: place.region.split(', ').pop() ?? '' }) : '';
}

/** Features for a sample place page. */
export function featuresForSlug(slug: string): PlaceFeatures | null {
  const place = getPlace(slug);
  if (!place) return null;
  const country = sampleCountry(slug);
  const key = placeKey(place.name, country);
  const cached = featureCache.get(key);
  if (cached) return cached;

  const d = placeDetails[slug];
  const tags: Tags = {};
  const add = (t: Tags, w: number) => {
    for (const [k, v] of Object.entries(t)) tags[k] = Math.min(1, (tags[k] ?? 0) + v * w);
  };
  for (const word of (d?.kicker ?? '').split(' · ')) if (KICKER[word]) add(KICKER[word], 1);
  for (const x of d?.dos ?? []) if (ACTIVITY[x.tag]) add(ACTIVITY[x.tag], 0.35);
  for (const x of d?.culture ?? []) if (ACTIVITY[x.tag]) add(ACTIVITY[x.tag], 0.25);
  if ((d?.eats.length ?? 0) >= 3) add({ food: 1 }, 0.25);
  // What we know about the place by name fills in what the page's words miss (Ibiza's nightlife, the Maldives' luxury,
  // Victoria Falls' wildlife). Lighter than the page's own words.
  const known = TAGS_BY_NAME.get(norm(place.name));
  if (known) add(known, 0.7);
  if (!Object.keys(tags).length) add(tagsForPlace({ name: place.name, country }), 1);

  const pos = positionOf({ name: place.name, country });
  let warmth: number | null = null;
  if (d?.temps) {
    const months = d.bestMonths.length ? d.bestMonths : [5, 6, 7];
    warmth = Math.round(months.reduce((a, m) => a + d.temps![m], 0) / months.length);
  } else if (pos) warmth = warmthFromLatitude(pos[0]);
  // A typical price: between the cheapest stay and the middle one (each place's sample stays include a splurge, so the
  // middle alone made every city look luxurious; the cheapest alone made Dubai look like a £120 place).
  const stayPrices = (d?.stays ?? []).map((s) => parseStaySub(s.sub).priceFrom).filter((x): x is number => x != null).sort((a, b) => a - b);
  const fromPrice = d?.staysFrom?.match(/£\s?(\d+)/);
  const cheapest = stayPrices[0] ?? (fromPrice ? Number(fromPrice[1]) : null);
  const middle = stayPrices.length ? stayPrices[Math.floor((stayPrices.length - 1) / 2)] : cheapest;
  const typical = cheapest != null && middle != null ? Math.round(Math.sqrt(cheapest * middle)) : null;
  deriveTags(tags, pos, cheapest);

  const f: PlaceFeatures = {
    key,
    name: place.name,
    tags,
    pos,
    warmth,
    goodFor: (d?.goodFor ?? []).map((g) => g.toLowerCase()).map((g) => (g === 'couple' ? 'couples' : g === 'family' ? 'families' : g)),
    priceFrom: typical,
    baseScore: place.score,
  };
  featureCache.set(key, f);
  return f;
}

/** Sample friends' ratings of sample places: the Friends feed and "What friends said". */
export function sampleFriendRatings(): FriendRating[] {
  const out: FriendRating[] = [];
  const seen = new Set<string>();
  const push = (friend: string, slug: string, score: number | null) => {
    const f = featuresForSlug(slug);
    if (!f || score == null) return;
    const id = `${friend}|${f.key}`;
    if (seen.has(id)) return;
    seen.add(id);
    out.push({ friend, placeKey: f.key, score, tags: f.tags });
  };
  for (const item of friendsFeed) push(item.who, item.slug, item.score);
  for (const [slug, d] of Object.entries(placeDetails)) for (const s of d.said) push(s.who, slug, s.score);
  return out;
}

/** "from £240 a night · Maya stayed" → the price and the friend who stayed. */
export function parseStaySub(sub: string | null): { priceFrom: number | null; friend: string | null } {
  const price = sub?.match(/£\s?(\d+)/);
  const friend = sub?.match(/·\s*([A-Z][\w'-]*) stayed/);
  return { priceFrom: price ? Number(price[1]) : null, friend: friend ? friend[1] : null };
}

/**
 * A stay in the sample places' details by name ("Ikos Dassia"), with its place and price a night, for hotels you
 * rated or saved. Looks in `slug` first when given. Case and accents don't matter.
 */
export function findSampleStay(name: string, slug?: string | null): { slug: string; type: string; priceFrom: number | null; city: boolean } | null {
  const k = norm(name);
  const order = slug && placeDetails[slug] ? [slug, ...Object.keys(placeDetails).filter((s) => s !== slug)] : Object.keys(placeDetails);
  for (const s of order) {
    const stay = placeDetails[s].stays.find((x) => norm(x.name) === k);
    if (stay) return { slug: s, type: stay.type, priceFrom: parseStaySub(stay.sub).priceFrom, city: isCitySlug(s) };
  }
  return null;
}

/** A city place (its hotels are city hotels, not resorts). */
export function isCitySlug(slug: string): boolean {
  return (featuresForSlug(slug)?.tags.city ?? 0) >= 0.5;
}

/** Kinds of stay in the sample data → the kinds you can pick on a trip. */
export function stayKind(type: string): string {
  if (['Hotel', 'Airbnb', 'Villa', 'B&B'].includes(type)) return type;
  if (type === 'Riad' || type === 'Ryokan') return 'B&B';
  return 'Other';
}

/** Words in a list's name that say what kind of trip it's for ("Ski trips", "Honeymoon ideas"). */
const LIST_WORDS: [RegExp, Tags][] = [
  [/\b(ski|skiing|snow|slopes?|apres|après)\b/, { ski: 1, mountains: 0.6 }],
  [/\b(beach|beaches|sun|sunny|seaside)\b/, { beach: 1 }],
  [/\b(islands?)\b/, { island: 1, beach: 0.5 }],
  [/\b(honeymoon|romantic|romance|couples?)\b/, { luxury: 0.6, slow: 0.4 }],
  [/\b(luxury|splurge|treat|bucket list)\b/, { luxury: 1 }],
  [/\b(food|foodie|eat|eats|restaurants?|lunch(es)?|dinners?|wine)\b/, { food: 1 }],
  [/\b(city|cities|weekend|weekends|break|breaks)\b/, { city: 0.8, shortbreak: 0.6 }],
  [/\b(hike|hikes|hiking|walks?|walking|trek|outdoors?)\b/, { hiking: 1, outdoors: 0.6 }],
  [/\b(family|kids|children)\b/, { family: 1 }],
  [/\b(spa|spas|wellness|retreat)\b/, { wellness: 1 }],
  [/\b(culture|art|museums?|history)\b/, { culture: 1 }],
  [/\b(lakes?)\b/, { lakes: 1 }],
  [/\b(mountains?|alps)\b/, { mountains: 1 }],
  [/\b(safari|wildlife)\b/, { wildlife: 1 }],
  [/\b(party|nightlife|clubs?)\b/, { nightlife: 1 }],
  [/\b(countryside|cottages?|cabins?|road ?trip)\b/, { countryside: 1 }],
];

export function tagsForListName(name: string): Tags {
  const n = norm(name);
  const tags: Tags = {};
  for (const [re, t] of LIST_WORDS) if (re.test(n)) for (const [k, v] of Object.entries(t)) tags[k] = Math.max(tags[k] ?? 0, v);
  return tags;
}

/**
 * What we know about one "Made for your taste" item (a restaurant, café, drink, thing to
 * do or stay) from friends: who went, their score, and a line saying so. Also which kind
 * of taste it appeals to (food for cafés, culture for a museum…).
 */
export function tasteItemInfo(item: { slug: string; kind: string; name: string; friends: string }) {
  const d = placeDetails[item.slug];
  const stay = d?.stays.find((x) => x.name === item.name);
  const eat = d?.eats.find((x) => x.name === item.name);
  const todo = d?.dos.find((x) => x.name === item.name);
  const hasBeen = /friends? (has|have) been/.test(item.friends);
  const fallback = /new to your friends/i.test(item.friends) ? 'New to your friends' : item.friends;

  if (stay) {
    const { friend } = parseStaySub(stay.sub);
    return {
      stay,
      tasteTag: null,
      friendScore: friend ? stay.score : null,
      friendRecommended: !!friend || hasBeen,
      note: friend && stay.score != null ? `${friend} stayed and gave it ${stay.score.toFixed(1)}` : fallback,
    };
  }
  const tasteTag = item.kind === 'Do' ? doTasteTag(todo?.tag) : item.kind === 'Drink' ? 'nightlife' : 'food';
  if (eat?.from) {
    return { stay: null, tasteTag, friendScore: eat.score, friendRecommended: true, note: eat.score != null ? `${eat.from} gave it ${eat.score.toFixed(1)}` : `Recommended by ${eat.from}` };
  }
  if (todo?.from) {
    return { stay: null, tasteTag, friendScore: null, friendRecommended: true, note: `${todo.gem ? 'Found' : 'Recommended'} by ${todo.from}` };
  }
  return { stay: null, tasteTag, friendScore: null, friendRecommended: hasBeen, note: fallback };
}

/** The kind of taste a thing to do appeals to ("History" → history). */
function doTasteTag(tag: string | undefined): string {
  const t = tag ? ACTIVITY[tag] : undefined;
  if (!t) return 'culture';
  return Object.entries(t).sort((a, b) => b[1] - a[1])[0][0];
}
