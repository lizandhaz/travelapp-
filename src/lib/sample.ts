import type { PhotoName } from './photos';

/**
 * Sample content, taken from the design prototype (the "… without planning" artifact).
 * It fills Home, Explore, Saved, Postcards and place pages until those parts
 * become real (see docs/plan.md, Steps C–H). Your own trips are real (lib/trips.ts).
 * Scores are out of 10 with one decimal place.
 */

export type SamplePlace = { slug: string; name: string; region: string; score: number | null; photo: PhotoName; photos: PhotoName[] };
export type RowItem = { slug: string; name: string; sub: string; photo: PhotoName; score?: number; rank?: string };
export type TasteItem = { slug: string; kind: string; match: string; name: string; where: string; because: string; friends: string; photo: PhotoName };
export type BoardItem = { slug: string | null; kind: string; name: string; sub: string; photo: PhotoName; score?: number };
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
export type Collection = { name: string; photo: PhotoName; filter: string };

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
      "photo": "puglia-1"
    },
    {
      "slug": "madeira",
      "rank": "#2",
      "name": "Madeira",
      "sub": "Portugal",
      "photo": "madeira-1"
    },
    {
      "slug": "sicily",
      "rank": "#3",
      "name": "Palermo",
      "sub": "Sicily, Italy",
      "photo": "sicily-1"
    },
    {
      "slug": "hydra",
      "rank": "#4",
      "name": "Hydra",
      "sub": "Greece",
      "photo": "hydra-2"
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
      "photo": "borabora-1"
    },
    {
      "slug": "seychelles",
      "score": 9.2,
      "name": "La Digue",
      "sub": "Seychelles",
      "photo": "seychelles-1"
    },
    {
      "slug": "turks",
      "score": 9.0,
      "name": "Turks and Caicos",
      "sub": "Caribbean",
      "photo": "turks-1"
    },
    {
      "slug": "zanzibar",
      "score": 8.9,
      "name": "Zanzibar",
      "sub": "Tanzania",
      "photo": "zanzibar-1"
    },
    {
      "slug": "mauritius",
      "score": 8.8,
      "name": "Mauritius",
      "sub": "Indian Ocean",
      "photo": "mauritius-1"
    }
  ],
  "weekends": [
    {
      "slug": "cotswolds",
      "score": 8.7,
      "name": "The Cotswolds",
      "sub": "1h 45m drive from London",
      "photo": "cotswolds-1"
    },
    {
      "slug": "stives",
      "score": 8.6,
      "name": "St Ives",
      "sub": "5h train from Paddington",
      "photo": "stives-1"
    },
    {
      "slug": "copenhagen",
      "score": 8.5,
      "name": "Copenhagen",
      "sub": "1h 50m flight",
      "photo": "copenhagen-1"
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
      "photo": "heidelberg-1"
    },
    {
      "slug": "marrakech",
      "score": 8.2,
      "name": "Marrakech",
      "sub": "3h 30m flight",
      "photo": "marrakech-2"
    },
    {
      "slug": "lisbon",
      "score": 8.1,
      "name": "Lisbon",
      "sub": "2h 40m flight",
      "photo": "lisbon-1"
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
      "photo": "cambridge-1"
    },
    {
      "slug": "york",
      "score": 8.9,
      "name": "York",
      "sub": "About 2h by train",
      "photo": "york-1"
    },
    {
      "slug": "cheltenham",
      "score": 8.8,
      "name": "Cheltenham",
      "sub": "About 2h by train",
      "photo": "cheltenham-1"
    },
    {
      "slug": "warwick",
      "score": 8.8,
      "name": "Warwick Castle",
      "sub": "About 1h30 by train",
      "photo": "warwick-1"
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
      "photo": "safari-1"
    },
    {
      "slug": "stratford",
      "score": 8.6,
      "name": "Stratford-upon-Avon",
      "sub": "About 2h by train",
      "photo": "stratford-1"
    },
    {
      "slug": "brighton",
      "score": 8.4,
      "name": "Brighton",
      "sub": "About 1h by train",
      "photo": "brighton-1"
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
      "photo": "kyoto-2"
    },
    {
      "slug": "lisbon",
      "kind": "Café",
      "match": "96% match",
      "name": "Café Pátio Azul",
      "where": "Lisbon, Portugal",
      "because": "Because you loved the corner boulangerie in Paris",
      "friends": "New to your friends. Found by {app}",
      "photo": "cafe-2"
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
      "photo": "picnic-1"
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
      "photo": "lisbon-1"
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
      "photo": "cafe-1"
    },
    {
      "slug": "crete",
      "kind": "Drink",
      "match": "92% match",
      "name": "Sunset at Falassarna",
      "where": "Crete, Greece",
      "because": "Because you loved Pego beach at 8pm",
      "friends": "1 friend has been too",
      "photo": "crete-3"
    },
    {
      "slug": "copenhagen",
      "kind": "Do",
      "match": "91% match",
      "name": "Louisiana museum",
      "where": "Copenhagen, Denmark",
      "because": "Because you gave the Orangerie a 9.2",
      "friends": "1 friend has been too",
      "photo": "copenhagen-2"
    },
    {
      "slug": "stives",
      "kind": "Eat",
      "match": "90% match",
      "name": "Porthminster Beach Café",
      "where": "St Ives, Cornwall, England",
      "because": "Because you gave Sal in Comporta a 9.0",
      "friends": "1 friend has been too",
      "photo": "stives-2"
    },
    {
      "slug": "hydra",
      "kind": "Stay",
      "match": "90% match",
      "name": "Casa Ammos",
      "where": "Hydra, Greece",
      "because": "Because you gave Villa Limone a 9.0",
      "friends": "2 friends have been too",
      "photo": "balcony-2"
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
      "photo": "cafe-1"
    },
    {
      "slug": "heidelberg",
      "kind": "Drink",
      "match": "89% match",
      "name": "Philosophers' Walk at golden hour",
      "where": "Heidelberg, Germany",
      "because": "Because you loved Pego beach at 8pm",
      "friends": "1 friend has been too",
      "photo": "heidelberg-2"
    },
    {
      "slug": "stives",
      "kind": "Do",
      "match": "88% match",
      "name": "Tate St Ives",
      "where": "St Ives, Cornwall, England",
      "because": "Because you gave the Orangerie a 9.2",
      "friends": "New to your friends. Found by {app}",
      "photo": "stives-1"
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
      "photo": "crete-5"
    },
    {
      "slug": "orlando",
      "kind": "Café",
      "match": "86% match",
      "name": "Winter Park brunch",
      "where": "Orlando, Florida, USA",
      "because": "Because you loved the corner boulangerie in Paris",
      "friends": "1 friend has been too",
      "photo": "picnic-1"
    },
    {
      "slug": "crete",
      "kind": "Do",
      "match": "86% match",
      "name": "Knossos at opening",
      "where": "Crete, Greece",
      "because": "Because you gave the Orangerie a 9.2",
      "friends": "New to your friends. Found by {app}",
      "photo": "crete-4"
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
      "photo": "heidelberg-1"
    }
  ],
  "picked": [
    {
      "slug": "hydra",
      "score": 9.1,
      "name": "Hydra",
      "sub": "Greece",
      "photo": "hydra-2"
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
      "photo": "kyoto-1"
    },
    {
      "slug": "positano",
      "score": 8.6,
      "name": "Positano",
      "sub": "Italy",
      "photo": "positano-1"
    },
    {
      "slug": "deia",
      "score": 8.4,
      "name": "Deià",
      "sub": "Mallorca, Spain",
      "photo": "deia-1"
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
    "photo": "borabora-1",
    "photos": [
      "borabora-1"
    ]
  },
  {
    "slug": "brighton",
    "name": "Brighton",
    "region": "England",
    "score": 8.4,
    "photo": "brighton-1",
    "photos": [
      "brighton-1"
    ]
  },
  {
    "slug": "cambridge",
    "name": "Cambridge",
    "region": "England",
    "score": 8.9,
    "photo": "cambridge-1",
    "photos": [
      "cambridge-1"
    ]
  },
  {
    "slug": "cheltenham",
    "name": "Cheltenham",
    "region": "England",
    "score": 8.8,
    "photo": "cheltenham-1",
    "photos": [
      "cheltenham-1"
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
    "photo": "copenhagen-1",
    "photos": [
      "copenhagen-1",
      "copenhagen-2"
    ]
  },
  {
    "slug": "cotswolds",
    "name": "The Cotswolds",
    "region": "England",
    "score": 8.7,
    "photo": "cotswolds-1",
    "photos": [
      "cotswolds-1"
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
    "photo": "deia-1",
    "photos": [
      "deia-1"
    ]
  },
  {
    "slug": "heidelberg",
    "name": "Heidelberg",
    "region": "Germany",
    "score": 8.4,
    "photo": "heidelberg-1",
    "photos": [
      "heidelberg-1",
      "heidelberg-2"
    ]
  },
  {
    "slug": "hydra",
    "name": "Hydra",
    "region": "Greece",
    "score": 9.1,
    "photo": "hydra-2",
    "photos": [
      "hydra-2",
      "hydra-1"
    ]
  },
  {
    "slug": "kyoto",
    "name": "Kyoto",
    "region": "Japan",
    "score": 8.9,
    "photo": "kyoto-1",
    "photos": [
      "kyoto-1"
    ]
  },
  {
    "slug": "lisbon",
    "name": "Lisbon",
    "region": "Portugal",
    "score": 8.1,
    "photo": "lisbon-1",
    "photos": [
      "lisbon-1"
    ]
  },
  {
    "slug": "longleat",
    "name": "Longleat",
    "region": "England",
    "score": 8.7,
    "photo": "safari-1",
    "photos": [
      "safari-1"
    ]
  },
  {
    "slug": "madeira",
    "name": "Madeira",
    "region": "Portugal",
    "score": 8.3,
    "photo": "madeira-1",
    "photos": [
      "madeira-1"
    ]
  },
  {
    "slug": "maldives",
    "name": "The Maldives",
    "region": "Indian Ocean",
    "score": 9.4,
    "photo": "maldives-1",
    "photos": [
      "maldives-1"
    ]
  },
  {
    "slug": "marrakech",
    "name": "Marrakech",
    "region": "Morocco",
    "score": 8.2,
    "photo": "marrakech-2",
    "photos": [
      "marrakech-2",
      "marrakech-1"
    ]
  },
  {
    "slug": "mauritius",
    "name": "Mauritius",
    "region": "Indian Ocean",
    "score": 8.8,
    "photo": "mauritius-1",
    "photos": [
      "mauritius-1"
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
      "paris-1"
    ]
  },
  {
    "slug": "positano",
    "name": "Positano",
    "region": "Italy",
    "score": 8.6,
    "photo": "positano-1",
    "photos": [
      "positano-1"
    ]
  },
  {
    "slug": "puglia",
    "name": "Polignano a Mare",
    "region": "Puglia, Italy",
    "score": 8.8,
    "photo": "puglia-1",
    "photos": [
      "puglia-1"
    ]
  },
  {
    "slug": "seychelles",
    "name": "La Digue",
    "region": "Seychelles",
    "score": 9.2,
    "photo": "seychelles-1",
    "photos": [
      "seychelles-1"
    ]
  },
  {
    "slug": "sicily",
    "name": "Palermo",
    "region": "Sicily, Italy",
    "score": 8.5,
    "photo": "sicily-1",
    "photos": [
      "sicily-1"
    ]
  },
  {
    "slug": "stanton",
    "name": "St Anton",
    "region": "Austria",
    "score": 9.0,
    "photo": "stanton-1",
    "photos": [
      "stanton-1"
    ]
  },
  {
    "slug": "stives",
    "name": "St Ives",
    "region": "Cornwall, England",
    "score": 8.6,
    "photo": "stives-1",
    "photos": [
      "stives-1"
    ]
  },
  {
    "slug": "stratford",
    "name": "Stratford-upon-Avon",
    "region": "England",
    "score": 8.6,
    "photo": "stratford-1",
    "photos": [
      "stratford-1"
    ]
  },
  {
    "slug": "turks",
    "name": "Turks and Caicos",
    "region": "Caribbean",
    "score": 9.0,
    "photo": "turks-1",
    "photos": [
      "turks-1",
      "turks-2"
    ]
  },
  {
    "slug": "verbier",
    "name": "Verbier",
    "region": "Switzerland",
    "score": 8.9,
    "photo": "verbier-1",
    "photos": [
      "verbier-1"
    ]
  },
  {
    "slug": "warwick",
    "name": "Warwick Castle",
    "region": "England",
    "score": 8.8,
    "photo": "warwick-1",
    "photos": [
      "warwick-1"
    ]
  },
  {
    "slug": "york",
    "name": "York",
    "region": "England",
    "score": 8.9,
    "photo": "york-1",
    "photos": [
      "york-1"
    ]
  },
  {
    "slug": "zanzibar",
    "name": "Zanzibar",
    "region": "Tanzania",
    "score": 8.9,
    "photo": "zanzibar-1",
    "photos": [
      "zanzibar-1",
      "zanzibar-2"
    ]
  },
  {
    "slug": "zermatt",
    "name": "Zermatt",
    "region": "Switzerland",
    "score": 8.8,
    "photo": "zermatt-3",
    "photos": [
      "zermatt-3"
    ]
  },
  {
    "slug": "comporta",
    "name": "Comporta",
    "region": "Portugal",
    "score": 9.0,
    "photo": "comporta-1",
    "photos": [
      "comporta-1"
    ]
  },
  {
    "slug": "chamonix",
    "name": "Chamonix",
    "region": "French Alps",
    "score": 8.6,
    "photo": "chamonix-1",
    "photos": [
      "chamonix-1"
    ]
  },
  {
    "slug": "courchevel",
    "name": "Courchevel",
    "region": "French Alps",
    "score": 8.7,
    "photo": "courchevel-1",
    "photos": [
      "courchevel-1"
    ]
  },
  {
    "slug": "valthorens",
    "name": "Val Thorens",
    "region": "French Alps",
    "score": 8.4,
    "photo": "valthorens-1",
    "photos": [
      "valthorens-1"
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
    "photo": "puglia-1"
  },
  {
    "slug": "madeira",
    "rank": "#2 ↑5",
    "name": "Madeira",
    "sub": "Most-saved for spring 2027",
    "photo": "madeira-1"
  },
  {
    "slug": "sicily",
    "rank": "#3 ↑1",
    "name": "Palermo",
    "sub": "+41% more postcards in October",
    "photo": "sicily-1"
  },
  {
    "slug": "hydra",
    "rank": "#4",
    "name": "Hydra",
    "sub": "Still the top-rated island this year",
    "photo": "hydra-2"
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
    "photo": "kyoto-1"
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
    "photo": "puglia-1",
    "kind": "place",
    "score": 8.8,
    "name": "Polignano a Mare, Puglia, Italy",
    "sub": "Coast · Food · 3 friends",
    "slug": "puglia"
  },
  {
    "photo": "cotswolds-2",
    "kind": "Collection",
    "name": "Weekends away",
    "sub": "Easy from London",
    "slug": null
  },
  {
    "photo": "marrakech-2",
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
    "photo": "comporta-1",
    "kind": "Hidden gem",
    "name": "Carrasqueira pier",
    "sub": "Hidden gem in Comporta · found by Priya",
    "slug": "comporta"
  },
  {
    "photo": "stives-1",
    "kind": "place",
    "score": 8.6,
    "name": "St Ives, Cornwall, England",
    "sub": "Weekend · 5h train from Paddington",
    "slug": "stives"
  },
  {
    "photo": "hydra-1",
    "kind": "place",
    "score": 9.1,
    "name": "Hydra, Greece",
    "sub": "Islands · Slow · 4 friends",
    "slug": "hydra"
  },
  {
    "photo": "borabora-1",
    "kind": "place",
    "score": 9.3,
    "name": "Bora Bora, French Polynesia",
    "sub": "Island · Beach · 2 friends",
    "slug": "borabora"
  },
  {
    "photo": "kyoto-1",
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
    "photo": "picnic-1",
    "kind": "Collection",
    "name": "Picnic season",
    "sub": "Where to spread a blanket",
    "slug": null
  },
  {
    "photo": "madeira-1",
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
    "photo": "cotswolds-1",
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
    "photo": "kaiseki-1",
    "kind": "Eat",
    "name": "Kaiseki dinner",
    "sub": "Gion Okumura, Kyoto · £££",
    "slug": "kyoto"
  },
  {
    "photo": "cabin-1",
    "kind": "Collection",
    "name": "Cabins by the water",
    "sub": "Switch off for a weekend",
    "slug": null
  },
  {
    "photo": "copenhagen-2",
    "kind": "place",
    "score": 8.5,
    "name": "Copenhagen, Denmark",
    "sub": "Weekend · 1h 50m flight",
    "slug": "copenhagen"
  },
  {
    "photo": "marrakech-3",
    "kind": "Culture · Music",
    "name": "Jemaa el-Fnaa at dusk",
    "sub": "Marrakech, Morocco",
    "slug": "marrakech"
  },
  {
    "photo": "warwick-1",
    "kind": "One night away",
    "name": "One night in Warwick Castle",
    "sub": "78% match · About 1h30 by train",
    "slug": "warwick"
  },
  {
    "photo": "lemon-2",
    "kind": "Hidden gem",
    "name": "Fornillo beach",
    "sub": "Hidden gem in Positano · found by Priya",
    "slug": "positano"
  },
  {
    "photo": "lisbon-1",
    "kind": "place",
    "score": 8.1,
    "name": "Lisbon, Portugal",
    "sub": "Weekend · 2h 40m flight",
    "slug": "lisbon"
  },
  {
    "photo": "heidelberg-2",
    "kind": "place",
    "score": 8.4,
    "name": "Heidelberg, Germany",
    "sub": "Weekend · 1h 30m flight to Frankfurt",
    "slug": "heidelberg"
  },
  {
    "photo": "seychelles-1",
    "kind": "place",
    "score": 9.2,
    "name": "La Digue, Seychelles",
    "sub": "Island · Beach · 2 friends",
    "slug": "seychelles"
  },
  {
    "photo": "zanzibar-2",
    "kind": "place",
    "score": 8.9,
    "name": "Zanzibar, Tanzania",
    "sub": "Island · Beach · 4 friends",
    "slug": "zanzibar"
  },
  {
    "photo": "sicily-1",
    "kind": "Culture · Art",
    "name": "Puppet theatre",
    "sub": "Palermo, Sicily, Italy",
    "slug": "sicily"
  },
  {
    "photo": "stives-2",
    "kind": "Culture · Art",
    "name": "Barbara Hepworth's garden",
    "sub": "St Ives, Cornwall, England",
    "slug": "stives"
  },
  {
    "photo": "york-1",
    "kind": "One night away",
    "name": "One night in York",
    "sub": "89% match · About 2h by train",
    "slug": "york"
  },
  {
    "photo": "cheltenham-1",
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
    "photo": "brighton-1",
    "kind": "One night away",
    "name": "One night in Brighton",
    "sub": "93% match · About 1h by train",
    "slug": "brighton"
  },
  {
    "photo": "paris-2",
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
    "photo": "puglia-2",
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
    "photo": "minttea-1",
    "kind": "Eat",
    "name": "Mint tea above the spice square",
    "sub": "Café des Épices, Marrakech · £",
    "slug": "marrakech"
  },
  {
    "photo": "balcony-2",
    "kind": "Collection",
    "name": "Rooms with a sea view",
    "sub": "Friends rated 8+",
    "slug": null
  },
  {
    "photo": "stives-2",
    "kind": "Hidden gem",
    "name": "Porthgwidden",
    "sub": "Hidden gem in St Ives · found by Maya",
    "slug": "stives"
  },
  {
    "photo": "sicily-1",
    "kind": "place",
    "score": 8.5,
    "name": "Palermo, Sicily, Italy",
    "sub": "City · Beach · 2 friends",
    "slug": "sicily"
  },
  {
    "photo": "mauritius-1",
    "kind": "place",
    "score": 8.8,
    "name": "Mauritius, Indian Ocean",
    "sub": "Island · Beach · 3 friends",
    "slug": "mauritius"
  },
  {
    "photo": "turks-2",
    "kind": "place",
    "score": 9.0,
    "name": "Turks and Caicos, Caribbean",
    "sub": "Island · Beach · 2 friends",
    "slug": "turks"
  },
  {
    "photo": "mykonos-1",
    "kind": "Collection",
    "name": "Whitewashed islands",
    "sub": "Greece in June",
    "slug": null
  },
  {
    "photo": "kyoto-2",
    "kind": "Ryokan",
    "name": "Ryokan Hana",
    "sub": "Kyoto · from £310 a night · 9.3",
    "slug": null
  },
  {
    "photo": "picnic-2",
    "kind": "Collection",
    "name": "Long lunches",
    "sub": "Tables friends never wanted to leave",
    "slug": null
  },
  {
    "photo": "madeira-1",
    "kind": "place",
    "score": 8.3,
    "name": "Madeira, Portugal",
    "sub": "Hiking · Coast · 2 friends",
    "slug": "madeira"
  },
  {
    "photo": "copenhagen-1",
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
    "photo": "marrakech-1",
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
    "photo": "orlando-5",
    "kind": "Villa",
    "name": "Lakeside Pool Villa",
    "sub": "Orlando · from £290 a night · 8.8",
    "slug": null
  },
  {
    "photo": "crete-3",
    "kind": "Hidden gem",
    "name": "Loutro",
    "sub": "Hidden gem in Crete · found by Maya",
    "slug": "crete"
  },
  {
    "photo": "orlando-3",
    "kind": "Do",
    "name": "Theme park days",
    "sub": "Family · Orlando",
    "slug": "orlando"
  },
  {
    "photo": "crete-4",
    "kind": "Do",
    "name": "Palace of Knossos",
    "sub": "Culture · Crete",
    "slug": "crete"
  },
  {
    "photo": "zermatt-3",
    "kind": "place",
    "score": 8.8,
    "name": "Zermatt, Switzerland",
    "sub": "Ski · Mountains · 3 friends",
    "slug": "zermatt"
  },
  {
    "photo": "verbier-1",
    "kind": "place",
    "score": 8.9,
    "name": "Verbier, Switzerland",
    "sub": "Ski · Mountains · 3 friends",
    "slug": "verbier"
  },
  {
    "photo": "stanton-1",
    "kind": "place",
    "score": 9.0,
    "name": "St Anton, Austria",
    "sub": "Ski · Après · 4 friends",
    "slug": "stanton"
  },
  {
    "photo": "chalet-1",
    "kind": "Collection",
    "name": "Ski chalets",
    "sub": "Snow, fires and fondue",
    "slug": null
  }
] as BoardItem[];

export const friendsFeed: FeedItem[] = [
  {
    "who": "Maya",
    "face": "face-maya",
    "place": "Hydra",
    "region": "Greece",
    "month": "Jun 2026",
    "photo": "hydra-1",
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
    "face": "face-priya",
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
    "face": "face-tom",
    "place": "Kyoto",
    "region": "Japan",
    "month": "Apr 2026",
    "photo": "kyoto-1",
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
    "face": "face-sophie",
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
    "face": "face-maya",
    "place": "Marrakech",
    "region": "Morocco",
    "month": "Mar 2026",
    "photo": null,
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
    "face": "face-jonah",
    "place": "Zanzibar",
    "region": "Tanzania",
    "month": "Aug 2025",
    "photo": "zanzibar-2",
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
      "kaiseki-1",
      "minttea-1"
    ]
  },
  {
    "name": "Summer 2027",
    "meta": "5 saves · shared with 2",
    "photos": [
      "puglia-1",
      "deia-1",
      "pool-1"
    ]
  },
  {
    "name": "2027 list",
    "meta": "3 saves",
    "photos": [
      "crete-1",
      "kyoto-2",
      "maldives-1"
    ]
  },
  {
    "name": "One day",
    "meta": "3 saves",
    "photos": [
      "kyoto-1",
      "marrakech-2",
      "copenhagen-1"
    ]
  }
] as Board[];

export const samplePostcards: SamplePostcard[] = [
  {
    "who": "Tom",
    "text": "rated Kyoto 9.5. It's on your wishlist ★",
    "when": "1h",
    "photo": "kyoto-1",
    "slug": "kyoto"
  },
  {
    "who": "Tom",
    "text": "sent you a postcard from Kyoto",
    "when": "2h",
    "photo": "kyoto-1",
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
    "text": "rated the Maldives 9.4. It's on your wishlist ★",
    "when": "Wed",
    "photo": "maldives-1",
    "slug": "maldives"
  },
  {
    "who": "{app}",
    "text": "Polignano a Mare is trending. Two friends went this autumn",
    "when": "Tue",
    "photo": "puglia-1",
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
    "photo": "cotswolds-1",
    "filter": "weekends"
  },
  {
    "name": "One night away",
    "photo": "york-1",
    "filter": "overnight"
  },
  {
    "name": "Hidden gems",
    "photo": "stives-2",
    "filter": "gems"
  },
  {
    "name": "Culture",
    "photo": "kyoto-2",
    "filter": "culture"
  },
  {
    "name": "Places to stay",
    "photo": "pool-1",
    "filter": "stays"
  },
  {
    "name": "Eat & drink",
    "photo": "picnic-2",
    "filter": "food"
  },
  {
    "name": "Things to do",
    "photo": "madeira-1",
    "filter": "todo"
  },
  {
    "name": "Destinations",
    "photo": "hydra-1",
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

export const PHOTO_CREDITS =
  'Photos: our own holidays, plus Julia Solonina, Bartłomiej Balicki, Christian Mackie, Gianluca Baio, Mauricio Muñoz, Adrian Cole, BEN ELLIOTT, Nick Karvounis, Xenia Bunina, Tobias Reich, Toa Heftiba, Jacek Urbanski, Ishan @seefromthesky, Roméo A., Christian Cacciamani, Marc Schmittbuhl, Humphrey M., Xavier Coiffic, James Shaw, Evy Prentice, Tim Alex, Illiya Vjestica, Ben Seymour, Swati Kedia, Lex Brogan, Tom Podmore, Helena Pfisterer, Joshua Kettle, Arash Bal, Nahum Ashworth, Chloe Frost-Smith, Denys Kostyuchenko, Yuliya Matuzava, orva studio, David Hieb, Tony Lee, Febiyan, Oliver Potter, Johannes W, Olivier Chatel, Svetlana Kuznetsova, Alessandro Rossi, Matthieu Oger, Yianni Mathioudakis, Chloé Lefleur, Khaled Ali, François Fayet, Egor Myznik, Mike Swigunski, Christina Terzidou, Yosuke Ota, Massimo Adami, Roberto Nickson on Unsplash';

export const unreadPostcardCount = 2;

export function getPlace(slug: string): SamplePlace | undefined {
  return places.find((p) => p.slug === slug);
}

/** A sample photo for a place name you typed (e.g. your trip to "Lisbon"), if we have one. */
export function photoForPlaceName(name: string): PhotoName | null {
  const n = name.trim().toLowerCase();
  const p = places.find((x) => x.name.toLowerCase() === n || x.slug === n || x.name.toLowerCase().replace(/^the /, '') === n);
  return p ? p.photo : null;
}

/** Everything in the sample content about one place (for its page). */
export function aboutPlace(slug: string) {
  return {
    said: friendsFeed.filter((f) => f.slug === slug),
    ideas: [...rows.taste.filter((t) => t.slug === slug).map((t) => ({ kind: t.kind, name: t.name, sub: t.because, photo: t.photo })),
      ...board.filter((b) => b.slug === slug && b.kind !== 'place').map((b) => ({ kind: b.kind, name: b.name, sub: b.sub, photo: b.photo }))],
  };
}
