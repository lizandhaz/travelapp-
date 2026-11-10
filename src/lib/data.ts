// Sample data for the clickable shell.
// Everything here is made up. When Supabase is connected (see docs/plan.md),
// these arrays get replaced by real database queries, but the shapes (types)
// below are a good starting point for the database tables.

export const STAY_TYPES = [
  "Hotel",
  "Airbnb",
  "Villa",
  "B&B",
  "Apartment",
  "Hostel",
  "Campsite",
  "Boat",
] as const;
export type StayType = (typeof STAY_TYPES)[number];

export type Person = {
  handle: string;
  name: string;
  initials: string;
  homeTown: string;
  bio: string;
  /** Background colour for the avatar circle (a brand token name). */
  colour: "postbox" | "airmail" | "sea" | "sun" | "ink";
  isFriend: boolean;
};

export type Destination = {
  slug: string;
  name: string;
  country: string;
  tags: string[];
  blurb: string;
  /** Two colours used for the placeholder "photo" gradient. */
  palette: [string, string];
};

export type FoodPick = { name: string; note: string };
export type Photo = { caption: string; palette: [string, string] };

export type Rating = {
  id: string;
  author: string; // Person.handle
  destination: string; // Destination.slug
  /** Month the trip happened, "YYYY-MM". */
  tripMonth: string;
  /** Date the rating was posted (always after they got home), "YYYY-MM-DD". */
  postedAt: string;
  destinationScore: number; // 1 to 10
  stay: { name: string; type: StayType; score: number };
  headline: string;
  review: string;
  foodPicks: FoodPick[];
  topTips: string[];
  photos: Photo[];
};

export type PostcardKind = "rating" | "reaction" | "friend" | "tip" | "welcome";
export type Postcard = {
  id: string;
  kind: PostcardKind;
  from?: string; // Person.handle
  text: string;
  href: string;
  sentAt: string; // "YYYY-MM-DD"
  unread: boolean;
};

// The signed-in person, until real accounts exist.
export const ME = "sam";

export const people: Person[] = [
  {
    handle: "sam",
    name: "Sam Rivers",
    initials: "SR",
    homeTown: "Bristol",
    bio: "Slow travel, long lunches, any town with a harbour.",
    colour: "airmail",
    isFriend: false,
  },
  {
    handle: "maya",
    name: "Maya Okafor",
    initials: "MO",
    homeTown: "London",
    bio: "Will cross a city for a good bakery.",
    colour: "postbox",
    isFriend: true,
  },
  {
    handle: "theo",
    name: "Theo Lindqvist",
    initials: "TL",
    homeTown: "Manchester",
    bio: "Hikes first, pub second.",
    colour: "sea",
    isFriend: true,
  },
  {
    handle: "priya",
    name: "Priya Shah",
    initials: "PS",
    homeTown: "Leeds",
    bio: "Design hotels and market breakfasts.",
    colour: "sun",
    isFriend: true,
  },
  {
    handle: "jonah",
    name: "Jonah Byrne",
    initials: "JB",
    homeTown: "Dublin",
    bio: "Family trips with two under-tens. I rate on chaos survived.",
    colour: "ink",
    isFriend: true,
  },
  {
    handle: "ines",
    name: "Inês Costa",
    initials: "IC",
    homeTown: "Edinburgh",
    bio: "Islands, ferries and anywhere with a sea swim.",
    colour: "airmail",
    isFriend: true,
  },
];

export const destinations: Destination[] = [
  {
    slug: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    tags: ["city", "food", "culture", "sea"],
    blurb: "Hills, trams, custard tarts and sunsets from every miradouro.",
    palette: ["#E2A43B", "#2F5D8A"],
  },
  {
    slug: "puglia",
    name: "Puglia",
    country: "Italy",
    tags: ["food", "sea", "slow", "villa"],
    blurb: "Whitewashed towns, olive groves and the best burrata of your life.",
    palette: ["#F2D7A6", "#3E7C7A"],
  },
  {
    slug: "kyoto",
    name: "Kyoto",
    country: "Japan",
    tags: ["culture", "food", "city", "design"],
    blurb: "Temples at dawn, tiny bars at night.",
    palette: ["#B5392A", "#1F2A44"],
  },
  {
    slug: "st-ives",
    name: "St Ives",
    country: "England",
    tags: ["sea", "slow", "family", "art"],
    blurb: "Turquoise bays, galleries and a pasty on the harbour wall.",
    palette: ["#7FB7BE", "#E8D9BF"],
  },
  {
    slug: "mallorca",
    name: "Deià, Mallorca",
    country: "Spain",
    tags: ["sea", "hiking", "slow", "villa"],
    blurb: "Mountain village above a rocky cove, with orange groves all around.",
    palette: ["#E9A07A", "#3E7C7A"],
  },
  {
    slug: "marrakech",
    name: "Marrakech",
    country: "Morocco",
    tags: ["culture", "food", "city", "design"],
    blurb: "Riads, souks and rooftop mint tea.",
    palette: ["#C96A3B", "#E2A43B"],
  },
  {
    slug: "skye",
    name: "Isle of Skye",
    country: "Scotland",
    tags: ["hiking", "sea", "slow"],
    blurb: "Big skies, fairy pools and weather that changes every ten minutes.",
    palette: ["#5E7A6E", "#A9B8C6"],
  },
  {
    slug: "mexico-city",
    name: "Mexico City",
    country: "Mexico",
    tags: ["city", "food", "culture", "design"],
    blurb: "Tacos al pastor, leafy Roma Norte and world-class museums.",
    palette: ["#D9556B", "#2F5D8A"],
  },
  {
    slug: "copenhagen",
    name: "Copenhagen",
    country: "Denmark",
    tags: ["city", "design", "food"],
    blurb: "Bikes, harbour swims and pastries at every corner.",
    palette: ["#9CB6CF", "#E8D9BF"],
  },
  {
    slug: "crete",
    name: "Chania, Crete",
    country: "Greece",
    tags: ["sea", "food", "family", "hiking"],
    blurb: "Venetian harbour, gorge hikes and long tavern dinners.",
    palette: ["#4F8FB8", "#F2D7A6"],
  },
];

export const ratings: Rating[] = [
  {
    id: "r1",
    author: "maya",
    destination: "lisbon",
    tripMonth: "2026-09",
    postedAt: "2026-11-08",
    destinationScore: 9,
    stay: { name: "Casa do Miradouro", type: "Airbnb", score: 8 },
    headline: "Pastéis for breakfast, lunch and tea",
    review:
      "Stayed up in Graça so every walk home was a climb, but the view from the terrace made up for it. Go to the Time Out Market once, then never again: the little tascas are better.",
    foodPicks: [
      { name: "Manteigaria", note: "Warm pastéis de nata, eat them standing up." },
      { name: "Taberna da Rua das Flores", note: "No bookings. Get there at 6." },
    ],
    topTips: [
      "Get a Viva Viagem card for trams and ferries.",
      "Take the ferry to Cacilhas for cheap grilled fish with a view back over the city.",
    ],
    photos: [
      { caption: "Tram 28 at golden hour", palette: ["#E2A43B", "#B5392A"] },
      { caption: "Terrace view over Alfama", palette: ["#2F5D8A", "#F2D7A6"] },
    ],
  },
  {
    id: "r2",
    author: "theo",
    destination: "skye",
    tripMonth: "2026-08",
    postedAt: "2026-11-06",
    destinationScore: 8,
    stay: { name: "Glenbrittle Campsite", type: "Campsite", score: 7 },
    headline: "Four seasons in one afternoon",
    review:
      "The Quiraing walk is unreal. Midges were biblical in the evenings but the campsite shop sells the good repellent. Book anything with a roof months ahead.",
    foodPicks: [{ name: "Oyster Shed, Carbost", note: "Fresh oysters and scallops by the loch." }],
    topTips: [
      "Start the Fairy Pools walk before 9am to beat the coaches.",
      "Fill up with fuel in Portree. Stations are rare elsewhere.",
    ],
    photos: [{ caption: "Quiraing ridge", palette: ["#5E7A6E", "#A9B8C6"] }],
  },
  {
    id: "r3",
    author: "priya",
    destination: "marrakech",
    tripMonth: "2026-10",
    postedAt: "2026-11-03",
    destinationScore: 8,
    stay: { name: "Riad Yasmine", type: "B&B", score: 9 },
    headline: "The riad pool is worth the hype",
    review:
      "Gorgeous riad with a green-tiled plunge pool. The medina is intense the first day and magical by the third. Agree taxi prices before you get in.",
    foodPicks: [
      { name: "Nomad", note: "Rooftop lunch, try the carrot salad." },
      { name: "Jemaa el-Fnaa food stalls", note: "Stall 14 for snails, if you're brave." },
    ],
    topTips: ["Visit Jardin Majorelle at opening time.", "Carry small notes for tips and taxis."],
    photos: [
      { caption: "Riad courtyard", palette: ["#3E7C7A", "#E9A07A"] },
      { caption: "Spice stall", palette: ["#C96A3B", "#E2A43B"] },
    ],
  },
  {
    id: "r4",
    author: "jonah",
    destination: "crete",
    tripMonth: "2026-08",
    postedAt: "2026-10-29",
    destinationScore: 9,
    stay: { name: "Villa Elia", type: "Villa", score: 9 },
    headline: "Kids didn't want to leave the pool",
    review:
      "Villa ten minutes from Chania with a pool and a lemon tree. The harbour at night is lovely with kids, and every taverna gave ours free ice cream.",
    foodPicks: [{ name: "Tamam", note: "In an old hammam. Order the lamb." }],
    topTips: [
      "Hire a car with air-con. Worth every euro.",
      "Elafonisi beach is shallow and pink-tinged, perfect for little ones.",
    ],
    photos: [{ caption: "Chania lighthouse", palette: ["#4F8FB8", "#F2D7A6"] }],
  },
  {
    id: "r5",
    author: "ines",
    destination: "mallorca",
    tripMonth: "2026-09",
    postedAt: "2026-10-24",
    destinationScore: 10,
    stay: { name: "Hostal Villa Verde", type: "Hotel", score: 8 },
    headline: "Swam in the cala every single morning",
    review:
      "Deià is tiny and perfect. Walk down to Cala Deià for a swim, then lunch at the shack on the rocks. The bus from Palma is easy.",
    foodPicks: [{ name: "Ca's Patró March", note: "Seafood on the rocks above the cove." }],
    topTips: ["Do the walk to Sóller along the coast path, about 3 hours."],
    photos: [{ caption: "Cala Deià", palette: ["#3E7C7A", "#E9A07A"] }],
  },
  {
    id: "r6",
    author: "maya",
    destination: "copenhagen",
    tripMonth: "2026-06",
    postedAt: "2026-10-12",
    destinationScore: 8,
    stay: { name: "Hotel Sanders", type: "Hotel", score: 9 },
    headline: "Cardamom buns are a personality now",
    review:
      "Hired bikes for the whole trip. Swam at Islands Brygge harbour bath and ate our weight in pastries. Pricey, but worth it.",
    foodPicks: [{ name: "Juno the Bakery", note: "Cardamom buns sell out by 11." }],
    topTips: ["Get a Copenhagen Card if you're doing more than two museums."],
    photos: [{ caption: "Nyhavn", palette: ["#9CB6CF", "#E2A43B"] }],
  },
  {
    id: "r7",
    author: "priya",
    destination: "mexico-city",
    tripMonth: "2026-04",
    postedAt: "2026-09-30",
    destinationScore: 9,
    stay: { name: "Apartment in Roma Norte", type: "Apartment", score: 8 },
    headline: "Ate tacos eleven times in five days",
    review:
      "Roma Norte is leafy and walkable. Frida Kahlo's house needs booking weeks ahead. The anthropology museum alone is worth the flight.",
    foodPicks: [
      { name: "El Huequito", note: "Al pastor, the original." },
      { name: "Contramar", note: "Tuna tostadas at lunch." },
    ],
    topTips: ["Use Uber rather than street taxis.", "Altitude is real. Take day one easy."],
    photos: [{ caption: "Jacarandas in bloom", palette: ["#9B7FC4", "#2F5D8A"] }],
  },
  {
    id: "r8",
    author: "theo",
    destination: "st-ives",
    tripMonth: "2026-07",
    postedAt: "2026-09-18",
    destinationScore: 7,
    stay: { name: "Harbour Rest", type: "B&B", score: 6 },
    headline: "Lovely, but go outside August",
    review:
      "Beaches are stunning, but the town was rammed. The coast path to Zennor is the highlight. B&B was fine, if a bit tired.",
    foodPicks: [{ name: "Porthminster Beach Café", note: "Book a table for sunset." }],
    topTips: ["Park at Lelant and take the little train in. The views are great."],
    photos: [{ caption: "Porthmeor Beach", palette: ["#7FB7BE", "#E8D9BF"] }],
  },
  // Sam's own ratings (the signed-in person)
  {
    id: "r9",
    author: "sam",
    destination: "puglia",
    tripMonth: "2026-06",
    postedAt: "2026-07-04",
    destinationScore: 9,
    stay: { name: "Masseria Le Pietre", type: "Villa", score: 9 },
    headline: "Burrata twice a day is a lifestyle",
    review:
      "Stayed in an old farmhouse near Ostuni. Day trips to Polignano and Alberobello were easy by car. The slowest, most delicious week.",
    foodPicks: [{ name: "Osteria del Tempo Perso", note: "In a cave. Orecchiette with turnip tops." }],
    topTips: ["You need a car. Hire from Bari airport."],
    photos: [{ caption: "Ostuni at dusk", palette: ["#F2D7A6", "#3E7C7A"] }],
  },
  {
    id: "r10",
    author: "sam",
    destination: "lisbon",
    tripMonth: "2025-10",
    postedAt: "2025-10-20",
    destinationScore: 8,
    stay: { name: "Memmo Alfama", type: "Hotel", score: 8 },
    headline: "Rooftop pool with a view of the river",
    review: "Short city break. Lovely hotel tucked into the Alfama lanes. Sintra day trip was a highlight.",
    foodPicks: [{ name: "Cervejaria Ramiro", note: "Prawns, clams, then a steak sandwich for pudding." }],
    topTips: ["Go to Sintra on a weekday and start with Pena Palace."],
    photos: [{ caption: "Alfama rooftops", palette: ["#E2A43B", "#2F5D8A"] }],
  },
  {
    id: "r11",
    author: "sam",
    destination: "skye",
    tripMonth: "2025-05",
    postedAt: "2025-06-01",
    destinationScore: 8,
    stay: { name: "Skeabost Cottage", type: "Airbnb", score: 7 },
    headline: "Rain, rainbows, repeat",
    review: "Cosy cottage with a wood burner. Drove the whole island in four days.",
    foodPicks: [{ name: "Scorrybreac, Portree", note: "Tasting menu, worth the splurge." }],
    topTips: ["Pack waterproof trousers, not just a coat."],
    photos: [{ caption: "Neist Point", palette: ["#5E7A6E", "#A9B8C6"] }],
  },
];

export const postcards: Postcard[] = [
  {
    id: "p1",
    kind: "rating",
    from: "maya",
    text: "rated Lisbon 9/10. You gave it 8. Fancy a rematch?",
    href: "/rating/r1",
    sentAt: "2026-11-08",
    unread: true,
  },
  {
    id: "p2",
    kind: "reaction",
    from: "ines",
    text: "saved your Puglia tip about hiring a car from Bari.",
    href: "/rating/r9",
    sentAt: "2026-11-07",
    unread: true,
  },
  {
    id: "p3",
    kind: "rating",
    from: "theo",
    text: "rated Isle of Skye 8/10, same as you.",
    href: "/rating/r2",
    sentAt: "2026-11-06",
    unread: false,
  },
  {
    id: "p4",
    kind: "friend",
    from: "jonah",
    text: "accepted your friend request.",
    href: "/people/jonah",
    sentAt: "2026-10-28",
    unread: false,
  },
  {
    id: "p5",
    kind: "tip",
    text: "Back from somewhere lovely? Log it while the memories are fresh.",
    href: "/log",
    sentAt: "2026-10-20",
    unread: false,
  },
  {
    id: "p6",
    kind: "welcome",
    text: "Welcome to Postcard! Rate your first holiday to get picks made for you.",
    href: "/log",
    sentAt: "2025-06-01",
    unread: false,
  },
];

// ---------- Helpers ----------

export function getPerson(handle: string): Person | undefined {
  return people.find((p) => p.handle === handle);
}

export function getDestination(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}

export function getRating(id: string): Rating | undefined {
  return ratings.find((r) => r.id === id);
}

export function ratingsFor(slug: string): Rating[] {
  return byNewest(ratings.filter((r) => r.destination === slug));
}

export function ratingsBy(handle: string): Rating[] {
  return byNewest(ratings.filter((r) => r.author === handle));
}

export function friends(): Person[] {
  return people.filter((p) => p.isFriend);
}

/** Ratings from friends, newest first. Powers the "Friends" side of Home. */
export function friendFeed(): Rating[] {
  const friendHandles = new Set(friends().map((p) => p.handle));
  return byNewest(ratings.filter((r) => friendHandles.has(r.author)));
}

export function averageScore(slug: string): number | null {
  const rs = ratings.filter((r) => r.destination === slug);
  if (rs.length === 0) return null;
  return Math.round((rs.reduce((sum, r) => sum + r.destinationScore, 0) / rs.length) * 10) / 10;
}

export type Pick = { destination: Destination; reason: string; match: number };

/**
 * "For you" picks: destinations you haven't rated, ranked by how much their
 * tags overlap with places you scored 8 or more, plus how well friends rated them.
 * A simple stand-in for a real recommendation engine.
 */
export function forYouPicks(handle: string = ME): Pick[] {
  const mine = ratings.filter((r) => r.author === handle);
  const visited = new Set(mine.map((r) => r.destination));
  const loved = mine.filter((r) => r.destinationScore >= 8);

  const tagWeight = new Map<string, number>();
  for (const r of loved) {
    for (const tag of getDestination(r.destination)?.tags ?? []) {
      tagWeight.set(tag, (tagWeight.get(tag) ?? 0) + 1);
    }
  }

  return destinations
    .filter((d) => !visited.has(d.slug))
    .map((d) => {
      const overlap = d.tags.reduce((sum, t) => sum + (tagWeight.get(t) ?? 0), 0);
      const avg = averageScore(d.slug) ?? 6;
      const match = Math.min(99, Math.round(50 + overlap * 6 + (avg - 6) * 5));
      const shared = d.tags.filter((t) => tagWeight.has(t));
      const lovedMatch = loved.find((r) =>
        getDestination(r.destination)?.tags.some((t) => shared.includes(t)),
      );
      const lovedName = lovedMatch ? getDestination(lovedMatch.destination)?.name : undefined;
      const reason = lovedName
        ? `Because you loved ${lovedName}: ${shared.slice(0, 2).join(" + ")}`
        : "Popular with friends";
      return { destination: d, reason, match };
    })
    .sort((a, b) => b.match - a.match);
}

export function unreadPostcardCount(): number {
  return postcards.filter((p) => p.unread).length;
}

function byNewest(rs: Rating[]): Rating[] {
  return [...rs].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

// ---------- Formatting ----------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09" -> "Sep 2026" */
export function formatMonth(ym: string): string {
  const [y, m] = ym.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

/** "2026-11-08" -> "8 Nov" (adds the year if it isn't this year) */
export function formatDay(ymd: string, thisYear = 2026): string {
  const [y, m, d] = ymd.split("-");
  const base = `${Number(d)} ${MONTHS[Number(m) - 1]}`;
  return Number(y) === thisYear ? base : `${base} ${y}`;
}
