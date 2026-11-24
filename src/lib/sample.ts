import type { PhotoName } from './photos';

/**
 * Sample content, taken from the design prototype (the "… without planning" artifact).
 * It fills Home, Explore, Saved, Postcards and place pages until those parts
 * become real (see docs/plan.md, Steps C–H). Your own trips are real (lib/trips.ts).
 * Scores are out of 10 with one decimal place.
 */

export type SamplePlace = { slug: string; name: string; region: string; score: number | null; photo: PhotoName | null; photos: PhotoName[] };
export type RowItem = { slug: string; name: string; sub: string; photo: PhotoName | null; score?: number; rank?: string };
export type TasteItem = { slug: string; kind: string; match: string; name: string; where: string; because: string; friends: string; photo: PhotoName | null };
export type BoardItem = { slug: string | null; kind: string; name: string; sub: string; photo: PhotoName | null; score?: number };
export type FeedItem = {
  who: string; face: PhotoName | null; place: string; region: string; month: string; photo: PhotoName | null;
  quote: string | null; score: number; stayType: string; stayName: string; stayScore: number | null; slug: string;
  /** Real trips (people you follow): the trip's id, private photo links and the country. */
  id?: string; photoUri?: string | null; faceUri?: string | null; country?: string;
  /** When they posted it ("2 hours ago"). */
  posted?: string;
};
export type Board = { name: string; meta: string; photos: PhotoName[] };
export type SamplePostcard = { who: string; text: string; when: string; photo: PhotoName | null; slug: string };
export type Collection = { name: string; photo: PhotoName | null; filter: string };

export const hero = {
  "slug": "como",
  "kicker": "Four friends saved it",
  "name": "Lake Como",
  "sub": "Italy · 4 friends",
  "score": 8.7,
  "photo": "como-1"
} as { slug: string; kicker: string; name: string; sub: string; score: number; photo: PhotoName };

export const rows = {
  "trending": [
    {
      "slug": "puglia",
      "rank": "#1",
      "name": "Polignano a Mare",
      "sub": "Puglia, Italy",
      "photo": null
    },
    {
      "slug": "madeira",
      "rank": "#2",
      "name": "Madeira",
      "sub": "Portugal",
      "photo": null
    },
    {
      "slug": "sicily",
      "rank": "#3",
      "name": "Palermo",
      "sub": "Sicily, Italy",
      "photo": null
    },
    {
      "slug": "hydra",
      "rank": "#4",
      "name": "Hydra",
      "sub": "Greece",
      "photo": "own-hydra-harbour"
    }
  ],
  "islands": [
    {
      "slug": "maldives",
      "score": 9.4,
      "name": "The Maldives",
      "sub": "Indian Ocean",
      "photo": "maldives-1"
    },
    {
      "slug": "borabora",
      "score": 9.3,
      "name": "Bora Bora",
      "sub": "French Polynesia",
      "photo": "own-borabora-beach"
    },
    {
      "slug": "seychelles",
      "score": 9.2,
      "name": "La Digue",
      "sub": "Seychelles",
      "photo": null
    },
    {
      "slug": "turks",
      "score": 9.0,
      "name": "Turks and Caicos",
      "sub": "Caribbean",
      "photo": "own-turks-beach"
    },
    {
      "slug": "zanzibar",
      "score": 8.9,
      "name": "Zanzibar",
      "sub": "Tanzania",
      "photo": "own-zanzibar-hammock"
    },
    {
      "slug": "mauritius",
      "score": 8.8,
      "name": "Mauritius",
      "sub": "Indian Ocean",
      "photo": null
    }
  ],
  "weekends": [
    {
      "slug": "cotswolds",
      "score": 8.7,
      "name": "The Cotswolds",
      "sub": "1h 45m drive from London",
      "photo": null
    },
    {
      "slug": "stives",
      "score": 8.6,
      "name": "St Ives",
      "sub": "5h train from Paddington",
      "photo": null
    },
    {
      "slug": "copenhagen",
      "score": 8.5,
      "name": "Copenhagen",
      "sub": "1h 50m flight",
      "photo": "own-copenhagen-nyhavn"
    },
    {
      "slug": "paris",
      "score": 8.4,
      "name": "Paris",
      "sub": "2h 16m by Eurostar",
      "photo": "paris-1"
    },
    {
      "slug": "heidelberg",
      "score": 8.4,
      "name": "Heidelberg",
      "sub": "1h 30m flight to Frankfurt",
      "photo": null
    },
    {
      "slug": "marrakech",
      "score": 8.2,
      "name": "Marrakech",
      "sub": "3h 30m flight",
      "photo": "own-marrakech-koutoubia"
    },
    {
      "slug": "lisbon",
      "score": 8.1,
      "name": "Lisbon",
      "sub": "2h 40m flight",
      "photo": null
    }
  ],
  "overnight": [
    {
      "slug": "bath",
      "score": 9.1,
      "name": "Bath",
      "sub": "About 1h20 by train",
      "photo": "bath-1"
    },
    {
      "slug": "cambridge",
      "score": 8.9,
      "name": "Cambridge",
      "sub": "About 1h by train",
      "photo": null
    },
    {
      "slug": "york",
      "score": 8.9,
      "name": "York",
      "sub": "About 2h by train",
      "photo": null
    },
    {
      "slug": "cheltenham",
      "score": 8.8,
      "name": "Cheltenham",
      "sub": "About 2h by train",
      "photo": null
    },
    {
      "slug": "warwick",
      "score": 8.8,
      "name": "Warwick Castle",
      "sub": "About 1h30 by train",
      "photo": null
    },
    {
      "slug": "oxford",
      "score": 8.7,
      "name": "Oxford",
      "sub": "About 1h by train",
      "photo": "oxford-1"
    },
    {
      "slug": "longleat",
      "score": 8.7,
      "name": "Longleat",
      "sub": "About 2h by car",
      "photo": null
    },
    {
      "slug": "stratford",
      "score": 8.6,
      "name": "Stratford-upon-Avon",
      "sub": "About 2h by train",
      "photo": null
    },
    {
      "slug": "brighton",
      "score": 8.4,
      "name": "Brighton",
      "sub": "About 1h by train",
      "photo": null
    }
  ],
  "taste": [
    {
      "slug": "crete",
      "kind": "Eat",
      "match": "95% match",
      "name": "Thalassino Ageri",
      "where": "For 2027 list",
      "because": "Because you gave Da Adolfo in Positano a 9.4",
      "friends": "1 friend has been too",
      "photo": "taverna-1"
    },
    {
      "slug": "kyoto",
      "kind": "Do",
      "match": "84% match",
      "name": "Tea ceremony",
      "where": "For One day",
      "because": "Because you gave the Orangerie a 9.2",
      "friends": "1 friend has been too",
      "photo": "own-kyoto-blossom"
    },
    {
      "slug": "lisbon",
      "kind": "Café",
      "match": "96% match",
      "name": "Café Pátio Azul",
      "where": "Lisbon, Portugal",
      "because": "Because you loved the corner boulangerie in Paris",
      "friends": "New to your friends. Found by {app}",
      "photo": null
    },
    {
      "slug": "hydra",
      "kind": "Eat",
      "match": "95% match",
      "name": "Taverna Ostria",
      "where": "Hydra, Greece",
      "because": "Because you gave Da Adolfo in Positano a 9.4",
      "friends": "2 friends have been too",
      "photo": "food-table"
    },
    {
      "slug": "paris",
      "kind": "Café",
      "match": "95% match",
      "name": "Du Pain et des Idées",
      "where": "Paris, France",
      "because": "Because you loved the corner boulangerie in Paris",
      "friends": "1 friend has been too",
      "photo": null
    },
    {
      "slug": "puglia",
      "kind": "Stay",
      "match": "94% match",
      "name": "Masseria Ulivo",
      "where": "Polignano a Mare, Puglia, Italy",
      "because": "Because you gave Riad Zitoun a 9.1",
      "friends": "1 friend has been too",
      "photo": "villa-1"
    },
    {
      "slug": "maldives",
      "kind": "Eat",
      "match": "94% match",
      "name": "Sandbank dinner",
      "where": "The Maldives, Indian Ocean",
      "because": "Because you gave Sal in Comporta a 9.0",
      "friends": "1 friend has been too",
      "photo": "maldives-2"
    },
    {
      "slug": "lisbon",
      "kind": "Drink",
      "match": "93% match",
      "name": "Sunset at Senhora do Monte",
      "where": "Lisbon, Portugal",
      "because": "Because you loved sunset spritz in Positano",
      "friends": "1 friend has been too",
      "photo": null
    },
    {
      "slug": "paris",
      "kind": "Do",
      "match": "93% match",
      "name": "Musée Rodin garden",
      "where": "Paris, France",
      "because": "Because you gave the Orangerie a 9.2",
      "friends": "New to your friends. Found by {app}",
      "photo": "paris-1"
    },
    {
      "slug": "copenhagen",
      "kind": "Café",
      "match": "92% match",
      "name": "Kaffe Krogen",
      "where": "Copenhagen, Denmark",
      "because": "Because you loved Café des Épices in Marrakech",
      "friends": "New to your friends. Found by {app}",
      "photo": null
    },
    {
      "slug": "crete",
      "kind": "Drink",
      "match": "92% match",
      "name": "Sunset at Falassarna",
      "where": "Crete, Greece",
      "because": "Because you loved Pego beach at 8pm",
      "friends": "1 friend has been too",
      "photo": null
    },
    {
      "slug": "copenhagen",
      "kind": "Do",
      "match": "91% match",
      "name": "Louisiana museum",
      "where": "Copenhagen, Denmark",
      "because": "Because you gave the Orangerie a 9.2",
      "friends": "1 friend has been too",
      "photo": "own-copenhagen-nyhavn"
    },
    {
      "slug": "stives",
      "kind": "Eat",
      "match": "90% match",
      "name": "Porthminster Beach Café",
      "where": "St Ives, Cornwall, England",
      "because": "Because you gave Sal in Comporta a 9.0",
      "friends": "1 friend has been too",
      "photo": null
    },
    {
      "slug": "hydra",
      "kind": "Stay",
      "match": "90% match",
      "name": "Casa Ammos",
      "where": "Hydra, Greece",
      "because": "Because you gave Villa Limone a 9.0",
      "friends": "2 friends have been too",
      "photo": "own-hydra-harbour"
    },
    {
      "slug": "paris",
      "kind": "Drink",
      "match": "90% match",
      "name": "Le Perchoir Marais",
      "where": "Paris, France",
      "because": "Because you loved sunset spritz in Positano",
      "friends": "1 friend has been too",
      "photo": "food-wine"
    },
    {
      "slug": "hydra",
      "kind": "Drink",
      "match": "89% match",
      "name": "Sunset Bar",
      "where": "Hydra, Greece",
      "because": "Because you loved Pego beach at 8pm",
      "friends": "2 friends have been too",
      "photo": "food-wine"
    },
    {
      "slug": "sicily",
      "kind": "Café",
      "match": "89% match",
      "name": "Caffè Sicilia",
      "where": "Palermo, Sicily, Italy",
      "because": "Because you loved Café des Épices in Marrakech",
      "friends": "New to your friends. Found by {app}",
      "photo": null
    },
    {
      "slug": "heidelberg",
      "kind": "Drink",
      "match": "89% match",
      "name": "Philosophers' Walk at golden hour",
      "where": "Heidelberg, Germany",
      "because": "Because you loved Pego beach at 8pm",
      "friends": "1 friend has been too",
      "photo": null
    },
    {
      "slug": "stives",
      "kind": "Do",
      "match": "88% match",
      "name": "Tate St Ives",
      "where": "St Ives, Cornwall, England",
      "because": "Because you gave the Orangerie a 9.2",
      "friends": "New to your friends. Found by {app}",
      "photo": null
    },
    {
      "slug": "puglia",
      "kind": "Eat",
      "match": "88% match",
      "name": "Pescaria",
      "where": "Polignano a Mare, Puglia, Italy",
      "because": "Because you gave Ca's Patró March in Deià a 9.2",
      "friends": "1 friend has been too",
      "photo": "food-pasta"
    },
    {
      "slug": "crete",
      "kind": "Stay",
      "match": "87% match",
      "name": "Villa Elounda Blue",
      "where": "Crete, Greece",
      "because": "Because you gave Villa Limone a 9.0",
      "friends": "1 friend has been too",
      "photo": null
    },
    {
      "slug": "orlando",
      "kind": "Café",
      "match": "86% match",
      "name": "Winter Park brunch",
      "where": "Orlando, Florida, USA",
      "because": "Because you loved the corner boulangerie in Paris",
      "friends": "1 friend has been too",
      "photo": null
    },
    {
      "slug": "crete",
      "kind": "Do",
      "match": "86% match",
      "name": "Knossos at opening",
      "where": "Crete, Greece",
      "because": "Because you gave the Orangerie a 9.2",
      "friends": "New to your friends. Found by {app}",
      "photo": null
    },
    {
      "slug": "como",
      "kind": "Eat",
      "match": "85% match",
      "name": "Il Gatto Nero",
      "where": "Lake Como, Italy",
      "because": "Because you gave Sal in Comporta a 9.0",
      "friends": "1 friend has been too",
      "photo": "como-2"
    },
    {
      "slug": "heidelberg",
      "kind": "Do",
      "match": "85% match",
      "name": "Castle at opening",
      "where": "Heidelberg, Germany",
      "because": "Because you gave the Orangerie a 9.2",
      "friends": "1 friend has been too",
      "photo": null
    }
  ],
  "picked": [
    {
      "slug": "hydra",
      "score": 9.1,
      "name": "Hydra",
      "sub": "Greece",
      "photo": "own-hydra-harbour"
    },
    {
      "slug": "crete",
      "score": 8.9,
      "name": "Crete",
      "sub": "Greece",
      "photo": "crete-1"
    },
    {
      "slug": "kyoto",
      "score": 8.9,
      "name": "Kyoto",
      "sub": "Japan",
      "photo": "own-kyoto-blossom"
    },
    {
      "slug": "positano",
      "score": 8.6,
      "name": "Positano",
      "sub": "Italy",
      "photo": null
    },
    {
      "slug": "deia",
      "score": 8.4,
      "name": "Deià",
      "sub": "Mallorca, Spain",
      "photo": null
    },
    {
      "slug": "orlando",
      "score": 8.0,
      "name": "Orlando",
      "sub": "Florida, USA",
      "photo": "orlando-1"
    }
  ]
} as {
  trending: RowItem[]; islands: RowItem[]; weekends: RowItem[]; overnight: RowItem[]; taste: TasteItem[]; picked: RowItem[];
};

export const places: SamplePlace[] = [
  {
    "slug": "bath",
    "name": "Bath",
    "region": "England",
    "score": 9.1,
    "photo": "bath-1",
    "photos": [
      "bath-1"
    ]
  },
  {
    "slug": "borabora",
    "name": "Bora Bora",
    "region": "French Polynesia",
    "score": 9.3,
    "photo": "own-borabora-beach",
    "photos": [
      "own-borabora-beach",
      "own-borabora-pool",
      "own-borabora-fish",
      "own-water-villas"
    ]
  },
  {
    "slug": "brighton",
    "name": "Brighton",
    "region": "England",
    "score": 8.4,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "cambridge",
    "name": "Cambridge",
    "region": "England",
    "score": 8.9,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "cheltenham",
    "name": "Cheltenham",
    "region": "England",
    "score": 8.8,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "como",
    "name": "Lake Como",
    "region": "Italy",
    "score": 8.7,
    "photo": "como-1",
    "photos": [
      "como-1"
    ]
  },
  {
    "slug": "copenhagen",
    "name": "Copenhagen",
    "region": "Denmark",
    "score": 8.5,
    "photo": "own-copenhagen-nyhavn",
    "photos": [
      "own-copenhagen-nyhavn"
    ]
  },
  {
    "slug": "cotswolds",
    "name": "The Cotswolds",
    "region": "England",
    "score": 8.7,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "crete",
    "name": "Crete",
    "region": "Greece",
    "score": 8.9,
    "photo": "crete-1",
    "photos": [
      "crete-1"
    ]
  },
  {
    "slug": "deia",
    "name": "Deià",
    "region": "Mallorca, Spain",
    "score": 8.4,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "heidelberg",
    "name": "Heidelberg",
    "region": "Germany",
    "score": 8.4,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "hydra",
    "name": "Hydra",
    "region": "Greece",
    "score": 9.1,
    "photo": "own-hydra-harbour",
    "photos": [
      "own-hydra-harbour"
    ]
  },
  {
    "slug": "kyoto",
    "name": "Kyoto",
    "region": "Japan",
    "score": 8.9,
    "photo": "own-kyoto-blossom",
    "photos": [
      "own-kyoto-blossom",
      "own-kyoto-pagoda",
      "own-kyoto-river"
    ]
  },
  {
    "slug": "lisbon",
    "name": "Lisbon",
    "region": "Portugal",
    "score": 8.1,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "longleat",
    "name": "Longleat",
    "region": "England",
    "score": 8.7,
    "photo": null,
    "photos": []
  },
  {
    "slug": "madeira",
    "name": "Madeira",
    "region": "Portugal",
    "score": 8.3,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "maldives",
    "name": "The Maldives",
    "region": "Indian Ocean",
    "score": 9.4,
    "photo": "maldives-1",
    "photos": [
      "maldives-1",
      "own-maldives-sunset",
      "own-maldives-hammock",
      "own-maldives-turtle",
      "own-diving",
      "own-maldives-villas",
      "own-maldives-swings",
      "own-maldives-palms",
      "own-maldives-sunset-pool",
      "own-maldives-sunset-boat",
      "maldives-2"
    ]
  },
  {
    "slug": "marrakech",
    "name": "Marrakech",
    "region": "Morocco",
    "score": 8.2,
    "photo": "own-marrakech-koutoubia",
    "photos": [
      "own-marrakech-koutoubia",
      "own-marrakech-rooftops"
    ]
  },
  {
    "slug": "mauritius",
    "name": "Mauritius",
    "region": "Indian Ocean",
    "score": 8.8,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "orlando",
    "name": "Orlando",
    "region": "Florida, USA",
    "score": 8.0,
    "photo": "orlando-1",
    "photos": [
      "orlando-1"
    ]
  },
  {
    "slug": "oxford",
    "name": "Oxford",
    "region": "England",
    "score": 8.7,
    "photo": "oxford-1",
    "photos": [
      "oxford-1"
    ]
  },
  {
    "slug": "paris",
    "name": "Paris",
    "region": "France",
    "score": 8.4,
    "photo": "paris-1",
    "photos": [
      "paris-1",
      "own-paris-louvre",
      "own-paris-hotel-de-ville"
    ]
  },
  {
    "slug": "positano",
    "name": "Positano",
    "region": "Italy",
    "score": 8.6,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "puglia",
    "name": "Polignano a Mare",
    "region": "Puglia, Italy",
    "score": 8.8,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "seychelles",
    "name": "La Digue",
    "region": "Seychelles",
    "score": 9.2,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "sicily",
    "name": "Palermo",
    "region": "Sicily, Italy",
    "score": 8.5,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "stanton",
    "name": "St Anton",
    "region": "Austria",
    "score": 9.0,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "stives",
    "name": "St Ives",
    "region": "Cornwall, England",
    "score": 8.6,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "stratford",
    "name": "Stratford-upon-Avon",
    "region": "England",
    "score": 8.6,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "turks",
    "name": "Turks and Caicos",
    "region": "Caribbean",
    "score": 9.0,
    "photo": "own-turks-beach",
    "photos": [
      "own-turks-beach"
    ]
  },
  {
    "slug": "verbier",
    "name": "Verbier",
    "region": "Switzerland",
    "score": 8.9,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "warwick",
    "name": "Warwick Castle",
    "region": "England",
    "score": 8.8,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "york",
    "name": "York",
    "region": "England",
    "score": 8.9,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "zanzibar",
    "name": "Zanzibar",
    "region": "Tanzania",
    "score": 8.9,
    "photo": "own-zanzibar-hammock",
    "photos": [
      "own-zanzibar-hammock",
      "own-zanzibar-huts",
      "own-zanzibar-coast"
    ]
  },
  {
    "slug": "zermatt",
    "name": "Zermatt",
    "region": "Switzerland",
    "score": 8.8,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "comporta",
    "name": "Comporta",
    "region": "Portugal",
    "score": 9.0,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "chamonix",
    "name": "Chamonix",
    "region": "French Alps",
    "score": 8.6,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "courchevel",
    "name": "Courchevel",
    "region": "French Alps",
    "score": 8.7,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "valthorens",
    "name": "Val Thorens",
    "region": "French Alps",
    "score": 8.4,
    "photo": null,
    "photos": [
    ]
  },
  {
    "slug": "southafrica",
    "name": "South Africa",
    "region": "Cape Town & Kruger, South Africa",
    "score": 9.1,
    "photo": "own-safari-drive",
    "photos": [
      "own-safari-drive",
      "own-safari-giraffes",
      "own-safari-cheetahs",
      "own-safari-balloons"
    ]
  }
] as SamplePlace[];

export const trendingThisMonth: RowItem[] = [
  {
    "slug": "puglia",
    "rank": "#1 ↑3",
    "name": "Polignano a Mare",
    "sub": "+64% more postcards in October",
    "photo": null
  },
  {
    "slug": "madeira",
    "rank": "#2 ↑5",
    "name": "Madeira",
    "sub": "Most-saved for spring 2027",
    "photo": null
  },
  {
    "slug": "sicily",
    "rank": "#3 ↑1",
    "name": "Palermo",
    "sub": "+41% more postcards in October",
    "photo": null
  },
  {
    "slug": "hydra",
    "rank": "#4",
    "name": "Hydra",
    "sub": "Still the top-rated island this year",
    "photo": "own-hydra-harbour"
  },
  {
    "slug": "como",
    "rank": "#5 ↑2",
    "name": "Lake Como",
    "sub": "Saved by 4 of your friends",
    "photo": "como-1"
  },
  {
    "slug": "kyoto",
    "rank": "#6",
    "name": "Kyoto",
    "sub": "Top pick for autumn colours",
    "photo": "own-kyoto-blossom"
  }
] as RowItem[];

export const board: BoardItem[] = [
  {
    "photo": "maldives-1",
    "kind": "place",
    "score": 9.4,
    "name": "The Maldives, Indian Ocean",
    "sub": "Island · Beach · 3 friends",
    "slug": "maldives"
  },
  {
    "photo": "crete-1",
    "kind": "place",
    "score": 8.9,
    "name": "Crete, Greece",
    "sub": "Islands · Beach · Food · 5 friends",
    "slug": "crete"
  },
  {
    "photo": "orlando-1",
    "kind": "place",
    "score": 8.0,
    "name": "Orlando, Florida, USA",
    "sub": "Theme parks · Family · 6 friends",
    "slug": "orlando"
  },
  {
    "photo": null,
    "kind": "place",
    "score": 8.8,
    "name": "Polignano a Mare, Puglia, Italy",
    "sub": "Coast · Food · 3 friends",
    "slug": "puglia"
  },
  {
    "photo": null,
    "kind": "Collection",
    "name": "Weekends away",
    "sub": "Easy from London",
    "slug": null
  },
  {
    "photo": null,
    "kind": "Riad",
    "name": "Riad Zitoun",
    "sub": "Marrakech · from £120 a night · 9.1",
    "slug": null
  },
  {
    "photo": "paris-1",
    "kind": "place",
    "score": 8.4,
    "name": "Paris, France",
    "sub": "Weekend · 2h 16m by Eurostar",
    "slug": "paris"
  },
  {
    "photo": "food-pasta",
    "kind": "Eat",
    "name": "Mozzarella grilled on lemon leaves",
    "sub": "Da Adolfo, Positano · ££",
    "slug": "positano"
  },
  {
    "photo": "pool-1",
    "kind": "Collection",
    "name": "Infinity pools",
    "sub": "Villas friends rated 9+",
    "slug": null
  },
  {
    "photo": null,
    "kind": "Hidden gem",
    "name": "Carrasqueira pier",
    "sub": "Hidden gem in Comporta · found by Priya",
    "slug": "comporta"
  },
  {
    "photo": null,
    "kind": "place",
    "score": 8.6,
    "name": "St Ives, Cornwall, England",
    "sub": "Weekend · 5h train from Paddington",
    "slug": "stives"
  },
  {
    "photo": "own-hydra-harbour",
    "kind": "place",
    "score": 9.1,
    "name": "Hydra, Greece",
    "sub": "Islands · Slow · 4 friends",
    "slug": "hydra"
  },
  {
    "photo": "own-borabora-beach",
    "kind": "place",
    "score": 9.3,
    "name": "Bora Bora, French Polynesia",
    "sub": "Island · Beach · 2 friends",
    "slug": "borabora"
  },
  {
    "photo": "own-kyoto-blossom",
    "kind": "Culture · Festival",
    "name": "Gion Matsuri",
    "sub": "All of July · Kyoto, Japan",
    "slug": "kyoto"
  },
  {
    "photo": "bath-1",
    "kind": "One night away",
    "name": "One night in Bath",
    "sub": "95% match · About 1h20 by train",
    "slug": "bath"
  },
  {
    "photo": null,
    "kind": "Collection",
    "name": "Picnic season",
    "sub": "Where to spread a blanket",
    "slug": null
  },
  {
    "photo": null,
    "kind": "Do",
    "name": "Levada walk",
    "sub": "Hike · Madeira",
    "slug": "madeira"
  },
  {
    "photo": "como-2",
    "kind": "Villa",
    "name": "Villa Cipressi",
    "sub": "Lake Como · from £240 a night · 9.1",
    "slug": null
  },
  {
    "photo": null,
    "kind": "place",
    "score": 8.7,
    "name": "The Cotswolds, England",
    "sub": "Weekend · 1h 45m drive from London",
    "slug": "cotswolds"
  },
  {
    "photo": "umbrellas-1",
    "kind": "Collection",
    "name": "Beach clubs worth the sunbed",
    "sub": "6 friends' picks",
    "slug": null
  },
  {
    "photo": "own-kyoto-blossom",
    "kind": "Eat",
    "name": "Kaiseki dinner",
    "sub": "Gion Okumura, Kyoto · £££",
    "slug": "kyoto"
  },
  {
    "photo": null,
    "kind": "Collection",
    "name": "Cabins by the water",
    "sub": "Switch off for a weekend",
    "slug": null
  },
  {
    "photo": "own-copenhagen-nyhavn",
    "kind": "place",
    "score": 8.5,
    "name": "Copenhagen, Denmark",
    "sub": "Weekend · 1h 50m flight",
    "slug": "copenhagen"
  },
  {
    "photo": "own-marrakech-koutoubia",
    "kind": "Culture · Music",
    "name": "Jemaa el-Fnaa at dusk",
    "sub": "Marrakech, Morocco",
    "slug": "marrakech"
  },
  {
    "photo": null,
    "kind": "One night away",
    "name": "One night in Warwick Castle",
    "sub": "78% match · About 1h30 by train",
    "slug": "warwick"
  },
  {
    "photo": null,
    "kind": "Hidden gem",
    "name": "Fornillo beach",
    "sub": "Hidden gem in Positano · found by Priya",
    "slug": "positano"
  },
  {
    "photo": null,
    "kind": "place",
    "score": 8.1,
    "name": "Lisbon, Portugal",
    "sub": "Weekend · 2h 40m flight",
    "slug": "lisbon"
  },
  {
    "photo": null,
    "kind": "place",
    "score": 8.4,
    "name": "Heidelberg, Germany",
    "sub": "Weekend · 1h 30m flight to Frankfurt",
    "slug": "heidelberg"
  },
  {
    "photo": null,
    "kind": "place",
    "score": 9.2,
    "name": "La Digue, Seychelles",
    "sub": "Island · Beach · 2 friends",
    "slug": "seychelles"
  },
  {
    "photo": "own-zanzibar-hammock",
    "kind": "place",
    "score": 8.9,
    "name": "Zanzibar, Tanzania",
    "sub": "Island · Beach · 4 friends",
    "slug": "zanzibar"
  },
  {
    "photo": null,
    "kind": "Culture · Art",
    "name": "Puppet theatre",
    "sub": "Palermo, Sicily, Italy",
    "slug": "sicily"
  },
  {
    "photo": null,
    "kind": "Culture · Art",
    "name": "Barbara Hepworth's garden",
    "sub": "St Ives, Cornwall, England",
    "slug": "stives"
  },
  {
    "photo": null,
    "kind": "One night away",
    "name": "One night in York",
    "sub": "89% match · About 2h by train",
    "slug": "york"
  },
  {
    "photo": null,
    "kind": "One night away",
    "name": "One night in Cheltenham",
    "sub": "87% match · About 2h by train",
    "slug": "cheltenham"
  },
  {
    "photo": "oxford-1",
    "kind": "One night away",
    "name": "One night in Oxford",
    "sub": "88% match · About 1h by train",
    "slug": "oxford"
  },
  {
    "photo": null,
    "kind": "One night away",
    "name": "One night in Brighton",
    "sub": "93% match · About 1h by train",
    "slug": "brighton"
  },
  {
    "photo": null,
    "kind": "Eat",
    "name": "Steak frites and a carafe of red",
    "sub": "Le Bistrot d'à Côté, Paris · ££",
    "slug": "paris"
  },
  {
    "photo": "lemon-1",
    "kind": "Collection",
    "name": "Lemon season",
    "sub": "Amalfi, Sorrento, Sicily",
    "slug": null
  },
  {
    "photo": "villa-1",
    "kind": "Villa",
    "name": "Villa Limone",
    "sub": "Positano · from £520 a night · 9.0",
    "slug": null
  },
  {
    "photo": null,
    "kind": "Do",
    "name": "Sea cave boat trip",
    "sub": "Boat · Polignano a Mare",
    "slug": "puglia"
  },
  {
    "photo": "como-1",
    "kind": "place",
    "score": 8.7,
    "name": "Lake Como, Italy",
    "sub": "Lakes · Slow · 4 friends",
    "slug": "como"
  },
  {
    "photo": "own-marrakech-koutoubia",
    "kind": "Eat",
    "name": "Mint tea above the spice square",
    "sub": "Café des Épices, Marrakech · £",
    "slug": "marrakech"
  },
  {
    "photo": null,
    "kind": "Collection",
    "name": "Rooms with a sea view",
    "sub": "Friends rated 8+",
    "slug": null
  },
  {
    "photo": null,
    "kind": "Hidden gem",
    "name": "Porthgwidden",
    "sub": "Hidden gem in St Ives · found by Maya",
    "slug": "stives"
  },
  {
    "photo": null,
    "kind": "place",
    "score": 8.5,
    "name": "Palermo, Sicily, Italy",
    "sub": "City · Beach · 2 friends",
    "slug": "sicily"
  },
  {
    "photo": null,
    "kind": "place",
    "score": 8.8,
    "name": "Mauritius, Indian Ocean",
    "sub": "Island · Beach · 3 friends",
    "slug": "mauritius"
  },
  {
    "photo": "own-turks-beach",
    "kind": "place",
    "score": 9.0,
    "name": "Turks and Caicos, Caribbean",
    "sub": "Island · Beach · 2 friends",
    "slug": "turks"
  },
  {
    "photo": null,
    "kind": "Collection",
    "name": "Whitewashed islands",
    "sub": "Greece in June",
    "slug": null
  },
  {
    "photo": null,
    "kind": "Ryokan",
    "name": "Ryokan Hana",
    "sub": "Kyoto · from £310 a night · 9.3",
    "slug": null
  },
  {
    "photo": null,
    "kind": "Collection",
    "name": "Long lunches",
    "sub": "Tables friends never wanted to leave",
    "slug": null
  },
  {
    "photo": null,
    "kind": "place",
    "score": 8.3,
    "name": "Madeira, Portugal",
    "sub": "Hiking · Coast · 2 friends",
    "slug": "madeira"
  },
  {
    "photo": "own-copenhagen-nyhavn",
    "kind": "Do",
    "name": "Harbour swim",
    "sub": "Outdoors · Copenhagen",
    "slug": "copenhagen"
  },
  {
    "photo": "taverna-1",
    "kind": "Eat",
    "name": "Grilled octopus and fava",
    "sub": "Taverna Ostria, Hydra · ££",
    "slug": "hydra"
  },
  {
    "photo": "own-marrakech-koutoubia",
    "kind": "place",
    "score": 8.2,
    "name": "Marrakech, Morocco",
    "sub": "Weekend · 3h 30m flight",
    "slug": "marrakech"
  },
  {
    "photo": "food-wine",
    "kind": "Collection",
    "name": "Aperitivo hour",
    "sub": "Where friends watched the sunset",
    "slug": null
  },
  {
    "photo": "pool-2",
    "kind": "Villa",
    "name": "Casa Arrozal",
    "sub": "Comporta · from £280 a night · 8.9",
    "slug": null
  },
  {
    "photo": null,
    "kind": "Villa",
    "name": "Lakeside Pool Villa",
    "sub": "Orlando · from £290 a night · 8.8",
    "slug": null
  },
  {
    "photo": null,
    "kind": "Hidden gem",
    "name": "Loutro",
    "sub": "Hidden gem in Crete · found by Maya",
    "slug": "crete"
  },
  {
    "photo": null,
    "kind": "Do",
    "name": "Theme park days",
    "sub": "Family · Orlando",
    "slug": "orlando"
  },
  {
    "photo": null,
    "kind": "Do",
    "name": "Palace of Knossos",
    "sub": "Culture · Crete",
    "slug": "crete"
  },
  {
    "photo": null,
    "kind": "place",
    "score": 8.8,
    "name": "Zermatt, Switzerland",
    "sub": "Ski · Mountains · 3 friends",
    "slug": "zermatt"
  },
  {
    "photo": null,
    "kind": "place",
    "score": 8.9,
    "name": "Verbier, Switzerland",
    "sub": "Ski · Mountains · 3 friends",
    "slug": "verbier"
  },
  {
    "photo": null,
    "kind": "place",
    "score": 9.0,
    "name": "St Anton, Austria",
    "sub": "Ski · Après · 4 friends",
    "slug": "stanton"
  },
  {
    "photo": null,
    "kind": "Collection",
    "name": "Ski chalets",
    "sub": "Snow, fires and fondue",
    "slug": null
  }
] as BoardItem[];

export const friendsFeed: FeedItem[] = [
  {
    "who": "Maya",
    "face": null,
    "place": "Hydra",
    "region": "Greece",
    "month": "Jun 2026",
    "photo": null,
    "quote": "“No cars, just donkeys and swimming off the rocks.”",
    "score": 9.4,
    "stayType": "Hotel",
    "stayName": "Casa Ammos",
    "stayScore": 8.8,
    "slug": "hydra",
    "posted": "2 hours ago"
  },
  {
    "who": "Priya",
    "face": null,
    "place": "Positano",
    "region": "Italy",
    "month": "May 2026",
    "photo": null,
    "quote": "“Expensive but I'd go back tomorrow.”",
    "score": 9.2,
    "stayType": "Villa",
    "stayName": "Villa Limone",
    "stayScore": 9.0,
    "slug": "positano",
    "posted": "Yesterday"
  },
  {
    "who": "Tom",
    "face": null,
    "place": "Kyoto",
    "region": "Japan",
    "month": "Apr 2026",
    "photo": "own-kyoto-river",
    "quote": null,
    "score": 9.5,
    "stayType": "Ryokan",
    "stayName": "Ryokan Hana",
    "stayScore": 9.3,
    "slug": "kyoto",
    "posted": "3 days ago"
  },
  {
    "who": "Sophie",
    "face": null,
    "place": "South Africa",
    "region": "Cape Town & Kruger",
    "month": "Mar 2026",
    "photo": "own-safari-drive",
    "quote": "“Table Mountain in the morning, a wine farm for lunch, penguins by teatime.”",
    "score": 9.3,
    "stayType": "Hotel",
    "stayName": "Babylonstoren",
    "stayScore": 9.4,
    "slug": "southafrica",
    "posted": "Last week"
  },
  {
    "who": "Maya",
    "face": null,
    "place": "Marrakech",
    "region": "Morocco",
    "month": "Mar 2026",
    "photo": "own-marrakech-rooftops",
    "quote": null,
    "score": 9.0,
    "stayType": "Riad",
    "stayName": "Riad Zitoun",
    "stayScore": 9.1,
    "slug": "marrakech",
    "posted": "2 weeks ago"
  },
  {
    "who": "Jonah",
    "face": null,
    "place": "Zanzibar",
    "region": "Tanzania",
    "month": "Aug 2025",
    "photo": "own-zanzibar-coast",
    "quote": "“Stone Town at dusk, then a week on the beach. Perfect mix.”",
    "score": 8.9,
    "stayType": "Hotel",
    "stayName": "Zuri Zanzibar",
    "stayScore": 9.0,
    "slug": "zanzibar",
    "posted": "Last month"
  }
] as FeedItem[];

export const boards: Board[] = [
  {
    "name": "Places to eat",
    "meta": "6 saves",
    "photos": [
      "food-pasta",
    ]
  },
  {
    "name": "Summer 2027",
    "meta": "5 saves · shared with 2",
    "photos": [
      "pool-1"
    ]
  },
  {
    "name": "2027 list",
    "meta": "3 saves",
    "photos": [
      "crete-1",
      "maldives-1"
    ]
  },
  {
    "name": "One day",
    "meta": "3 saves",
    "photos": [
    ]
  }
] as Board[];

export const samplePostcards: SamplePostcard[] = [
  {
    "who": "Tom",
    "text": "rated Kyoto 9.5. It's on your Want to go board ★",
    "when": "1h",
    "photo": null,
    "slug": "kyoto"
  },
  {
    "who": "Tom",
    "text": "sent you a postcard from Kyoto",
    "when": "2h",
    "photo": null,
    "slug": "kyoto"
  },
  {
    "who": "Priya",
    "text": "rated Villa Limone 9.0, a villa you saved",
    "when": "Yesterday",
    "photo": null,
    "slug": "positano"
  },
  {
    "who": "Maya",
    "text": "rated the Maldives 9.4. It's on your Want to go board ★",
    "when": "Wed",
    "photo": "maldives-1",
    "slug": "maldives"
  },
  {
    "who": "{app}",
    "text": "Polignano a Mare is trending. Two friends went this autumn",
    "when": "Tue",
    "photo": null,
    "slug": "puglia"
  },
  {
    "who": "Maya",
    "text": "and 3 friends have been to Hydra. It's 9.1 for you",
    "when": "Mon",
    "photo": null,
    "slug": "hydra"
  },
  {
    "who": "Jonah",
    "text": "joined {app}. You're both now sharing ratings",
    "when": "Last week",
    "photo": null,
    "slug": "deia"
  }
] as SamplePostcard[];

export const collections: Collection[] = [
  {
    "name": "Island escapes",
    "photo": "maldives-2",
    "filter": "islands"
  },
  {
    "name": "Weekends away",
    "photo": null,
    "filter": "weekends"
  },
  {
    "name": "One night away",
    "photo": null,
    "filter": "overnight"
  },
  {
    "name": "Hidden gems",
    "photo": null,
    "filter": "gems"
  },
  {
    "name": "Culture",
    "photo": null,
    "filter": "culture"
  },
  {
    "name": "Places to stay",
    "photo": "pool-1",
    "filter": "stays"
  },
  {
    "name": "Eat & drink",
    "photo": null,
    "filter": "food"
  },
  {
    "name": "Things to do",
    "photo": null,
    "filter": "todo"
  },
  {
    "name": "Destinations",
    "photo": null,
    "filter": "destinations"
  }
] as Collection[];

/** "Made for your taste" filter chips → which items they show. */
export const TASTES: { label: string; match: (t: TasteItem) => boolean }[] = [
  { label: 'All', match: () => true },
  { label: 'Cute cafés', match: (t) => t.kind === 'Café' },
  { label: 'Seafood by the water', match: (t) => t.kind === 'Eat' },
  { label: 'Small stays with a pool or garden', match: (t) => t.kind === 'Stay' },
  { label: 'Sunset drinks', match: (t) => t.kind === 'Drink' },
  { label: 'Art first thing', match: (t) => t.kind === 'Do' },
];


export function getPlace(slug: string): SamplePlace | undefined {
  return places.find((p) => p.slug === slug);
}

/**
 * The owner's own holiday photos for places that have no sample place page (yet), so a trip or a
 * board place there gets a real photo instead of a blank (owner, Nov 2026). Keys are plain lower case.
 */
const OWN_PLACE_PHOTOS: Record<string, PhotoName | PhotoName[]> = {
  corfu: 'own-corfu', kerkyra: 'own-corfu', kassiopi: 'own-corfu', paleokastritsa: 'own-corfu',
  dubai: 'own-dubai', 'united arab emirates': 'own-dubai',
  tenerife: ['own-tenerife', 'own-tenerife-beach'], 'santa cruz de tenerife': ['own-tenerife', 'own-tenerife-beach'], 'puerto de la cruz': ['own-tenerife', 'own-tenerife-beach'], adeje: ['own-tenerife', 'own-tenerife-beach'], 'costa adeje': ['own-tenerife', 'own-tenerife-beach'], 'playa de las americas': ['own-tenerife', 'own-tenerife-beach'], 'los cristianos': ['own-tenerife', 'own-tenerife-beach'],
  venice: ['own-venice-salute', 'lemon-1'], venezia: ['own-venice-salute', 'lemon-1'], // lemon-1 is the owner's Venice palazzo photo
  singapore: ['own-singapore', 'own-singapore-flyer', 'own-singapore-jewel', 'own-singapore-temple'],
  'new york': ['own-new-york', 'own-new-york-sunset', 'own-new-york-central-park', 'own-new-york-rooftop', 'own-new-york-pier', 'own-new-york-liberty'], 'new york city': ['own-new-york', 'own-new-york-sunset', 'own-new-york-central-park', 'own-new-york-rooftop', 'own-new-york-pier', 'own-new-york-liberty'], nyc: ['own-new-york', 'own-new-york-sunset', 'own-new-york-central-park', 'own-new-york-rooftop', 'own-new-york-pier', 'own-new-york-liberty'], manhattan: ['own-new-york', 'own-new-york-sunset', 'own-new-york-central-park', 'own-new-york-rooftop', 'own-new-york-pier', 'own-new-york-liberty'],
  milan: ['own-milan', 'own-milan-galleria'], milano: ['own-milan', 'own-milan-galleria'],
  zurich: 'own-zurich', 'lake zurich': 'own-zurich',
  tuscany: 'own-tuscany', chianti: 'own-tuscany', 'val d orcia': 'own-tuscany', siena: 'own-tuscany',
  mallorca: ['own-mallorca', 'own-mallorca-villa', 'own-mallorca-pergola'], majorca: ['own-mallorca', 'own-mallorca-villa', 'own-mallorca-pergola'], palma: ['own-mallorca', 'own-mallorca-villa', 'own-mallorca-pergola'], 'palma de mallorca': ['own-mallorca', 'own-mallorca-villa', 'own-mallorca-pergola'],
  algarve: ['own-algarve', 'own-algarve-pool', 'own-algarve-path'], faro: ['own-algarve', 'own-algarve-pool', 'own-algarve-path'], 'vale do lobo': ['own-algarve', 'own-algarve-pool', 'own-algarve-path'], 'quinta do lago': ['own-algarve', 'own-algarve-pool', 'own-algarve-path'],
  cyprus: 'own-cyprus-bridge', 'ayia napa': 'own-cyprus-bridge', protaras: 'own-cyprus-bridge', paphos: 'own-cyprus-bridge', limassol: 'own-cyprus-bridge',
  'costa brava': 'own-costa-brava', begur: 'own-costa-brava', 'tossa de mar': 'own-costa-brava',
  kitzbuhel: 'own-kitzbuehel', kitzbuehel: 'own-kitzbuehel',
  'val d isere': 'own-val-disere',
  'lake louise': 'own-canada', banff: 'own-canada', 'banff national park': 'own-canada',
  'las vegas': 'own-las-vegas', vegas: 'own-las-vegas',
  'san francisco': 'own-san-francisco',
  whitsundays: 'own-whitsundays', 'whitsunday islands': 'own-whitsundays', 'whitehaven beach': 'own-whitsundays', 'airlie beach': 'own-whitsundays', 'hamilton island': 'own-hamilton-island',
  'walt disney world': 'orlando-1', 'disney world': 'orlando-1', 'magic kingdom': 'orlando-1', kissimmee: 'orlando-1', // orlando-1 is the owner's Disney photo
  avoriaz: 'own-skiing',
  'las vegas strip': 'own-las-vegas-strip', 'the strip': 'own-las-vegas-strip', bellagio: 'own-las-vegas-strip',
  'victoria falls': ['own-victoria-falls', 'own-victoria-falls-sunset'], livingstone: ['own-victoria-falls', 'own-victoria-falls-sunset'], 'mosi oa tunya': ['own-victoria-falls', 'own-victoria-falls-sunset'], zimbabwe: ['own-victoria-falls', 'own-victoria-falls-sunset'], zambia: ['own-victoria-falls', 'own-victoria-falls-sunset'], hwange: 'own-victoria-falls-sunset', 'hwange national park': 'own-victoria-falls-sunset',
  rottnest: 'own-rottnest', 'rottnest island': 'own-rottnest',
  'statue of liberty': 'own-new-york-liberty', 'central park': 'own-new-york-central-park', 'marina bay': 'own-singapore-flyer', 'jewel changi': 'own-singapore-jewel',
  zanzibar: ['own-zanzibar-hammock', 'own-zanzibar-huts', 'own-zanzibar-coast'], 'stone town': 'own-zanzibar-coast', nungwi: 'own-zanzibar-huts', paje: 'own-zanzibar-hammock',
  tanzania: 'own-kilimanjaro-giraffe', kilimanjaro: 'own-kilimanjaro-giraffe', 'mount kilimanjaro': 'own-kilimanjaro-giraffe', arusha: 'own-kilimanjaro-giraffe', serengeti: 'own-kilimanjaro-giraffe', 'ngorongoro crater': 'own-kilimanjaro-giraffe', amboseli: 'own-kilimanjaro-giraffe',
  'bora bora': ['own-borabora-beach', 'own-borabora-pool', 'own-borabora-fish', 'own-water-villas'], 'french polynesia': ['own-borabora-beach', 'own-borabora-pool'],
  kyoto: ['own-kyoto-blossom', 'own-kyoto-pagoda', 'own-kyoto-river'], arashiyama: 'own-kyoto-river', 'mount fuji': 'own-kyoto-pagoda', japan: ['own-kyoto-blossom', 'own-kyoto-pagoda'],
  marrakech: ['own-marrakech-koutoubia', 'own-marrakech-rooftops'], morocco: ['own-marrakech-koutoubia', 'own-marrakech-rooftops'],
  'south africa': 'own-safari-drive', kruger: 'own-safari-drive', 'kruger national park': 'own-safari-drive', 'sabi sands': 'own-safari-drive',
};

const plainName = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * A sample photo for a place name you typed (e.g. your trip to "Lisbon"), if we have one. Where the
 * owner has several photos of a place, `seed` (a trip's or board item's id) picks one, so two trips
 * to New York don't look the same.
 */
export function photoForPlaceName(name: string, seed = ''): PhotoName | null {
  const n = name.trim().toLowerCase();
  const p = places.find((x) => x.name.toLowerCase() === n || x.slug === n || x.name.toLowerCase().replace(/^the /, '') === n);
  if (p) return p.photo;
  const key = plainName(name).replace(/^the /, '');
  const own = OWN_PLACE_PHOTOS[key];
  if (!own) return null;
  if (!Array.isArray(own)) return own;
  const pick = [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
  return own[pick % own.length];
}

/** Everything in the sample content about one place (for its page). */
export function aboutPlace(slug: string) {
  return {
    said: friendsFeed.filter((f) => f.slug === slug),
    ideas: [...rows.taste.filter((t) => t.slug === slug).map((t) => ({ kind: t.kind, name: t.name, sub: t.because, photo: t.photo })),
      ...board.filter((b) => b.slug === slug && b.kind !== 'place').map((b) => ({ kind: b.kind, name: b.name, sub: b.sub, photo: b.photo }))],
  };
}
