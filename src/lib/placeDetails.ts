import type { PhotoName } from './photos';

/**
 * Sample place details from the owner's design prototype (the "… without planning" artifact):
 * where to stay, where to eat, things to do, best time to go, what friends said and top tips.
 * Real place pages come in plan Step E. Generated from the prototype; edit by hand if needed.
 */

export type PlaceDetail = {
  kicker: string | null;
  scoreNote: string | null;
  bestTime: string | null;
  staysFrom: string | null;
  goodFor: string[];
  /** Average daytime high for each month, Jan–Dec (°C). */
  temps: number[] | null;
  /** Best months to go (0 = Jan). */
  bestMonths: number[];
  /** How busy each month is: 1 quiet, 2 busy, 3 very busy. */
  crowds: number[] | null;
  said: { who: string; month: string; quote: string | null; score: number | null; face: PhotoName | null }[];
  stays: { name: string; type: string; match: number | null; featured: boolean; sub: string | null; because: string | null; score: number | null; photo: PhotoName | null }[];
  eats: { name: string; price: string | null; what: string | null; score: number | null; from: string | null; match: number | null; photo: PhotoName | null }[];
  dos: { tag: string; name: string; what: string | null; from: string | null; gem: boolean }[];
  culture: { tag: string; when: string | null; name: string; what: string | null; from: string | null }[];
  tips: { tip: string; from: string | null }[];
  credits: string | null;
};

export const placeDetails: Record<string, PlaceDetail> = {
  "bath": {
    "kicker": "City · One night",
    "scoreNote": "From 7 friends and people with your taste.",
    "bestTime": "Spring, or December for the Christmas market",
    "staysFrom": "from £160 a night",
    "goodFor": [
      "Couples",
      "Friends"
    ],
    "temps": [
      7,
      8,
      11,
      14,
      17,
      20,
      22,
      22,
      19,
      15,
      10,
      8
    ],
    "bestMonths": [
      4,
      5,
      8
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      2,
      1,
      1,
      2
    ],
    "said": [
      {
        "who": "Harriet",
        "month": "Feb 2026",
        "quote": "Thermae Spa on the roof at sunset. Book it.",
        "score": 9.0,
        "face": null
      },
      {
        "who": "Maya",
        "month": "Oct 2026",
        "quote": "Felt like a proper break in just one night.",
        "score": 9.1,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "The Bath Priory",
        "type": "Hotel",
        "match": 91,
        "featured": true,
        "sub": "from £300 a night · Country house in four acres of gardens, ten minutes from town.",
        "because": "Because you loved breakfast in the garden at Es Molí",
        "score": null,
        "photo": "bath-1"
      },
      {
        "name": "No.15 Great Pulteney",
        "type": "Hotel",
        "match": 90,
        "featured": false,
        "sub": "from £240 a night · Maya stayed",
        "because": null,
        "score": 9.2,
        "photo": "bath-1"
      },
      {
        "name": "The Royal Crescent Hotel",
        "type": "Hotel",
        "match": 85,
        "featured": false,
        "sub": "from £340 a night · Mum stayed",
        "because": null,
        "score": 9.0,
        "photo": "bath-1"
      },
      {
        "name": "Number One Bath",
        "type": "B&B",
        "match": 82,
        "featured": false,
        "sub": "from £160 a night · Sam stayed",
        "because": null,
        "score": 8.5,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Sally Lunn's",
        "price": "£",
        "what": "The famous Bath bun, in one of the city's oldest houses",
        "score": 8.4,
        "from": "Maya",
        "match": 83,
        "photo": null
      },
      {
        "name": "Colonna & Small's",
        "price": "£",
        "what": "Flat white",
        "score": 8.8,
        "from": "Sophie",
        "match": 83,
        "photo": null
      },
      {
        "name": "Corkage",
        "price": "££",
        "what": "Small plates and wine",
        "score": 8.7,
        "from": "Mum",
        "match": 82,
        "photo": "food-wine"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Bath Skyline walk",
        "what": "A six-mile National Trust loop above the city, with the best views of the honey-coloured crescents.",
        "from": "Maya",
        "gem": true
      },
      {
        "tag": "History",
        "name": "The Roman Baths",
        "what": "The steaming 2,000-year-old baths in the middle of town. Go late afternoon when it's quieter.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Spa",
        "name": "Thermae Bath Spa",
        "what": "Natural warm water in a rooftop pool with views over the city.",
        "from": "Maya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "September",
        "name": "Jane Austen Festival",
        "what": "Regency costumes, balls and a grand promenade through the streets.",
        "from": "Maya"
      },
      {
        "tag": "History",
        "when": null,
        "name": "Georgian Bath",
        "what": "The Royal Crescent and the Circus are some of the finest Georgian architecture in the country.",
        "from": "Priya"
      }
    ],
    "tips": [
      {
        "tip": "Book Thermae Bath Spa for the first slot of the day. Weekends sell out.",
        "from": "Maya"
      },
      {
        "tip": "Everything is walkable, so leave the car at home.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "borabora": {
    "kicker": "Island · Beach",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "May to October",
    "staysFrom": "from £650 a night",
    "goodFor": [
      "Couples"
    ],
    "temps": [
      30,
      30,
      30,
      30,
      29,
      28,
      28,
      28,
      28,
      29,
      29,
      30
    ],
    "bestMonths": [
      4,
      5,
      6,
      7,
      8,
      9
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      2,
      2,
      1,
      2
    ],
    "said": [
      {
        "who": "Priya",
        "month": "Sep 2025",
        "quote": "The most beautiful place I've ever been. Honeymoon sorted.",
        "score": 9.3,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "The St. Regis Bora Bora",
        "type": "Villa",
        "match": 93,
        "featured": true,
        "sub": "from £1400 a night · Overwater villas with their own plunge pool.",
        "because": "Because you gave Villa Limone a 9.0",
        "score": null,
        "photo": null
      },
      {
        "name": "Four Seasons Bora Bora",
        "type": "Villa",
        "match": 90,
        "featured": false,
        "sub": "from £1600 a night · Priya stayed",
        "because": null,
        "score": 9.5,
        "photo": null
      },
      {
        "name": "Conrad Bora Bora Nui",
        "type": "Villa",
        "match": 87,
        "featured": false,
        "sub": "from £1200 a night · Sam stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      },
      {
        "name": "Le Bora Bora by Pearl Resorts",
        "type": "Hotel",
        "match": 82,
        "featured": false,
        "sub": "from £650 a night · Sam stayed",
        "because": null,
        "score": 8.7,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Bloody Mary's",
        "price": "££",
        "what": "Fresh fish on a sand floor, shoes off at the door",
        "score": 8.9,
        "from": "Priya",
        "match": 85,
        "photo": null
      },
      {
        "name": "La Villa Mahana",
        "price": "£££",
        "what": "Six tables, French menu",
        "score": 9.1,
        "from": "Sophie",
        "match": 84,
        "photo": "food-wine"
      },
      {
        "name": "Snack Matira",
        "price": "£",
        "what": "Poisson cru on the beach",
        "score": 8.7,
        "from": "Sam",
        "match": 79,
        "photo": "food-table"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Matira Beach",
        "what": "The best public beach on the island. Free, and lovely at sunset.",
        "from": "Priya",
        "gem": true
      },
      {
        "tag": "Snorkel",
        "name": "Lagoon tour",
        "what": "Swim with stingrays and blacktip reef sharks in waist-deep water.",
        "from": "Priya",
        "gem": false
      },
      {
        "tag": "Views",
        "name": "Jeep up the mountain",
        "what": "Old WW2 cannons and the best view of the lagoon.",
        "from": "Priya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "July",
        "name": "Heiva i Bora Bora",
        "what": "A month of Polynesian dancing, singing, canoe races and stone lifting.",
        "from": "Priya"
      },
      {
        "tag": "Custom",
        "when": null,
        "name": "Polynesian tattoo",
        "what": "Tattoos tell your family story here. Ask before taking photos.",
        "from": "Sam"
      }
    ],
    "tips": [
      {
        "tip": "Go for 5 nights or more. It takes 2 days to get there.",
        "from": "Priya"
      },
      {
        "tip": "Split the trip with a cheaper island like Moorea first.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "brighton": {
    "kicker": "Seaside · One night",
    "scoreNote": "From 10 friends and people with your taste.",
    "bestTime": "June to September",
    "staysFrom": "from £180 a night",
    "goodFor": [
      "Families"
    ],
    "temps": [
      8,
      8,
      10,
      13,
      16,
      19,
      21,
      21,
      19,
      16,
      11,
      9
    ],
    "bestMonths": [
      4,
      5,
      8,
      9
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      2,
      1,
      1,
      2
    ],
    "said": [
      {
        "who": "Priya",
        "month": "Aug 2026",
        "quote": "The kids loved the pier, we loved the Lanes.",
        "score": 8.4,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Drakes",
        "type": "Hotel",
        "match": 89,
        "featured": true,
        "sub": "from £190 a night · Sea-view rooms with baths in the window.",
        "because": "Because you loved the views at Casa Arrozal",
        "score": null,
        "photo": null
      },
      {
        "name": "Artist Residence Brighton",
        "type": "Hotel",
        "match": 88,
        "featured": false,
        "sub": "from £180 a night · Priya stayed",
        "because": null,
        "score": 8.5,
        "photo": null
      },
      {
        "name": "The Grand Brighton",
        "type": "Hotel",
        "match": 82,
        "featured": false,
        "sub": "from £220 a night · Mum stayed",
        "because": null,
        "score": 8.4,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Small Batch Coffee",
        "price": "£",
        "what": "Coffee in the Lanes",
        "score": 8.4,
        "from": "Sam",
        "match": 87,
        "photo": null
      },
      {
        "name": "Burnt Orange",
        "price": "££",
        "what": "Charred small plates",
        "score": 8.8,
        "from": "Sophie",
        "match": 86,
        "photo": "food-table"
      },
      {
        "name": "Riddle & Finns on the Beach",
        "price": "££",
        "what": "Seafood platter on the seafront",
        "score": 8.6,
        "from": "Priya",
        "match": 84,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Brighton Toy and Model Museum",
        "what": "A little museum tucked under the station arches. Kids and grown-ups love it.",
        "from": "Priya",
        "gem": true
      },
      {
        "tag": "Fun",
        "name": "Brighton Palace Pier",
        "what": "Rides, arcades and doughnuts out over the sea.",
        "from": "Priya",
        "gem": false
      },
      {
        "tag": "History",
        "name": "The Royal Pavilion",
        "what": "A king's seaside palace that looks like it's from India.",
        "from": "Priya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "May",
        "name": "Brighton Festival",
        "what": "England's biggest arts festival, with theatre, music and free street shows.",
        "from": "Priya"
      }
    ],
    "tips": [
      {
        "tip": "The pier rides are quieter in the morning.",
        "from": "Priya"
      },
      {
        "tip": "Bring a blanket. The beach is all pebbles.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "cambridge": {
    "kicker": "City · One night",
    "scoreNote": "From 6 friends and people with your taste.",
    "bestTime": "May, June or a crisp December",
    "staysFrom": "from \u00a3200 a night",
    "goodFor": [
      "Couples",
      "Friends"
    ],
    "temps": [
      7,
      8,
      11,
      14,
      17,
      20,
      22,
      22,
      19,
      15,
      10,
      8
    ],
    "bestMonths": [
      4,
      5,
      8
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      2,
      1,
      1,
      2
    ],
    "said": [
      {
        "who": "Tom",
        "month": "Jun 2026",
        "quote": "Punting at golden hour was magic.",
        "score": 8.9,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Gonville Hotel",
        "type": "Hotel",
        "match": 88,
        "featured": true,
        "sub": "from £200 a night · Overlooks Parker's Piece, a short walk to the colleges.",
        "because": "Because you liked the small, central Hôtel du Marais",
        "score": null,
        "photo": null
      },
      {
        "name": "University Arms",
        "type": "Hotel",
        "match": 82,
        "featured": false,
        "sub": "from £260 a night · Tom stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      },
      {
        "name": "Graduate Cambridge",
        "type": "Hotel",
        "match": 76,
        "featured": false,
        "sub": "from £210 a night · Sam stayed",
        "because": null,
        "score": 8.4,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Midsummer House",
        "price": "£££",
        "what": "Tasting menu by the river",
        "score": 9.0,
        "from": "Mum",
        "match": 91,
        "photo": "food-wine"
      },
      {
        "name": "Fitzbillies",
        "price": "£",
        "what": "A sticky Chelsea bun",
        "score": 8.7,
        "from": "Tom",
        "match": 87,
        "photo": null
      },
      {
        "name": "Aromi",
        "price": "£",
        "what": "Sicilian pizza slices",
        "score": 8.6,
        "from": "Sam",
        "match": 80,
        "photo": "food-pasta"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "The Orchard, Grantchester",
        "what": "Tea and scones in deckchairs under apple trees, a riverside walk from town.",
        "from": "Tom",
        "gem": true
      },
      {
        "tag": "River",
        "name": "Punting on the Backs",
        "what": "Glide past the colleges and under the Bridge of Sighs.",
        "from": "Tom",
        "gem": false
      },
      {
        "tag": "Art",
        "name": "Fitzwilliam Museum",
        "what": "A free museum with Egyptian treasures and Impressionists.",
        "from": "Tom",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Music",
        "when": null,
        "name": "Evensong at King's",
        "what": "The famous choir sings in the chapel most evenings in term time. Free and unforgettable.",
        "from": "Tom"
      }
    ],
    "tips": [
      {
        "tip": "Hire a self-punt early in the morning, or book a chauffeured punt if no one's confident.",
        "from": "Tom"
      },
      {
        "tip": "Check the King's College evensong times before you go. It's free.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "chamonix": {
    "kicker": "Ski · Mountains",
    "scoreNote": "From 3 friends and people with your taste.",
    "bestTime": "January to March",
    "staysFrom": "from £240 a night",
    "goodFor": [
      "Friends",
      "Solo"
    ],
    "temps": [
      0,
      2,
      6,
      10,
      15,
      19,
      22,
      21,
      17,
      12,
      5,
      1
    ],
    "bestMonths": [
      0,
      1,
      2
    ],
    "crowds": [
      3,
      3,
      3,
      2,
      2,
      2,
      3,
      3,
      2,
      1,
      1,
      3
    ],
    "said": [
      {
        "who": "Sam",
        "month": "Jan 2026",
        "quote": "A real mountain town, not just a resort.",
        "score": 8.6,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Les Grands Montets Hotel",
        "type": "Hotel",
        "match": 88,
        "featured": true,
        "sub": "from £280 a night · Pool and spa by the Argentière lifts.",
        "because": "Because you loved breakfast in the garden at Es Molí",
        "score": null,
        "photo": null
      },
      {
        "name": "Hameau Albert 1er",
        "type": "Hotel",
        "match": 87,
        "featured": false,
        "sub": "from £420 a night · Sophie stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      },
      {
        "name": "Chalet Les Praz",
        "type": "Airbnb",
        "match": 85,
        "featured": false,
        "sub": "from £240 a night · Tom stayed",
        "because": null,
        "score": 8.5,
        "photo": null
      },
      {
        "name": "Hôtel Mont-Blanc Chamonix",
        "type": "Hotel",
        "match": 82,
        "featured": false,
        "sub": "from £340 a night · Sam stayed",
        "because": null,
        "score": 8.7,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "La Crèmerie du Glacier",
        "price": "££",
        "what": "Croûte au fromage in the woods",
        "score": 9.0,
        "from": "Sam",
        "match": 88,
        "photo": "food-table"
      },
      {
        "name": "Refuge du Lac Blanc",
        "price": "££",
        "what": "Lunch by a frozen lake",
        "score": 8.8,
        "from": "Sophie",
        "match": 85,
        "photo": "food-table"
      },
      {
        "name": "Le Cap Horn",
        "price": "££",
        "what": "Fondue and après",
        "score": 8.4,
        "from": "Tom",
        "match": 76,
        "photo": "food-wine"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Montenvers train",
        "what": "Old rack railway up to the Mer de Glace glacier.",
        "from": "Sam",
        "gem": true
      },
      {
        "tag": "Views",
        "name": "Aiguille du Midi",
        "what": "Cable car to 3,842m. Go first thing on a clear day.",
        "from": "Sam",
        "gem": false
      },
      {
        "tag": "Ski",
        "name": "Vallée Blanche",
        "what": "A famous 20km off-piste run. Go with a guide.",
        "from": "Sam",
        "gem": false
      }
    ],
    "culture": [],
    "tips": [
      {
        "tip": "Take the Aiguille du Midi cable car on a clear morning, even if you don't ski.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "cheltenham": {
    "kicker": "Spa town · One night",
    "scoreNote": "From 5 friends and people with your taste.",
    "bestTime": "October for the Literature Festival, or spring",
    "staysFrom": "from £150 a night",
    "goodFor": [
      "Couples",
      "Friends"
    ],
    "temps": [
      7,
      8,
      11,
      14,
      17,
      20,
      22,
      22,
      19,
      15,
      10,
      8
    ],
    "bestMonths": [
      4,
      5,
      8
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      2,
      1,
      1,
      2
    ],
    "said": [
      {
        "who": "Maya",
        "month": "Sep 2026",
        "quote": "Elegant, easy and the shopping is great.",
        "score": 8.8,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "No.38 The Park",
        "type": "Hotel",
        "match": 90,
        "featured": true,
        "sub": "from £190 a night · A pretty Georgian townhouse with an honesty bar.",
        "because": "Because you liked the small, central Hôtel du Marais",
        "score": null,
        "photo": null
      },
      {
        "name": "No. 131",
        "type": "Hotel",
        "match": 89,
        "featured": false,
        "sub": "from £210 a night · Maya stayed",
        "because": null,
        "score": 8.9,
        "photo": null
      },
      {
        "name": "Ellenborough Park",
        "type": "Hotel",
        "match": 87,
        "featured": false,
        "sub": "from £260 a night · Sophie stayed",
        "because": null,
        "score": 8.9,
        "photo": null
      },
      {
        "name": "The Queens Hotel",
        "type": "Hotel",
        "match": 77,
        "featured": false,
        "sub": "from £150 a night · Mum stayed",
        "because": null,
        "score": 8.3,
        "photo": "bath-1"
      }
    ],
    "eats": [
      {
        "name": "Le Champignon Sauvage",
        "price": "£££",
        "what": "Two-star tasting menu",
        "score": 9.1,
        "from": "Sophie",
        "match": 86,
        "photo": "food-table"
      },
      {
        "name": "Coffee Dispensary",
        "price": "£",
        "what": "Coffee and cake",
        "score": 8.4,
        "from": "Sam",
        "match": 85,
        "photo": null
      },
      {
        "name": "The Ivy Montpellier Brasserie",
        "price": "££",
        "what": "Brunch under the Rotunda's dome",
        "score": 8.5,
        "from": "Maya",
        "match": 84,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Sudeley Castle",
        "what": "A castle with beautiful gardens half an hour away, where Katherine Parr is buried.",
        "from": "Maya",
        "gem": true
      },
      {
        "tag": "History",
        "name": "Pittville Pump Room",
        "what": "A grand Regency spa building in a lovely park. Walk around the lake after.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Walk",
        "name": "Cleeve Hill",
        "what": "The highest point of the Cotswolds, 15 minutes away, with views to Wales on a clear day.",
        "from": "Maya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "October",
        "name": "Cheltenham Literature Festival",
        "what": "Ten days of authors, talks and book signings in tents around town.",
        "from": "Maya"
      },
      {
        "tag": "Festival",
        "when": "March",
        "name": "The Cheltenham Festival",
        "what": "Four days of horse racing, with the Gold Cup on the Friday. Dress up.",
        "from": "Tom"
      }
    ],
    "tips": [
      {
        "tip": "Avoid race week in March unless you're going. Hotel prices shoot up.",
        "from": "Maya"
      },
      {
        "tip": "Saturday morning: coffee and browsing in Montpellier, then lunch on the Promenade.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "como": {
    "kicker": "Lakes · Slow",
    "scoreNote": "From 4 friends and people with your taste.",
    "bestTime": "May, June or September",
    "staysFrom": "from £210 a night",
    "goodFor": [
      "Couples",
      "Families"
    ],
    "temps": [
      7,
      9,
      13,
      17,
      21,
      25,
      28,
      27,
      23,
      17,
      11,
      7
    ],
    "bestMonths": [
      4,
      8
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      3,
      3,
      3,
      2,
      2,
      1,
      1
    ],
    "said": [
      {
        "who": "Harriet",
        "month": "Aug 2026",
        "quote": "Gelato on the ferry to Bellagio, every single day.",
        "score": 9.4,
        "face": null
      },
      {
        "who": "Tom",
        "month": "Jun 2026",
        "quote": "Every view looks like a painting.",
        "score": 8.9,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Il Sereno",
        "type": "Hotel",
        "match": 92,
        "featured": true,
        "sub": "from £1100 a night · Every room faces the lake. Floating pool on the water.",
        "because": "Because you gave Villa Limone a 9.0",
        "score": null,
        "photo": "como-1"
      },
      {
        "name": "Villa Cipressi",
        "type": "Villa",
        "match": 91,
        "featured": false,
        "sub": "from £240 a night · Tom stayed",
        "because": null,
        "score": 9.1,
        "photo": "como-2"
      },
      {
        "name": "Albergo Milano, Varenna",
        "type": "B&B",
        "match": 89,
        "featured": false,
        "sub": "from £210 a night · Sophie stayed",
        "because": null,
        "score": 8.8,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Il Gatto Nero",
        "price": "£££",
        "what": "Risotto with perch",
        "score": 8.9,
        "from": "Tom",
        "match": 86,
        "photo": null
      },
      {
        "name": "Locanda La Tirlindana",
        "price": "££",
        "what": "Lake fish risotto",
        "score": 8.8,
        "from": "Sophie",
        "match": 85,
        "photo": "food-pasta"
      },
      {
        "name": "Bar Il Molo",
        "price": "£",
        "what": "Spritz on the jetty",
        "score": 8.4,
        "from": "Sam",
        "match": 79,
        "photo": "food-wine"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Orrido di Nesso",
        "what": "A waterfall in a gorge, with an old stone bridge over it.",
        "from": "Tom",
        "gem": true
      },
      {
        "tag": "Boat",
        "name": "Ferry hop to Bellagio",
        "what": "Buy a day pass and get off wherever looks nice.",
        "from": "Tom",
        "gem": false
      },
      {
        "tag": "Gardens",
        "name": "Villa del Balbianello",
        "what": "Arrive by water taxi for the best view of the terraces.",
        "from": "Tom",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "The silk city",
        "what": "Como has made silk for centuries. Visit the silk museum, then shop for a scarf in town.",
        "from": "Maya"
      },
      {
        "tag": "Custom",
        "when": null,
        "name": "Aperitivo hour",
        "what": "From about 6pm, order a spritz and small snacks come with it. Dinner is rarely before 8.",
        "from": "Tom"
      }
    ],
    "tips": [
      {
        "tip": "Stay in Varenna rather than Como town, and use the ferries to get around.",
        "from": "Tom"
      }
    ],
    "credits": null
  },
  "comporta": {
    "kicker": "Beach · Slow",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "June or September",
    "staysFrom": "from £280 a night",
    "goodFor": [
      "Couples",
      "Families"
    ],
    "temps": [
      15,
      16,
      19,
      20,
      23,
      27,
      29,
      30,
      28,
      24,
      19,
      16
    ],
    "bestMonths": [
      3,
      4,
      5,
      8,
      9
    ],
    "crowds": [
      1,
      1,
      1,
      1,
      2,
      2,
      3,
      3,
      2,
      1,
      1,
      1
    ],
    "said": [
      {
        "who": "Priya",
        "month": "Jul 2025",
        "quote": "Empty beaches and grilled fish.",
        "score": 8.8,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Sublime Comporta",
        "type": "Villa",
        "match": 94,
        "featured": true,
        "sub": "from £420 a night · Cabins in the pines with a natural pool.",
        "because": "Because you gave Villa Limone a 9.0",
        "score": null,
        "photo": "pool-1"
      },
      {
        "name": "Casa Arrozal",
        "type": "Villa",
        "match": 85,
        "featured": false,
        "sub": "from £280 a night · You stayed",
        "because": null,
        "score": 8.9,
        "photo": "villa-1"
      },
      {
        "name": "Casas na Areia",
        "type": "Villa",
        "match": 83,
        "featured": false,
        "sub": "from £380 a night · Sophie stayed",
        "because": null,
        "score": 9.0,
        "photo": "villa-1"
      }
    ],
    "eats": [
      {
        "name": "Sal",
        "price": "££",
        "what": "Grilled fish on the beach",
        "score": 9.0,
        "from": "Priya",
        "match": 90,
        "photo": "food-wine"
      },
      {
        "name": "Museu do Arroz",
        "price": "££",
        "what": "Seafood rice in an old rice mill",
        "score": 9.0,
        "from": "Maya",
        "match": 87,
        "photo": "food-table"
      },
      {
        "name": "Comporta Café",
        "price": "££",
        "what": "Grilled fish on the dunes",
        "score": 8.6,
        "from": "Sam",
        "match": 85,
        "photo": "food-wine"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Carrasqueira pier",
        "what": "A wooden fishermen's pier on stilts over the estuary. Magic at sunset.",
        "from": "Priya",
        "gem": true
      },
      {
        "tag": "Outdoors",
        "name": "Horse ride on the beach",
        "what": "Sunset rides along the empty sand. Book a day ahead.",
        "from": "Priya",
        "gem": false
      },
      {
        "tag": "Outdoors",
        "name": "Cycle the rice fields",
        "what": "Flat, quiet roads and storks nesting on every chimney.",
        "from": "You",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "Carrasqueira stilt pier",
        "what": "A fishermen's pier of wooden walkways on stilts over the estuary, still used today. Best at sunset.",
        "from": "Priya"
      },
      {
        "tag": "Custom",
        "when": null,
        "name": "Rice fields and storks",
        "what": "Comporta grows rice. Look out for stork nests on the chimneys and poles along the road.",
        "from": "Jonah"
      }
    ],
    "tips": [
      {
        "tip": "You'll need a car. The beaches are long and the restaurants are miles apart.",
        "from": "Priya"
      }
    ],
    "credits": null
  },
  "copenhagen": {
    "kicker": "City · Weekend",
    "scoreNote": "From 3 friends and people with your taste.",
    "bestTime": "June to August",
    "staysFrom": "from £230 a night",
    "goodFor": [
      "Solo",
      "Couples"
    ],
    "temps": [
      3,
      3,
      6,
      11,
      16,
      19,
      22,
      21,
      17,
      12,
      7,
      4
    ],
    "bestMonths": [
      8
    ],
    "crowds": [
      1,
      1,
      1,
      1,
      2,
      3,
      3,
      3,
      2,
      1,
      1,
      2
    ],
    "said": [
      {
        "who": "Jonah",
        "month": "Jul 2026",
        "quote": "Expensive, but so easy and so pretty.",
        "score": 8.5,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Hotel Sanders",
        "type": "Hotel",
        "match": 91,
        "featured": true,
        "sub": "from £380 a night · Tiny, cosy and a short walk to Nyhavn.",
        "because": "Because you liked the small, central Hôtel du Marais",
        "score": null,
        "photo": null
      },
      {
        "name": "Nyhavn Canal Flat",
        "type": "Airbnb",
        "match": 86,
        "featured": false,
        "sub": "from £230 a night · Jonah stayed",
        "because": null,
        "score": 8.4,
        "photo": null
      },
      {
        "name": "Nobis Hotel",
        "type": "Hotel",
        "match": 83,
        "featured": false,
        "sub": "from £300 a night · Tom stayed",
        "because": null,
        "score": 8.6,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Juno the Bakery",
        "price": "£",
        "what": "Cardamom buns",
        "score": 9.1,
        "from": "Maya",
        "match": 86,
        "photo": null
      },
      {
        "name": "Barr",
        "price": "£££",
        "what": "Schnitzel and Nordic beer",
        "score": 8.9,
        "from": "Tom",
        "match": 84,
        "photo": "food-table"
      },
      {
        "name": "Torvehallerne",
        "price": "££",
        "what": "Smørrebrød at the food market",
        "score": 8.7,
        "from": "Jonah",
        "match": 80,
        "photo": "food-table"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Assistens Cemetery",
        "what": "Locals picnic and cycle here. Hans Christian Andersen is buried here too.",
        "from": "Jonah",
        "gem": true
      },
      {
        "tag": "Outdoors",
        "name": "Harbour swim",
        "what": "Islands Brygge has a free harbour bath with diving boards.",
        "from": "Jonah",
        "gem": false
      },
      {
        "tag": "Day trip",
        "name": "Louisiana museum",
        "what": "Forty minutes up the coast. Modern art and a sculpture garden by the sea.",
        "from": "Jonah",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Custom",
        "when": null,
        "name": "Life on two wheels",
        "what": "Everyone cycles. Rent a bike, keep right and signal with your hand before you stop.",
        "from": "Jonah"
      },
      {
        "tag": "Art",
        "when": null,
        "name": "Louisiana Museum",
        "what": "Modern art in a garden by the sea, 35 minutes north by train. Bring a swimsuit in summer.",
        "from": "Jonah"
      }
    ],
    "tips": [
      {
        "tip": "Hire a bike for the whole weekend. It's the fastest way round and the locals swim in the harbour.",
        "from": "Jonah"
      }
    ],
    "credits": null
  },
  "cotswolds": {
    "kicker": "Countryside · Weekend",
    "scoreNote": "From 6 friends and people with your taste.",
    "bestTime": "May, June or a cosy December",
    "staysFrom": "from £210 a night",
    "goodFor": [
      "Couples",
      "Families"
    ],
    "temps": [
      7,
      8,
      11,
      14,
      17,
      20,
      22,
      22,
      19,
      15,
      10,
      8
    ],
    "bestMonths": [
      4,
      5,
      8
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      2,
      1,
      1,
      2
    ],
    "said": [
      {
        "who": "Priya",
        "month": "Oct 2026",
        "quote": "The best reset weekend. Walk, pub, sleep, repeat.",
        "score": 8.9,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "The Fish Hotel",
        "type": "Hotel",
        "match": 90,
        "featured": true,
        "sub": "from £280 a night · Treehouses and shepherd's huts on a big estate.",
        "because": "Because you loved breakfast in the garden at Es Molí",
        "score": null,
        "photo": null
      },
      {
        "name": "Thyme",
        "type": "Hotel",
        "match": 89,
        "featured": false,
        "sub": "from £380 a night · Sophie stayed",
        "because": null,
        "score": 9.2,
        "photo": null
      },
      {
        "name": "The Wild Rabbit Cottage",
        "type": "Airbnb",
        "match": 85,
        "featured": false,
        "sub": "from £210 a night · Priya stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      },
      {
        "name": "The Lygon Arms",
        "type": "Hotel",
        "match": 80,
        "featured": false,
        "sub": "from £260 a night · Mum stayed",
        "because": null,
        "score": 8.5,
        "photo": "bath-1"
      }
    ],
    "eats": [
      {
        "name": "The Swan",
        "price": "££",
        "what": "Sunday roast by the fire",
        "score": 8.8,
        "from": "Tom",
        "match": 85,
        "photo": null
      },
      {
        "name": "The Wild Rabbit",
        "price": "£££",
        "what": "Sunday lunch by the fire",
        "score": 8.9,
        "from": "Sophie",
        "match": 84,
        "photo": "food-table"
      },
      {
        "name": "Daylesford Farm Café",
        "price": "££",
        "what": "Farm breakfast",
        "score": 8.6,
        "from": "Mum",
        "match": 82,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Snowshill lavender",
        "what": "Fields of lavender above the village in July. Go at golden hour.",
        "from": "Priya",
        "gem": true
      },
      {
        "tag": "Walk",
        "name": "Bibury to Coln St Aldwyns",
        "what": "An easy riverside loop past the famous cottages, finishing at a pub.",
        "from": "Priya",
        "gem": false
      },
      {
        "tag": "Food",
        "name": "Daylesford farm shop",
        "what": "Breakfast in the café, then stock up for a picnic.",
        "from": "Tom",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "Late May bank holiday",
        "name": "Cheese rolling",
        "what": "People chase a wheel of Double Gloucester down the very steep Cooper's Hill. Go to watch, not to race.",
        "from": "Sam"
      },
      {
        "tag": "History",
        "when": null,
        "name": "Wool churches",
        "what": "The grand churches in small villages were paid for by the medieval wool trade.",
        "from": "Maya"
      }
    ],
    "tips": [
      {
        "tip": "Stay in a village like Bibury or Lower Slaughter, not Bourton, which fills with day-trippers.",
        "from": "Priya"
      }
    ],
    "credits": null
  },
  "courchevel": {
    "kicker": "Ski · Luxury",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "January to March",
    "staysFrom": "from £560 a night",
    "goodFor": [
      "Families",
      "Couples"
    ],
    "temps": [
      -2,
      -1,
      3,
      7,
      12,
      16,
      19,
      19,
      14,
      9,
      3,
      -1
    ],
    "bestMonths": [
      0,
      1,
      2
    ],
    "crowds": [
      3,
      3,
      3,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      1,
      3
    ],
    "said": [
      {
        "who": "Maya",
        "month": "Mar 2026",
        "quote": "Immaculate pistes. Bring a big budget.",
        "score": 8.7,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Le K2 Altitude",
        "type": "Hotel",
        "match": 89,
        "featured": true,
        "sub": "from £1200 a night · Chalet suites hidden in the forest.",
        "because": "Because you gave Villa Limone a 9.0",
        "score": null,
        "photo": null
      },
      {
        "name": "Les Grandes Alpes",
        "type": "Hotel",
        "match": 86,
        "featured": false,
        "sub": "from £780 a night · Sophie stayed",
        "because": null,
        "score": 8.9,
        "photo": null
      },
      {
        "name": "Hotel Le Lana",
        "type": "Hotel",
        "match": 84,
        "featured": false,
        "sub": "from £560 a night · Mum stayed",
        "because": null,
        "score": 8.6,
        "photo": "bath-1"
      },
      {
        "name": "Hôtel des Trois Vallées",
        "type": "Hotel",
        "match": 80,
        "featured": false,
        "sub": "from £690 a night · Maya stayed",
        "because": null,
        "score": 8.8,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Le Bel Air",
        "price": "£££",
        "what": "Long lunch on the terrace",
        "score": 8.7,
        "from": "Maya",
        "match": 82,
        "photo": "food-wine"
      },
      {
        "name": "Le Chalet de Pierres",
        "price": "£££",
        "what": "Lunch by the Verdons piste",
        "score": 8.9,
        "from": "Sophie",
        "match": 81,
        "photo": "food-table"
      },
      {
        "name": "La Saulire",
        "price": "££",
        "what": "Classic Savoyard dinner",
        "score": 8.6,
        "from": "Mum",
        "match": 79,
        "photo": "food-wine"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Le Praz",
        "what": "A tiny old village at the bottom with the best-value lunch.",
        "from": "Maya",
        "gem": true
      },
      {
        "tag": "Ski",
        "name": "Ski the Three Valleys",
        "what": "600km of pistes, all on one pass.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Family",
        "name": "Aquamotion",
        "what": "A huge indoor pool and spa for a day off.",
        "from": "Maya",
        "gem": false
      }
    ],
    "culture": [],
    "tips": [
      {
        "tip": "Stay in 1650 or Le Praz for half the price and the same lift pass.",
        "from": "Maya"
      }
    ],
    "credits": null
  },
  "crete": {
    "kicker": "Islands · Beach · Food",
    "scoreNote": "From 5 friends and people with your taste.",
    "bestTime": "May, June or late September",
    "staysFrom": "from £115 a night",
    "goodFor": [
      "Friends",
      "Couples",
      "Families"
    ],
    "temps": [
      16,
      16,
      18,
      21,
      25,
      29,
      31,
      31,
      28,
      25,
      21,
      17
    ],
    "bestMonths": [
      3,
      4,
      8,
      9,
      10
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      3,
      3,
      3,
      2,
      2,
      1,
      1
    ],
    "said": [
      {
        "who": "Harriet",
        "month": "Jun 2026",
        "quote": "Long lunches, warm sea and the best tomatoes of my life.",
        "score": 9.2,
        "face": null
      },
      {
        "who": "Maya",
        "month": "Jun 2026",
        "quote": "Big enough for a fortnight. Food is the best in Greece.",
        "score": 9.0,
        "face": null
      },
      {
        "who": "Priya",
        "month": "Sep 2025",
        "quote": "Book a villa with friends and split it.",
        "score": 8.8,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Blue Palace Elounda",
        "type": "Hotel",
        "match": 92,
        "featured": true,
        "sub": "from £520 a night · Private plunge pools looking at Spinalonga island.",
        "because": "Because you gave Villa Limone a 9.0",
        "score": null,
        "photo": null
      },
      {
        "name": "Villa Elounda Blue",
        "type": "Villa",
        "match": 89,
        "featured": false,
        "sub": "from £380 a night · Priya stayed",
        "because": null,
        "score": 9.1,
        "photo": null
      },
      {
        "name": "Chania Old Port Rooms",
        "type": "B&B",
        "match": 87,
        "featured": false,
        "sub": "from £115 a night · Maya stayed",
        "because": null,
        "score": 8.6,
        "photo": null
      },
      {
        "name": "Serenissima Boutique",
        "type": "B&B",
        "match": 85,
        "featured": false,
        "sub": "from £140 a night · Maya stayed",
        "because": null,
        "score": 8.9,
        "photo": "lemon-1"
      }
    ],
    "eats": [
      {
        "name": "To Maridaki",
        "price": "££",
        "what": "Fried calamari and dakos",
        "score": 8.9,
        "from": "Sam",
        "match": 90,
        "photo": "taverna-1"
      },
      {
        "name": "Taverna Tamam",
        "price": "££",
        "what": "Dakos salad and lamb with stamnagathi",
        "score": 9.0,
        "from": "Maya",
        "match": 83,
        "photo": "taverna-1"
      },
      {
        "name": "Raki at the harbour",
        "price": "£",
        "what": "Raki and meze on the house",
        "score": 8.5,
        "from": "Priya",
        "match": 83,
        "photo": "food-table"
      },
      {
        "name": "Bougatsa Iordanis",
        "price": "£",
        "what": "Cheese bougatsa for breakfast",
        "score": 8.6,
        "from": "Maya",
        "match": 83,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Loutro",
        "what": "A white village you can only reach by boat or on foot. No cars, just swimming.",
        "from": "Maya",
        "gem": true
      },
      {
        "tag": "Beach",
        "name": "Balos lagoon",
        "what": "The famous turquoise lagoon. Drive and walk down early, or take the boat.",
        "from": "Priya",
        "gem": false
      },
      {
        "tag": "Hike",
        "name": "Samaria Gorge hike",
        "what": "A full day down one of Europe's longest gorges, ending at the sea.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Culture",
        "name": "Palace of Knossos",
        "what": "The Minoan palace near Heraklion. Go at opening time.",
        "from": "Maya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Food ritual",
        "when": null,
        "name": "Raki on the house",
        "what": "After dinner, tavernas often bring a little raki and fruit to say thank you. It's polite to try it.",
        "from": "Sam"
      },
      {
        "tag": "History",
        "when": null,
        "name": "Palace of Knossos",
        "what": "The Minoan palace of the Minotaur myth, near Heraklion. Go at opening time to beat the heat.",
        "from": "Priya"
      },
      {
        "tag": "Music",
        "when": null,
        "name": "The lyra",
        "what": "Crete's three-string fiddle. Look for a village festival in summer to hear it live.",
        "from": "Sam"
      }
    ],
    "tips": [
      {
        "tip": "Hire a car. The best beaches, like Balos and Elafonisi, are hours apart.",
        "from": "Maya"
      },
      {
        "tip": "Get to Balos by 9am, before the boats from Kissamos arrive.",
        "from": "Priya"
      }
    ],
    "credits": null
  },
  "deia": {
    "kicker": "Mountains · Coast",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "May or June",
    "staysFrom": "from £160 a night",
    "goodFor": [
      "Couples"
    ],
    "temps": [
      15,
      15,
      17,
      20,
      24,
      28,
      31,
      31,
      28,
      23,
      19,
      16
    ],
    "bestMonths": [
      3,
      4,
      8,
      9
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      3,
      3,
      3,
      2,
      2,
      1,
      1
    ],
    "said": [
      {
        "who": "Jonah",
        "month": "Jun 2025",
        "quote": "Hire a car. Swim at the cove every morning.",
        "score": 8.5,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Belmond La Residencia",
        "type": "Hotel",
        "match": 90,
        "featured": true,
        "sub": "from £600 a night · Two old manor houses in the olive groves.",
        "because": "Because you gave Villa Limone a 9.0",
        "score": null,
        "photo": "pool-2"
      },
      {
        "name": "Es Molí House",
        "type": "B&B",
        "match": 85,
        "featured": false,
        "sub": "from £160 a night · Jonah stayed",
        "because": null,
        "score": 8.6,
        "photo": "lemon-1"
      },
      {
        "name": "Hotel Es Petit",
        "type": "B&B",
        "match": 85,
        "featured": false,
        "sub": "from £180 a night · Sam stayed",
        "because": null,
        "score": 8.6,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Ca's Patró March",
        "price": "££",
        "what": "Fish lunch over the cove",
        "score": 9.2,
        "from": "Jonah",
        "match": 93,
        "photo": "food-table"
      },
      {
        "name": "Es Racó d'es Teix",
        "price": "£££",
        "what": "Tasting menu on the terrace",
        "score": 9.1,
        "from": "Priya",
        "match": 88,
        "photo": "food-wine"
      },
      {
        "name": "Sa Fonda",
        "price": "£",
        "what": "Drinks in the village bar",
        "score": 8.2,
        "from": "Sam",
        "match": 79,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Sa Foradada",
        "what": "Hike down to the rock with a hole through it. There's a tiny restaurant at the bottom doing paella.",
        "from": "Jonah",
        "gem": true
      },
      {
        "tag": "Hike",
        "name": "Walk to Sóller",
        "what": "Three hours along the coast path, then the old wooden train back to Palma.",
        "from": "Jonah",
        "gem": false
      },
      {
        "tag": "Culture",
        "name": "Robert Graves' house",
        "what": "The poet's home, kept just as he left it.",
        "from": "Jonah",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "Robert Graves' house",
        "what": "The poet lived in Deià for decades. His home, Ca n'Alluny, is now a small museum.",
        "from": "Sam"
      },
      {
        "tag": "Music",
        "when": null,
        "name": "Deià music festival",
        "what": "Summer chamber concerts in the gardens of old houses along the coast.",
        "from": "Maya"
      }
    ],
    "tips": [
      {
        "tip": "Hire a car. Swim at Cala Deià every morning before 10.",
        "from": "Jonah"
      }
    ],
    "credits": null
  },
  "heidelberg": {
    "kicker": "Old town · River · Weekend",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "May to September, or for the Christmas market",
    "staysFrom": "from £150 a night",
    "goodFor": [
      "Couples",
      "Families"
    ],
    "temps": [
      4,
      6,
      11,
      16,
      20,
      23,
      26,
      25,
      21,
      15,
      9,
      5
    ],
    "bestMonths": [
      4,
      5,
      6,
      8
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      2,
      2,
      1,
      2
    ],
    "said": [
      {
        "who": "Sophie",
        "month": "Sep 2026",
        "quote": "Like walking into a fairytale. Perfect for two nights.",
        "score": 8.6,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Arthotel Heidelberg",
        "type": "Hotel",
        "match": 90,
        "featured": true,
        "sub": "from £160 a night · Small design hotel with a garden, right in the old town.",
        "because": "Because you liked the small, central Hôtel du Marais",
        "score": null,
        "photo": null
      },
      {
        "name": "Hotel Die Hirschgasse",
        "type": "Hotel",
        "match": 86,
        "featured": false,
        "sub": "from £230 a night · Sophie stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      },
      {
        "name": "Hotel Zum Ritter St. Georg",
        "type": "Hotel",
        "match": 85,
        "featured": false,
        "sub": "from £150 a night · Sophie stayed",
        "because": null,
        "score": 8.5,
        "photo": null
      },
      {
        "name": "Der Europäische Hof",
        "type": "Hotel",
        "match": 85,
        "featured": false,
        "sub": "from £260 a night · Mum stayed",
        "because": null,
        "score": 8.8,
        "photo": "bath-1"
      }
    ],
    "eats": [
      {
        "name": "Zum Roten Ochsen",
        "price": "££",
        "what": "Schnitzel in the old student tavern",
        "score": 8.6,
        "from": "Sophie",
        "match": 84,
        "photo": "food-table"
      },
      {
        "name": "Café Knösel",
        "price": "£",
        "what": "The Heidelberg Student Kiss chocolate",
        "score": 8.4,
        "from": "Mum",
        "match": 84,
        "photo": null
      },
      {
        "name": "Schnitzelbank",
        "price": "££",
        "what": "Local wine in a tiny old tavern",
        "score": 8.8,
        "from": "Sophie",
        "match": 80,
        "photo": "food-wine"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Thingstätte",
        "what": "A huge open-air amphitheatre hidden in the woods on Heiligenberg.",
        "from": "Sophie",
        "gem": true
      },
      {
        "tag": "History",
        "name": "Heidelberg Castle",
        "what": "Red sandstone ruins above the town. See the giant wine barrel in the cellar.",
        "from": "Sophie",
        "gem": false
      },
      {
        "tag": "Walk",
        "name": "Philosophers' Walk",
        "what": "A path up the hill across the river with the best view of the old town.",
        "from": "Sophie",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "The Student Prison",
        "what": "Until 1914 rowdy students were locked up here, and they covered the walls in graffiti you can still see.",
        "from": "Sophie"
      },
      {
        "tag": "Festival",
        "when": "June, July and September",
        "name": "Castle illuminations",
        "what": "The castle is lit red as if on fire, then fireworks go off over the Neckar.",
        "from": "Sophie"
      }
    ],
    "tips": [
      {
        "tip": "Take the funicular up to the castle, then walk down through the woods.",
        "from": "Sophie"
      }
    ],
    "credits": null
  },
  "hydra": {
    "kicker": "Islands · Slow",
    "scoreNote": "From 4 friends and people with your taste.",
    "bestTime": "June or September",
    "staysFrom": "from £140 a night",
    "goodFor": [
      "Couples",
      "Solo"
    ],
    "temps": [
      14,
      14,
      16,
      20,
      24,
      29,
      31,
      31,
      28,
      23,
      19,
      15
    ],
    "bestMonths": [
      3,
      4,
      8,
      9
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      3,
      3,
      3,
      2,
      1,
      1,
      1
    ],
    "said": [
      {
        "who": "Maya",
        "month": "Jun 2026",
        "quote": "No cars, just donkeys and swimming off the rocks.",
        "score": 9.4,
        "face": null
      },
      {
        "who": "Jonah",
        "month": "Sep 2025",
        "quote": "Go in September when the boats quieten down.",
        "score": 8.7,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Orloff Resort",
        "type": "Hotel",
        "match": 93,
        "featured": true,
        "sub": "from £240 a night · An old captain's mansion with a shady courtyard.",
        "because": "Because you loved breakfast in the garden at Es Molí",
        "score": null,
        "photo": null
      },
      {
        "name": "The Old Mill House",
        "type": "Airbnb",
        "match": 89,
        "featured": false,
        "sub": "from £140 a night · Jonah stayed",
        "because": null,
        "score": 9.2,
        "photo": "lemon-1"
      },
      {
        "name": "Hotel Leto",
        "type": "Hotel",
        "match": 85,
        "featured": false,
        "sub": "from £190 a night · Sophie stayed",
        "because": null,
        "score": 8.7,
        "photo": null
      },
      {
        "name": "Casa Ammos",
        "type": "Hotel",
        "match": 82,
        "featured": false,
        "sub": "from £190 a night · Maya stayed",
        "because": null,
        "score": 8.8,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Taverna Ostria",
        "price": "££",
        "what": "Grilled octopus and fava",
        "score": 9.0,
        "from": "Maya",
        "match": 88,
        "photo": "food-table"
      },
      {
        "name": "Techne",
        "price": "££",
        "what": "Lamb with lemon potatoes",
        "score": 8.8,
        "from": "Sophie",
        "match": 86,
        "photo": "taverna-1"
      },
      {
        "name": "Sunset Bar",
        "price": "££",
        "what": "Ouzo at sunset",
        "score": 8.6,
        "from": "Jonah",
        "match": 85,
        "photo": "food-wine"
      },
      {
        "name": "Isalos",
        "price": "£",
        "what": "Breakfast by the boats",
        "score": 8.3,
        "from": "Sam",
        "match": 84,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Vlychos",
        "what": "A sleepy pebble beach and taverna 40 minutes' walk from town. Almost nobody makes it there.",
        "from": "Jonah",
        "gem": true
      },
      {
        "tag": "Beach",
        "name": "Water taxi to Bisti",
        "what": "A pine-backed cove on the far side of the island. Taxis leave from the port.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Walk",
        "name": "Coast walk to Kamini",
        "what": "Twenty minutes along the sea path, then lunch by the fishing boats.",
        "from": "Jonah",
        "gem": false
      },
      {
        "tag": "Evening",
        "name": "Sunset at the cannons",
        "what": "Take a drink up to the old harbour cannons as the sun goes down.",
        "from": "Maya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Custom",
        "when": null,
        "name": "No cars, just donkeys",
        "what": "Cars are banned on the island, so donkeys and water taxis carry everything, suitcases included.",
        "from": "Maya"
      },
      {
        "tag": "Festival",
        "when": "Late June",
        "name": "Miaoulia",
        "what": "The island honours Admiral Miaoulis by setting a model ship alight in the harbour, with fireworks over the port.",
        "from": "Jonah"
      },
      {
        "tag": "Art",
        "when": null,
        "name": "The Slaughterhouse",
        "what": "The DESTE Foundation shows a new contemporary art project in the old slaughterhouse every summer.",
        "from": "Maya"
      }
    ],
    "tips": [
      {
        "tip": "There are no cars. Pack light, the donkeys carry bags but the steps are steep.",
        "from": "Maya"
      },
      {
        "tip": "Swim off the rocks at Spilia in the morning before the day boats arrive.",
        "from": "Jonah"
      },
      {
        "tip": "Take the 9am Flying Dolphin from Piraeus, it's two hours and much calmer than the afternoon one.",
        "from": "Maya"
      }
    ],
    "credits": null
  },
  "kyoto": {
    "kicker": "City · Culture",
    "scoreNote": "From 3 friends and people with your taste.",
    "bestTime": "Late March or November",
    "staysFrom": "from £160 a night",
    "goodFor": [
      "Couples",
      "Solo",
      "Friends"
    ],
    "temps": [
      9,
      10,
      14,
      20,
      25,
      28,
      32,
      34,
      29,
      23,
      17,
      12
    ],
    "bestMonths": [
      2,
      3,
      9,
      10
    ],
    "crowds": [
      1,
      1,
      2,
      3,
      2,
      1,
      2,
      2,
      1,
      2,
      3,
      1
    ],
    "said": [
      {
        "who": "Tom",
        "month": "Apr 2026",
        "quote": "Stay in a ryokan at least two nights.",
        "score": 9.5,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Hoshinoya Kyoto",
        "type": "Ryokan",
        "match": 91,
        "featured": true,
        "sub": "from £900 a night · Arrive by boat up the river to a quiet garden ryokan.",
        "because": "Because you gave Riad Zitoun a 9.1",
        "score": null,
        "photo": null
      },
      {
        "name": "Ryokan Hana",
        "type": "Ryokan",
        "match": 85,
        "featured": false,
        "sub": "from £310 a night · Tom stayed",
        "because": null,
        "score": 9.3,
        "photo": null
      },
      {
        "name": "Machiya in Higashiyama",
        "type": "Airbnb",
        "match": 83,
        "featured": false,
        "sub": "from £160 a night · Sam stayed",
        "because": null,
        "score": 8.8,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Gion Okumura",
        "price": "£££",
        "what": "Kaiseki dinner",
        "score": 9.5,
        "from": "Tom",
        "match": 93,
        "photo": null
      },
      {
        "name": "Weekenders Coffee",
        "price": "£",
        "what": "Pour-over in a tiny garden",
        "score": 8.9,
        "from": "Sophie",
        "match": 88,
        "photo": null
      },
      {
        "name": "Nishiki Market",
        "price": "£",
        "what": "Snacks stall to stall",
        "score": 8.7,
        "from": "Sam",
        "match": 82,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Kurama to Kibune hike",
        "what": "A forest trail between two mountain villages, then dinner over the river in summer.",
        "from": "Tom",
        "gem": true
      },
      {
        "tag": "Walk",
        "name": "Arashiyama bamboo grove",
        "what": "Be there by 7.30am, before the tour groups.",
        "from": "Tom",
        "gem": false
      },
      {
        "tag": "Culture",
        "name": "Tea ceremony",
        "what": "Book a small one in a machiya townhouse. An hour, and very calming.",
        "from": "Tom",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "All of July",
        "name": "Gion Matsuri",
        "what": "One of Japan's most famous festivals, with huge decorated floats paraded through the city on 17 and 24 July.",
        "from": "Tom"
      },
      {
        "tag": "Custom",
        "when": null,
        "name": "Respect the geiko",
        "what": "Don't follow or photograph geiko and maiko in Gion. Some private lanes are now closed to visitors.",
        "from": "Tom"
      },
      {
        "tag": "Food ritual",
        "when": null,
        "name": "A proper tea ceremony",
        "what": "Book a small tea house for matcha made the traditional way. Sit, watch, and turn the bowl before you sip.",
        "from": "Maya"
      }
    ],
    "tips": [
      {
        "tip": "Be at Fushimi Inari by 7am and walk past the first gate crowds to the top.",
        "from": "Tom"
      },
      {
        "tip": "Buy an ICOCA card at the station. It works on every bus and at the corner shops.",
        "from": "Tom"
      }
    ],
    "credits": null
  },
  "lisbon": {
    "kicker": "City · Food",
    "scoreNote": "From 5 friends and people with your taste.",
    "bestTime": "April to June",
    "staysFrom": "from £95 a night",
    "goodFor": [
      "Friends",
      "Solo"
    ],
    "temps": [
      15,
      16,
      19,
      20,
      22,
      26,
      28,
      29,
      27,
      23,
      18,
      15
    ],
    "bestMonths": [
      3,
      4,
      8,
      9
    ],
    "crowds": [
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      3,
      2,
      2,
      1,
      1
    ],
    "said": [
      {
        "who": "Priya",
        "month": "Apr 2026",
        "quote": "Perfect long weekend.",
        "score": 8.2,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Memmo Alfama",
        "type": "Hotel",
        "match": 94,
        "featured": true,
        "sub": "from £260 a night · Small rooftop pool looking over Alfama and the river.",
        "because": "Because you liked the small, central Hôtel du Marais",
        "score": null,
        "photo": null
      },
      {
        "name": "Santiago de Alfama",
        "type": "Hotel",
        "match": 89,
        "featured": false,
        "sub": "from £280 a night · Maya stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      },
      {
        "name": "Casa Alfama",
        "type": "Airbnb",
        "match": 81,
        "featured": false,
        "sub": "from £95 a night · Priya stayed",
        "because": null,
        "score": 8.3,
        "photo": null
      },
      {
        "name": "The Lumiares",
        "type": "Hotel",
        "match": 81,
        "featured": false,
        "sub": "from £230 a night · Sam stayed",
        "because": null,
        "score": 8.6,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Cervejaria Ramiro",
        "price": "££",
        "what": "Garlic prawns and a steak roll",
        "score": 9.2,
        "from": "Maya",
        "match": 92,
        "photo": "food-table"
      },
      {
        "name": "Taberna da Rua das Flores",
        "price": "££",
        "what": "Whatever's on the chalkboard",
        "score": 9.0,
        "from": "Priya",
        "match": 87,
        "photo": "food-wine"
      },
      {
        "name": "Manteigaria",
        "price": "£",
        "what": "Pastel de nata, still warm",
        "score": 9.0,
        "from": "Sophie",
        "match": 86,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Jardim do Torel",
        "what": "A tiny garden viewpoint locals use for reading. Never busy.",
        "from": "Priya",
        "gem": true
      },
      {
        "tag": "Day trip",
        "name": "Day trip to Sintra",
        "what": "Fairytale palaces in the hills. Take the early train from Rossio.",
        "from": "Priya",
        "gem": false
      },
      {
        "tag": "Evening",
        "name": "Sunset at Senhora do Monte",
        "what": "The highest viewpoint in the city. Bring a bottle of vinho verde.",
        "from": "Priya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Music",
        "when": null,
        "name": "Fado in Alfama",
        "what": "Lisbon's soulful songs, sung in tiny tavernas. Stay quiet during a song: it's the custom.",
        "from": "Jonah"
      },
      {
        "tag": "Festival",
        "when": "12–13 June",
        "name": "Santo António",
        "what": "The whole city parties in the streets, with grilled sardines, paper garlands and basil pots for luck.",
        "from": "Priya"
      },
      {
        "tag": "Art",
        "when": null,
        "name": "Azulejo tiles",
        "what": "The National Tile Museum tells the story of the blue and white tiles you'll see on every street.",
        "from": "Jonah"
      }
    ],
    "tips": [
      {
        "tip": "Skip tram 28 queues. Walk Alfama in the evening when the day-trippers leave.",
        "from": "Priya"
      }
    ],
    "credits": null
  },
  "longleat": {
    "kicker": "Safari · One night",
    "scoreNote": "From 4 friends and people with your taste.",
    "bestTime": "Spring and summer, or winter for the Festival of Light",
    "staysFrom": "from £140 a night",
    "goodFor": [
      "Families"
    ],
    "temps": [
      7,
      8,
      11,
      14,
      17,
      20,
      22,
      22,
      19,
      15,
      10,
      8
    ],
    "bestMonths": [
      4,
      5,
      8
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      2,
      1,
      1,
      2
    ],
    "said": [
      {
        "who": "Maya",
        "month": "Jul 2026",
        "quote": "Giraffes next to the car. Unbeatable.",
        "score": 8.7,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "The Bath Arms",
        "type": "B&B",
        "match": 87,
        "featured": true,
        "sub": "from £150 a night · A cosy pub with rooms on the Longleat estate.",
        "because": "Because you loved breakfast in the garden at Es Molí",
        "score": null,
        "photo": null
      },
      {
        "name": "Woolley Grange",
        "type": "Hotel",
        "match": 83,
        "featured": false,
        "sub": "from £220 a night · Mum stayed",
        "because": null,
        "score": 8.7,
        "photo": null
      },
      {
        "name": "The Lord Thynne",
        "type": "Hotel",
        "match": 81,
        "featured": false,
        "sub": "from £140 a night · Sophie stayed",
        "because": null,
        "score": 8.5,
        "photo": null
      },
      {
        "name": "Center Parcs Longleat Forest",
        "type": "Hotel",
        "match": 80,
        "featured": false,
        "sub": "from £250 a night · Maya stayed",
        "because": null,
        "score": 8.8,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "The Bath Arms",
        "price": "££",
        "what": "Sunday lunch at the pub on the Longleat estate",
        "score": 8.2,
        "from": "Maya",
        "match": 79,
        "photo": null
      },
      {
        "name": "The Bell at Kilmington",
        "price": "££",
        "what": "Pub lunch",
        "score": 8.3,
        "from": "Mum",
        "match": 78,
        "photo": "food-table"
      },
      {
        "name": "Center Parcs Forest Café",
        "price": "£",
        "what": "Pancakes for the kids",
        "score": 7.9,
        "from": "Sam",
        "match": 74,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Stourhead gardens",
        "what": "A National Trust garden with a lake and temples, 20 minutes away.",
        "from": "Maya",
        "gem": true
      },
      {
        "tag": "Animals",
        "name": "The drive-through safari",
        "what": "Lions, rhinos and giraffes from your own car.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Fun",
        "name": "Longleat House and maze",
        "what": "A grand Elizabethan house and one of the longest hedge mazes in the world.",
        "from": "Maya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "Winter",
        "name": "Festival of Light",
        "what": "Giant lanterns light up the grounds after dark.",
        "from": "Maya"
      }
    ],
    "tips": [
      {
        "tip": "Go to the safari first thing, before the queues.",
        "from": "Maya"
      },
      {
        "tip": "Take the car bypass at Monkey Jungle if you love your wing mirrors.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "madeira": {
    "kicker": "Hiking · Coast",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "All year",
    "staysFrom": "from £130 a night",
    "goodFor": [
      "Friends",
      "Solo"
    ],
    "temps": [
      19,
      19,
      20,
      20,
      21,
      23,
      25,
      26,
      26,
      24,
      22,
      20
    ],
    "bestMonths": [
      2,
      3,
      4,
      5,
      6,
      8,
      9,
      10,
      11
    ],
    "crowds": [
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      3,
      2,
      2,
      2,
      2
    ],
    "said": [
      {
        "who": "Jonah",
        "month": "Oct 2026",
        "quote": "Like Hawaii, three hours from Gatwick.",
        "score": 8.6,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Quinta Jardins do Lago",
        "type": "Hotel",
        "match": 89,
        "featured": true,
        "sub": "from £190 a night · An old manor in a botanical garden above Funchal.",
        "because": "Because you loved breakfast in the garden at Es Molí",
        "score": null,
        "photo": null
      },
      {
        "name": "Reid's Palace",
        "type": "Hotel",
        "match": 88,
        "featured": false,
        "sub": "from £360 a night · Tom stayed",
        "because": null,
        "score": 9.1,
        "photo": "pool-2"
      },
      {
        "name": "Quinta da Serra",
        "type": "Hotel",
        "match": 86,
        "featured": false,
        "sub": "from £130 a night · Jonah stayed",
        "because": null,
        "score": 8.5,
        "photo": null
      },
      {
        "name": "Quinta do Furão",
        "type": "Hotel",
        "match": 81,
        "featured": false,
        "sub": "from £150 a night · Sam stayed",
        "because": null,
        "score": 8.6,
        "photo": "villa-1"
      }
    ],
    "eats": [
      {
        "name": "Kampo",
        "price": "££",
        "what": "Island fish and black scabbard",
        "score": 8.8,
        "from": "Tom",
        "match": 83,
        "photo": "food-table"
      },
      {
        "name": "Mercado dos Lavradores",
        "price": "£",
        "what": "Passion fruit and espada",
        "score": 8.4,
        "from": "Jonah",
        "match": 77,
        "photo": null
      },
      {
        "name": "Taberna da Poncha",
        "price": "£",
        "what": "Poncha by the barrel",
        "score": 8.5,
        "from": "Sam",
        "match": 77,
        "photo": "food-wine"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Seixal",
        "what": "A black-sand beach under green cliffs and waterfalls on the north coast.",
        "from": "Jonah",
        "gem": true
      },
      {
        "tag": "Hike",
        "name": "Levada walk",
        "what": "Follow the old water channels through laurel forest. Caldeirão Verde is the best.",
        "from": "Jonah",
        "gem": false
      },
      {
        "tag": "Hike",
        "name": "Pico do Arieiro sunrise",
        "what": "Above the clouds before breakfast. Bring a warm layer.",
        "from": "Jonah",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "Spring",
        "name": "Flower Festival",
        "what": "Funchal fills with flower carpets and a parade of floats covered in blooms.",
        "from": "Jonah"
      },
      {
        "tag": "History",
        "when": null,
        "name": "The levadas",
        "what": "Centuries-old water channels that run across the island. The paths beside them are now the best walks.",
        "from": "Jonah"
      }
    ],
    "tips": [
      {
        "tip": "Walk the Ponta de São Lourenço trail at sunrise, before the wind picks up.",
        "from": "Jonah"
      }
    ],
    "credits": null
  },
  "maldives": {
    "kicker": "Island · Beach",
    "scoreNote": "From 3 friends and people with your taste.",
    "bestTime": "November to April",
    "staysFrom": "from £420 a night",
    "goodFor": [
      "Couples"
    ],
    "temps": [
      30,
      31,
      31,
      32,
      31,
      30,
      30,
      30,
      30,
      30,
      30,
      30
    ],
    "bestMonths": [
      0,
      1,
      2,
      3
    ],
    "crowds": [
      3,
      3,
      3,
      2,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      3
    ],
    "said": [
      {
        "who": "Maya",
        "month": "Feb 2026",
        "quote": "Like swimming in a swimming pool the size of the sea.",
        "score": 9.4,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Gili Lankanfushi",
        "type": "Villa",
        "match": 95,
        "featured": true,
        "sub": "from £1500 a night · Barefoot luxury. Overwater villas with no shoes allowed.",
        "because": "Because you gave Villa Limone a 9.0",
        "score": null,
        "photo": "maldives-2"
      },
      {
        "name": "Soneva Jani",
        "type": "Villa",
        "match": 91,
        "featured": false,
        "sub": "from £1800 a night · Maya stayed",
        "because": null,
        "score": 9.6,
        "photo": "maldives-1"
      },
      {
        "name": "Joali",
        "type": "Villa",
        "match": 89,
        "featured": false,
        "sub": "from £1500 a night · Sophie stayed",
        "because": null,
        "score": 9.4,
        "photo": "maldives-2"
      },
      {
        "name": "Six Senses Laamu",
        "type": "Villa",
        "match": 86,
        "featured": false,
        "sub": "from £1100 a night · Tom stayed",
        "because": null,
        "score": 9.2,
        "photo": "pool-2"
      },
      {
        "name": "Kuramathi Island",
        "type": "Hotel",
        "match": 83,
        "featured": false,
        "sub": "from £420 a night · Jonah stayed",
        "because": null,
        "score": 8.8,
        "photo": "maldives-2"
      }
    ],
    "eats": [
      {
        "name": "Sandbank dinner",
        "price": "£££",
        "what": "Grilled reef fish on a sandbank at sunset",
        "score": 9.3,
        "from": "Maya",
        "match": 91,
        "photo": null
      },
      {
        "name": "Ithaa Undersea",
        "price": "£££",
        "what": "Dinner under the sea",
        "score": 9.0,
        "from": "Tom",
        "match": 82,
        "photo": "food-wine"
      },
      {
        "name": "Fish market, Malé",
        "price": "£",
        "what": "Tuna curry before your boat",
        "score": 8.2,
        "from": "Sam",
        "match": 79,
        "photo": "food-table"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "A night on a local island",
        "what": "Guesthouses on islands like Maafushi cost a fraction of a resort, with the same water.",
        "from": "Maya",
        "gem": true
      },
      {
        "tag": "Snorkel",
        "name": "Swim with manta rays",
        "what": "Hanifaru Bay in Baa Atoll, from May to November.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Boat",
        "name": "Sunset dolphin cruise",
        "what": "Spinner dolphins jump alongside the dhoni.",
        "from": "Maya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Music",
        "when": null,
        "name": "Bodu beru drumming",
        "what": "Big drums, singing and dancing that speeds up until everyone joins in.",
        "from": "Maya"
      },
      {
        "tag": "History",
        "when": null,
        "name": "Malé's coral mosque",
        "what": "The Old Friday Mosque is carved from coral stone, from 1658.",
        "from": "Jonah"
      }
    ],
    "tips": [
      {
        "tip": "Pay for the seaplane transfer. The view on the way in is half the holiday.",
        "from": "Maya"
      },
      {
        "tip": "Pick an island with a good house reef so you can snorkel straight from the beach.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "marrakech": {
    "kicker": "City · Food",
    "scoreNote": "From 5 friends and people with your taste.",
    "bestTime": "March, April or October",
    "staysFrom": "from £120 a night",
    "goodFor": [
      "Friends",
      "Couples"
    ],
    "temps": [
      18,
      20,
      23,
      25,
      29,
      33,
      37,
      37,
      32,
      28,
      22,
      19
    ],
    "bestMonths": [
      2,
      3,
      4,
      9,
      10
    ],
    "crowds": [
      2,
      2,
      3,
      3,
      2,
      1,
      1,
      1,
      2,
      3,
      2,
      2
    ],
    "said": [
      {
        "who": "Maya",
        "month": "Mar 2026",
        "quote": "Book a riad with a roof terrace.",
        "score": 9.0,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "El Fenn",
        "type": "Riad",
        "match": 95,
        "featured": true,
        "sub": "from £380 a night · Pink walls, rooftop pool and a lot of art.",
        "because": "Because you gave Riad Zitoun a 9.1",
        "score": null,
        "photo": null
      },
      {
        "name": "Riad Zitoun",
        "type": "Riad",
        "match": 90,
        "featured": false,
        "sub": "from £120 a night · Maya stayed",
        "because": null,
        "score": 9.1,
        "photo": null
      },
      {
        "name": "Riad Yasmine",
        "type": "Riad",
        "match": 89,
        "featured": false,
        "sub": "from £140 a night · Priya stayed",
        "because": null,
        "score": 8.8,
        "photo": "pool-2"
      },
      {
        "name": "Dar Lila",
        "type": "Airbnb",
        "match": 85,
        "featured": false,
        "sub": "from £330 a night · Priya stayed",
        "because": null,
        "score": 8.4,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Nomad",
        "price": "££",
        "what": "Lamb tagine on the roof",
        "score": 8.9,
        "from": "Maya",
        "match": 86,
        "photo": null
      },
      {
        "name": "Café des Épices",
        "price": "£",
        "what": "Mint tea above the spice square",
        "score": 8.5,
        "from": "Priya",
        "match": 85,
        "photo": null
      },
      {
        "name": "Dar Yacout",
        "price": "£££",
        "what": "Long Moroccan feast",
        "score": 8.5,
        "from": "Sam",
        "match": 83,
        "photo": "food-table"
      },
      {
        "name": "Le Jardin",
        "price": "££",
        "what": "Lunch under the banana trees",
        "score": 8.7,
        "from": "Priya",
        "match": 80,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Maison de la Photographie",
        "what": "Old photos of Morocco and a quiet roof terrace with mint tea over the medina.",
        "from": "Maya",
        "gem": true
      },
      {
        "tag": "Wellness",
        "name": "Hammam and scrub",
        "what": "Do it on your first day. You'll sleep brilliantly.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Food",
        "name": "Cooking class",
        "what": "Shop the souk in the morning and cook tagine for lunch.",
        "from": "Priya",
        "gem": false
      },
      {
        "tag": "Day trip",
        "name": "Agafay desert evening",
        "what": "Forty minutes out of town for camel rides and dinner under the stars.",
        "from": "Maya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Music",
        "when": null,
        "name": "Jemaa el-Fnaa at dusk",
        "what": "Storytellers, musicians and food stalls fill the square every evening. It's on UNESCO's list of living heritage.",
        "from": "Priya"
      },
      {
        "tag": "Custom",
        "when": null,
        "name": "Bargaining is expected",
        "what": "Start at about a third of the first price in the souks and smile. Cover shoulders and knees in the medina.",
        "from": "Sam"
      },
      {
        "tag": "Art",
        "when": null,
        "name": "Jardin Majorelle",
        "what": "The famous blue garden, with the Yves Saint Laurent museum next door. Book a morning slot.",
        "from": "Priya"
      }
    ],
    "tips": [
      {
        "tip": "Ask your riad to send someone to meet you at the edge of the medina. Taxis can't get in.",
        "from": "Maya"
      },
      {
        "tip": "Le Jardin Secret is calmer than Majorelle and half the queue.",
        "from": "Priya"
      }
    ],
    "credits": null
  },
  "mauritius": {
    "kicker": "Island · Beach",
    "scoreNote": "From 3 friends and people with your taste.",
    "bestTime": "May to December",
    "staysFrom": "from £260 a night",
    "goodFor": [
      "Couples",
      "Families"
    ],
    "temps": [
      30,
      30,
      29,
      28,
      26,
      25,
      24,
      24,
      25,
      27,
      28,
      30
    ],
    "bestMonths": [
      4,
      5,
      8,
      9,
      10,
      11
    ],
    "crowds": [
      2,
      1,
      1,
      2,
      2,
      1,
      2,
      2,
      2,
      3,
      3,
      3
    ],
    "said": [
      {
        "who": "Sam",
        "month": "Oct 2025",
        "quote": "Great for families. Something for everyone.",
        "score": 8.8,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "One&Only Le Saint Géran",
        "type": "Hotel",
        "match": 91,
        "featured": true,
        "sub": "from £900 a night · On its own peninsula with calm lagoon on both sides.",
        "because": "Because you gave Villa Limone a 9.0",
        "score": null,
        "photo": null
      },
      {
        "name": "LUX* Le Morne",
        "type": "Hotel",
        "match": 84,
        "featured": false,
        "sub": "from £520 a night · Sam stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      },
      {
        "name": "Lakaz Chamarel",
        "type": "Hotel",
        "match": 83,
        "featured": false,
        "sub": "from £260 a night · Sam stayed",
        "because": null,
        "score": 8.7,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Le Château de Bel Ombre",
        "price": "£££",
        "what": "Creole dinner in the old house",
        "score": 8.8,
        "from": "Priya",
        "match": 89,
        "photo": "food-wine"
      },
      {
        "name": "Chez Tante Athalie",
        "price": "££",
        "what": "Creole lunch among old cars",
        "score": 8.6,
        "from": "Sam",
        "match": 83,
        "photo": "food-table"
      },
      {
        "name": "Port Louis street food",
        "price": "£",
        "what": "Dholl puri and gateaux piments from the market stalls",
        "score": 8.7,
        "from": "Sam",
        "match": 81,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Chamarel coloured earth",
        "what": "Sand dunes in seven colours, with a waterfall next door.",
        "from": "Sam",
        "gem": true
      },
      {
        "tag": "Hike",
        "name": "Hike Le Morne Brabant",
        "what": "Early start, steep top, and a view over the lagoon.",
        "from": "Sam",
        "gem": false
      },
      {
        "tag": "Boat",
        "name": "Catamaran to Île aux Cerfs",
        "what": "A day of swimming, snorkelling and a barbecue on board.",
        "from": "Sam",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Music",
        "when": null,
        "name": "Séga dance",
        "what": "Island music with drums and swaying skirts. Many hotels host a séga night.",
        "from": "Sam"
      },
      {
        "tag": "History",
        "when": null,
        "name": "Le Morne",
        "what": "A UNESCO site remembering the escaped slaves who hid on the mountain.",
        "from": "Maya"
      }
    ],
    "tips": [
      {
        "tip": "Stay on the west coast for sunsets and calmer winter weather.",
        "from": "Sam"
      },
      {
        "tip": "Hire a driver for a day. It's cheap and the roads are busy.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "orlando": {
    "kicker": "Theme parks · Family",
    "scoreNote": "From 6 friends and people with your taste.",
    "bestTime": "Late April, May or October",
    "staysFrom": "from £210 a night",
    "goodFor": [
      "Families",
      "Friends"
    ],
    "temps": [
      22,
      24,
      26,
      29,
      31,
      33,
      33,
      33,
      32,
      29,
      26,
      23
    ],
    "bestMonths": [
      2,
      3,
      9,
      10
    ],
    "crowds": [
      2,
      2,
      3,
      3,
      2,
      3,
      3,
      2,
      1,
      2,
      2,
      3
    ],
    "said": [
      {
        "who": "Tom",
        "month": "Apr 2026",
        "quote": "Exhausting but the kids still talk about it.",
        "score": 8.4,
        "face": null
      },
      {
        "who": "Jonah",
        "month": "May 2025",
        "quote": "Go in May, not August. The heat is serious.",
        "score": 7.8,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Four Seasons Orlando",
        "type": "Hotel",
        "match": 88,
        "featured": true,
        "sub": "from £600 a night · Huge pool with a lazy river, inside Disney.",
        "because": "Because you gave Villa Limone a 9.0",
        "score": null,
        "photo": null
      },
      {
        "name": "Lakeside Pool Villa",
        "type": "Villa",
        "match": 87,
        "featured": false,
        "sub": "from £290 a night · Tom stayed",
        "because": null,
        "score": 8.8,
        "photo": null
      },
      {
        "name": "Disney's Animal Kingdom Lodge",
        "type": "Hotel",
        "match": 83,
        "featured": false,
        "sub": "from £320 a night · Mum stayed",
        "because": null,
        "score": 8.7,
        "photo": "pool-1"
      },
      {
        "name": "Grand Floridian",
        "type": "Hotel",
        "match": 82,
        "featured": false,
        "sub": "from £650 a night · Sam stayed",
        "because": null,
        "score": 8.4,
        "photo": "pool-2"
      },
      {
        "name": "Palm Resort Orlando",
        "type": "Hotel",
        "match": 76,
        "featured": false,
        "sub": "from £210 a night · Jonah stayed",
        "because": null,
        "score": 8.2,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "The Ravenous Pig",
        "price": "££",
        "what": "Gastropub in Winter Park",
        "score": 8.6,
        "from": "Mum",
        "match": 84,
        "photo": "food-wine"
      },
      {
        "name": "Winter Park brunch",
        "price": "££",
        "what": "Pancakes on Park Avenue",
        "score": 8.6,
        "from": "Tom",
        "match": 83,
        "photo": null
      },
      {
        "name": "Kathmandu Kitchen",
        "price": "££",
        "what": "Dinner after the parks",
        "score": 8.2,
        "from": "Sam",
        "match": 80,
        "photo": "food-table"
      },
      {
        "name": "Lake Eola food trucks",
        "price": "£",
        "what": "Tacos by the lake on a Sunday",
        "score": 8.3,
        "from": "Jonah",
        "match": 78,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Winter Park boat tour",
        "what": "A gentle hour through the lakes and canals past old Florida houses.",
        "from": "Jonah",
        "gem": true
      },
      {
        "tag": "Family",
        "name": "Theme park days",
        "what": "Pick two or three parks, not all of them, and go early.",
        "from": "Tom",
        "gem": false
      },
      {
        "tag": "Day trip",
        "name": "Kennedy Space Center",
        "what": "An hour east. The rocket garden blew the kids away.",
        "from": "Jonah",
        "gem": false
      },
      {
        "tag": "Outdoors",
        "name": "Springs and kayaking",
        "what": "Swim in the crystal-clear springs at Wekiwa, 30 minutes north.",
        "from": "Tom",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Art",
        "when": null,
        "name": "Tiffany glass at the Morse",
        "what": "The Morse Museum in Winter Park has the world's biggest Louis Comfort Tiffany collection.",
        "from": "Tom"
      },
      {
        "tag": "Festival",
        "when": "January to February",
        "name": "Zora! Festival",
        "what": "Eatonville, one of America's first Black towns, celebrates the writer Zora Neale Hurston.",
        "from": "Priya"
      },
      {
        "tag": "Custom",
        "when": null,
        "name": "Tipping",
        "what": "Add 18 to 20% at restaurants and a few dollars for hotel staff. Prices are shown without tax.",
        "from": "Tom"
      }
    ],
    "tips": [
      {
        "tip": "Buy park tickets online in advance and use early entry. The first hour is the quietest.",
        "from": "Tom"
      },
      {
        "tip": "Plan a rest day by the pool between park days. Kids (and adults) need it.",
        "from": "Jonah"
      }
    ],
    "credits": null
  },
  "oxford": {
    "kicker": "City · One night",
    "scoreNote": "From 9 friends and people with your taste.",
    "bestTime": "May or early autumn",
    "staysFrom": "from £180 a night",
    "goodFor": [
      "Couples",
      "Friends"
    ],
    "temps": [
      7,
      8,
      11,
      14,
      17,
      20,
      22,
      22,
      19,
      15,
      10,
      8
    ],
    "bestMonths": [
      4,
      5,
      8
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      2,
      1,
      1,
      2
    ],
    "said": [
      {
        "who": "Harriet",
        "month": "Oct 2025",
        "quote": "Punting, pubs and a very long lunch at the Covered Market.",
        "score": 8.6,
        "face": null
      },
      {
        "who": "Priya",
        "month": "May 2026",
        "quote": "Felt like walking through a film set.",
        "score": 8.7,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "The Randolph",
        "type": "Hotel",
        "match": 89,
        "featured": true,
        "sub": "from £280 a night · The grand old hotel opposite the Ashmolean.",
        "because": "Because you liked the small, central Hôtel du Marais",
        "score": null,
        "photo": "oxford-1"
      },
      {
        "name": "The Store",
        "type": "Hotel",
        "match": 84,
        "featured": false,
        "sub": "from £180 a night · Sam stayed",
        "because": null,
        "score": 8.4,
        "photo": null
      },
      {
        "name": "Old Bank Hotel",
        "type": "Hotel",
        "match": 83,
        "featured": false,
        "sub": "from £280 a night · Priya stayed",
        "because": null,
        "score": 8.8,
        "photo": "oxford-1"
      }
    ],
    "eats": [
      {
        "name": "Gee's",
        "price": "££",
        "what": "Dinner in a glasshouse",
        "score": 8.7,
        "from": "Mum",
        "match": 83,
        "photo": "food-wine"
      },
      {
        "name": "The Turf Tavern",
        "price": "£",
        "what": "A pint in the hidden courtyard",
        "score": 8.3,
        "from": "Priya",
        "match": 79,
        "photo": null
      },
      {
        "name": "Vaults & Garden",
        "price": "£",
        "what": "Lunch beside the Radcliffe Camera",
        "score": 8.5,
        "from": "Sam",
        "match": 79,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Port Meadow to The Perch",
        "what": "Walk across the meadow with wild horses to a thatched pub for lunch.",
        "from": "Priya",
        "gem": true
      },
      {
        "tag": "History",
        "name": "Bodleian Library tour",
        "what": "See the Divinity School and the old reading rooms.",
        "from": "Priya",
        "gem": false
      },
      {
        "tag": "River",
        "name": "Punting on the Cherwell",
        "what": "Hire a punt at Magdalen Bridge and drift past the meadows.",
        "from": "Priya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "1 May",
        "name": "May Morning",
        "what": "At dawn, the Magdalen College choir sings from the top of the tower while the city listens below.",
        "from": "Priya"
      }
    ],
    "tips": [
      {
        "tip": "Bodleian Library tours sell out. Book online before you go.",
        "from": "Priya"
      },
      {
        "tip": "The Ashmolean is free and has a lovely rooftop café.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "paris": {
    "kicker": "City · Weekend",
    "scoreNote": "From 9 friends and people with your taste.",
    "bestTime": "April, May or September",
    "staysFrom": "from £175 a night",
    "goodFor": [
      "Couples",
      "Friends"
    ],
    "temps": [
      8,
      9,
      13,
      16,
      20,
      23,
      26,
      25,
      21,
      16,
      11,
      8
    ],
    "bestMonths": [
      4,
      7,
      8
    ],
    "crowds": [
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      2,
      2,
      2,
      1,
      2
    ],
    "said": [
      {
        "who": "Harriet",
        "month": "Apr 2026",
        "quote": "A picnic in the Tuileries beats any restaurant.",
        "score": 8.9,
        "face": null
      },
      {
        "who": "Tom",
        "month": "Sep 2026",
        "quote": "Never gets old. Book dinners ahead.",
        "score": 8.6,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Hôtel Particulier Montmartre",
        "type": "Hotel",
        "match": 92,
        "featured": true,
        "sub": "from £420 a night · Five suites in a hidden mansion with a secret garden.",
        "because": "Because you liked the small, central Hôtel du Marais",
        "score": null,
        "photo": "paris-1"
      },
      {
        "name": "Hôtel des Grands Boulevards",
        "type": "Hotel",
        "match": 88,
        "featured": false,
        "sub": "from £290 a night · Sophie stayed",
        "because": null,
        "score": 8.9,
        "photo": null
      },
      {
        "name": "Le Pigalle",
        "type": "Hotel",
        "match": 87,
        "featured": false,
        "sub": "from £260 a night · Sam stayed",
        "because": null,
        "score": 8.7,
        "photo": null
      },
      {
        "name": "Hôtel du Marais",
        "type": "Hotel",
        "match": 82,
        "featured": false,
        "sub": "from £175 a night · Tom stayed",
        "because": null,
        "score": 8.5,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Clamato",
        "price": "££",
        "what": "Oysters and raw fish",
        "score": 9.0,
        "from": "Maya",
        "match": 91,
        "photo": "food-wine"
      },
      {
        "name": "Le Bistrot d'à Côté",
        "price": "££",
        "what": "Steak frites and a carafe of red",
        "score": 8.9,
        "from": "Tom",
        "match": 85,
        "photo": null
      },
      {
        "name": "Bouillon Pigalle",
        "price": "£",
        "what": "Steak frites for under £15",
        "score": 8.4,
        "from": "Sam",
        "match": 76,
        "photo": "food-table"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Musée de la Vie Romantique",
        "what": "A hidden garden café in Pigalle, behind a little alley.",
        "from": "Priya",
        "gem": true
      },
      {
        "tag": "Culture",
        "name": "Musée de l'Orangerie",
        "what": "Monet's water lilies, and far quieter than the Louvre.",
        "from": "Tom",
        "gem": false
      },
      {
        "tag": "Evening",
        "name": "Picnic on the Seine",
        "what": "Cheese, bread and wine on the banks at Île Saint-Louis.",
        "from": "Priya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Custom",
        "when": null,
        "name": "Always say bonjour",
        "what": "Say \"Bonjour\" when you walk into a shop or café. It changes how you're treated.",
        "from": "Maya"
      },
      {
        "tag": "Festival",
        "when": "21 June",
        "name": "Fête de la Musique",
        "what": "Free concerts on every corner of the city, from jazz to DJs, all night.",
        "from": "Tom"
      },
      {
        "tag": "Art",
        "when": null,
        "name": "Musée d'Orsay",
        "what": "Impressionists in an old railway station. Go late on a Thursday when it's open longer.",
        "from": "Maya"
      }
    ],
    "tips": [
      {
        "tip": "Skip the queues and picnic by the Canal Saint-Martin on Sunday instead.",
        "from": "Priya"
      }
    ],
    "credits": null
  },
  "positano": {
    "kicker": "Coast · Food",
    "scoreNote": "From 6 friends and people with your taste.",
    "bestTime": "May or late September",
    "staysFrom": "from £260 a night",
    "goodFor": [
      "Couples",
      "Friends"
    ],
    "temps": [
      13,
      14,
      16,
      19,
      23,
      27,
      30,
      30,
      27,
      22,
      18,
      14
    ],
    "bestMonths": [
      9
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      3,
      3,
      3,
      3,
      3,
      2,
      1,
      1
    ],
    "said": [
      {
        "who": "Harriet",
        "month": "Jul 2025",
        "quote": "Lemon everything. Worth every step.",
        "score": 9.3,
        "face": null
      },
      {
        "who": "Priya",
        "month": "May 2026",
        "quote": "Expensive but I'd go back tomorrow.",
        "score": 9.2,
        "face": null
      },
      {
        "who": "Tom",
        "month": "Aug 2025",
        "quote": "Stairs everywhere. Worth it for dinner at sunset.",
        "score": 8.0,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Le Sirenuse",
        "type": "Hotel",
        "match": 92,
        "featured": true,
        "sub": "from £950 a night · Red-and-white terraces and the best pool view in town.",
        "because": "Because you gave Villa Limone a 9.0",
        "score": null,
        "photo": null
      },
      {
        "name": "Casa Buonocore",
        "type": "B&B",
        "match": 90,
        "featured": false,
        "sub": "from £310 a night · Sophie stayed",
        "because": null,
        "score": 8.9,
        "photo": "lemon-1"
      },
      {
        "name": "Villa Limone",
        "type": "Villa",
        "match": 88,
        "featured": false,
        "sub": "from £520 a night · Priya stayed",
        "because": null,
        "score": 9.0,
        "photo": "villa-1"
      },
      {
        "name": "Hotel Scalinatella",
        "type": "Hotel",
        "match": 82,
        "featured": false,
        "sub": "from £260 a night · Tom stayed",
        "because": null,
        "score": 7.9,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Da Adolfo",
        "price": "££",
        "what": "Mozzarella grilled on lemon leaves",
        "score": 9.4,
        "from": "Priya",
        "match": 92,
        "photo": "food-pasta"
      },
      {
        "name": "La Tagliata",
        "price": "££",
        "what": "Set menu up the hill",
        "score": 9.1,
        "from": "Tom",
        "match": 88,
        "photo": null
      },
      {
        "name": "Da Vincenzo",
        "price": "££",
        "what": "Fried zucchini flowers",
        "score": 9.1,
        "from": "Sophie",
        "match": 88,
        "photo": "food-table"
      },
      {
        "name": "Chez Black",
        "price": "£££",
        "what": "Spaghetti with sea urchin",
        "score": 8.6,
        "from": "Maya",
        "match": 82,
        "photo": "food-pasta"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Fornillo beach",
        "what": "Five minutes round the cliff path from the main beach, and half as busy.",
        "from": "Priya",
        "gem": true
      },
      {
        "tag": "Hike",
        "name": "Path of the Gods",
        "what": "Start in Bomerano and walk down to Nocelle. Go early, it's hot by 11.",
        "from": "Tom",
        "gem": false
      },
      {
        "tag": "Boat",
        "name": "Boat day to Capri",
        "what": "Share a small boat with friends and stop for swims on the way.",
        "from": "Priya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "15 August",
        "name": "Festa dell'Assunta",
        "what": "A procession, a re-enactment of a Saracen landing on the beach and fireworks over the bay.",
        "from": "Priya"
      },
      {
        "tag": "Custom",
        "when": null,
        "name": "The long lunch",
        "what": "Many small shops close in the early afternoon. Lunch is long and nobody rushes you.",
        "from": "Tom"
      }
    ],
    "tips": [
      {
        "tip": "Get the little red boat from the pier to Da Adolfo. Book a sunbed with lunch.",
        "from": "Priya"
      },
      {
        "tip": "Don't hire a car. The SITA bus from Sorrento is cheap and the drivers know the bends.",
        "from": "Tom"
      }
    ],
    "credits": null
  },
  "puglia": {
    "kicker": "Coast · Food",
    "scoreNote": "From 3 friends and people with your taste.",
    "bestTime": "June or September",
    "staysFrom": "from £150 a night",
    "goodFor": [
      "Friends",
      "Families"
    ],
    "temps": [
      13,
      13,
      16,
      19,
      23,
      28,
      31,
      31,
      27,
      22,
      18,
      14
    ],
    "bestMonths": [
      4,
      5,
      8,
      9
    ],
    "crowds": [
      1,
      1,
      1,
      1,
      2,
      2,
      3,
      3,
      2,
      1,
      1,
      1
    ],
    "said": [
      {
        "who": "Priya",
        "month": "Sep 2026",
        "quote": "Better food than the Amalfi coast for half the price.",
        "score": 9.0,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Borgo Egnazia",
        "type": "Hotel",
        "match": 93,
        "featured": true,
        "sub": "from £550 a night · A whitewashed village built as a hotel, with three pools.",
        "because": "Because you gave Riad Zitoun a 9.1",
        "score": null,
        "photo": "pool-1"
      },
      {
        "name": "Grotta Palazzese",
        "type": "Hotel",
        "match": 90,
        "featured": false,
        "sub": "from £340 a night · Maya stayed",
        "because": null,
        "score": 8.8,
        "photo": null
      },
      {
        "name": "Masseria Ulivo",
        "type": "Villa",
        "match": 89,
        "featured": false,
        "sub": "from £450 a night · Priya stayed",
        "because": null,
        "score": 9.0,
        "photo": "villa-1"
      },
      {
        "name": "Trullo near Alberobello",
        "type": "Airbnb",
        "match": 86,
        "featured": false,
        "sub": "from £150 a night · Sophie stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Pescaria",
        "price": "£",
        "what": "Raw prawn sandwich",
        "score": 8.7,
        "from": "Tom",
        "match": 88,
        "photo": "food-pasta"
      },
      {
        "name": "Il Super Mago del Gelo",
        "price": "£",
        "what": "Coffee with almond milk granita",
        "score": 8.6,
        "from": "Sam",
        "match": 85,
        "photo": null
      },
      {
        "name": "Antiche Mura",
        "price": "££",
        "what": "Orecchiette with turnip tops",
        "score": 8.9,
        "from": "Sophie",
        "match": 82,
        "photo": "food-pasta"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Grotta della Poesia",
        "what": "A natural rock pool open to the sea, 90 minutes down the coast. Go before 10.",
        "from": "Priya",
        "gem": true
      },
      {
        "tag": "Day trip",
        "name": "Alberobello trulli",
        "what": "The little cone-roofed houses. Go late afternoon when the coaches leave.",
        "from": "Priya",
        "gem": false
      },
      {
        "tag": "Boat",
        "name": "Sea cave boat trip",
        "what": "An hour under Polignano's cliffs, with a swim stop.",
        "from": "Tom",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "August",
        "name": "La Notte della Taranta",
        "what": "A huge night of pizzica, Puglia's fast folk dance, in Melpignano in the Salento.",
        "from": "Priya"
      },
      {
        "tag": "Food ritual",
        "when": null,
        "name": "Orecchiette street",
        "what": "In Bari's old town, women make orecchiette by hand outside their front doors. Buy a bag to take home.",
        "from": "Tom"
      },
      {
        "tag": "History",
        "when": null,
        "name": "The trulli",
        "what": "The white cone-roofed stone houses of Alberobello are a UNESCO site. Stay in one if you can.",
        "from": "Priya"
      }
    ],
    "tips": [
      {
        "tip": "Base yourself inland and drive to a different beach each day.",
        "from": "Priya"
      }
    ],
    "credits": null
  },
  "seychelles": {
    "kicker": "Island · Beach",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "April, May, October and November",
    "staysFrom": "from £220 a night",
    "goodFor": [
      "Couples",
      "Friends"
    ],
    "temps": [
      29,
      30,
      31,
      31,
      30,
      28,
      27,
      27,
      28,
      29,
      30,
      30
    ],
    "bestMonths": [
      3,
      4,
      9,
      10
    ],
    "crowds": [
      2,
      2,
      2,
      3,
      3,
      2,
      2,
      2,
      2,
      3,
      3,
      2
    ],
    "said": [
      {
        "who": "Tom",
        "month": "Apr 2025",
        "quote": "Every beach looks like a screensaver.",
        "score": 9.2,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Château St Cloud",
        "type": "Hotel",
        "match": 90,
        "featured": true,
        "sub": "from £220 a night · An old vanilla plantation house in the jungle.",
        "because": "Because you loved breakfast in the garden at Es Molí",
        "score": null,
        "photo": null
      },
      {
        "name": "Six Senses Zil Pasyon",
        "type": "Villa",
        "match": 88,
        "featured": false,
        "sub": "from £1300 a night · Maya stayed",
        "because": null,
        "score": 9.3,
        "photo": "pool-1"
      },
      {
        "name": "Le Domaine de L'Orangeraie",
        "type": "Villa",
        "match": 83,
        "featured": false,
        "sub": "from £480 a night · Tom stayed",
        "because": null,
        "score": 9.1,
        "photo": null
      },
      {
        "name": "Le Repaire",
        "type": "B&B",
        "match": 81,
        "featured": false,
        "sub": "from £220 a night · Sam stayed",
        "because": null,
        "score": 8.6,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Chez Jules",
        "price": "££",
        "what": "Creole fish curry right on Anse Banane",
        "score": 9.0,
        "from": "Tom",
        "match": 89,
        "photo": null
      },
      {
        "name": "Takamaka beach shack",
        "price": "£",
        "what": "Fresh coconut and banana fritters",
        "score": 8.4,
        "from": "Maya",
        "match": 82,
        "photo": null
      },
      {
        "name": "Fish Trap",
        "price": "££",
        "what": "Creole grilled fish",
        "score": 8.6,
        "from": "Sam",
        "match": 81,
        "photo": "food-table"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Anse Marron hike",
        "what": "A guided scramble through boulders to a hidden natural pool.",
        "from": "Tom",
        "gem": true
      },
      {
        "tag": "Beach",
        "name": "Anse Source d'Argent",
        "what": "The famous boulder beach. Small entry fee through the old plantation.",
        "from": "Tom",
        "gem": false
      },
      {
        "tag": "Day trip",
        "name": "Day trip to Praslin",
        "what": "Vallée de Mai's giant coco de mer palms, a UNESCO forest.",
        "from": "Tom",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "October",
        "name": "Festival Kreol",
        "what": "A week of Creole food, music and dance across the islands.",
        "from": "Tom"
      }
    ],
    "tips": [
      {
        "tip": "Hire a bike on day one. The whole island is about 20 minutes across.",
        "from": "Tom"
      },
      {
        "tip": "Get to Anse Source d'Argent at low tide, first thing.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "sicily": {
    "kicker": "City · Beach",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "May or October",
    "staysFrom": "from £110 a night",
    "goodFor": [
      "Friends"
    ],
    "temps": [
      15,
      15,
      17,
      19,
      23,
      27,
      30,
      31,
      28,
      24,
      20,
      16
    ],
    "bestMonths": [
      4,
      5,
      8,
      9,
      10
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      2,
      2,
      1,
      1
    ],
    "said": [
      {
        "who": "Maya",
        "month": "Oct 2026",
        "quote": "Chaotic and brilliant. Eat everything.",
        "score": 8.5,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Villa Igiea",
        "type": "Hotel",
        "match": 91,
        "featured": true,
        "sub": "from £450 a night · Art nouveau palace with a pool right on the sea.",
        "because": "Because you gave Villa Limone a 9.0",
        "score": null,
        "photo": null
      },
      {
        "name": "Palazzo Butera Rooms",
        "type": "Airbnb",
        "match": 90,
        "featured": false,
        "sub": "from £110 a night · Maya stayed",
        "because": null,
        "score": 8.7,
        "photo": null
      },
      {
        "name": "BB22 Palace",
        "type": "B&B",
        "match": 84,
        "featured": false,
        "sub": "from £120 a night · Sam stayed",
        "because": null,
        "score": 8.5,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Ballarò Market",
        "price": "£",
        "what": "Panelle and arancine",
        "score": 8.7,
        "from": "Sam",
        "match": 85,
        "photo": "food-table"
      },
      {
        "name": "Bisso Bistrot",
        "price": "£",
        "what": "Pasta with sardines",
        "score": 8.9,
        "from": "Priya",
        "match": 82,
        "photo": "food-pasta"
      },
      {
        "name": "Antica Focacceria",
        "price": "£",
        "what": "Arancine and cannoli",
        "score": 8.8,
        "from": "Maya",
        "match": 80,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Zingaro nature reserve",
        "what": "Coves you can only reach on foot, an hour west of the city.",
        "from": "Maya",
        "gem": true
      },
      {
        "tag": "Food",
        "name": "Ballarò market",
        "what": "Graze your way through: panelle, sfincione, fresh juice.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Culture",
        "name": "Monreale cathedral",
        "what": "Twenty minutes up the hill. The gold mosaics are unreal.",
        "from": "Maya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Art",
        "when": null,
        "name": "Puppet theatre",
        "what": "Opera dei Pupi: knights in armour fight on stage with hand-carved puppets. Catch a show in Palermo.",
        "from": "Sam"
      },
      {
        "tag": "Festival",
        "when": "14–15 July",
        "name": "U Fistinu",
        "what": "Palermo's party for Santa Rosalia, with a giant chariot through the streets and fireworks at the sea.",
        "from": "Sam"
      },
      {
        "tag": "Food ritual",
        "when": null,
        "name": "Granita for breakfast",
        "what": "In summer, Sicilians have almond or coffee granita with a warm brioche to dip.",
        "from": "Maya"
      }
    ],
    "tips": [
      {
        "tip": "Take the bus to Mondello for a beach afternoon. Rent a sunbed, it's worth it.",
        "from": "Maya"
      }
    ],
    "credits": null
  },
  "stanton": {
    "kicker": "Ski · Après",
    "scoreNote": "From 4 friends and people with your taste.",
    "bestTime": "January to March",
    "staysFrom": "from \u00a3260 a night",
    "goodFor": [
      "Friends"
    ],
    "temps": [
      -2,
      0,
      4,
      9,
      14,
      17,
      20,
      19,
      15,
      10,
      3,
      -1
    ],
    "bestMonths": [
      0,
      1,
      2
    ],
    "crowds": [
      3,
      3,
      3,
      2,
      1,
      2,
      2,
      2,
      1,
      1,
      1,
      3
    ],
    "said": [
      {
        "who": "Tom",
        "month": "Jan 2026",
        "quote": "Huge mountain and the most fun après anywhere.",
        "score": 9.2,
        "face": null
      },
      {
        "who": "Sam",
        "month": "Feb 2026",
        "quote": "Not for beginners, but brilliant.",
        "score": 8.8,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Hotel Anton",
        "type": "Hotel",
        "match": 91,
        "featured": true,
        "sub": "from £260 a night · Small design hotel a minute from the Galzig lift.",
        "because": "Because you liked the small, central Hôtel du Marais",
        "score": null,
        "photo": null
      },
      {
        "name": "Chalet Valluga",
        "type": "Airbnb",
        "match": 89,
        "featured": false,
        "sub": "from £300 a night · Sophie stayed",
        "because": null,
        "score": 8.9,
        "photo": null
      },
      {
        "name": "Hotel Schwarzer Adler",
        "type": "Hotel",
        "match": 88,
        "featured": false,
        "sub": "from £380 a night · Tom stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      },
      {
        "name": "Arlberg1800 Resort",
        "type": "Hotel",
        "match": 80,
        "featured": false,
        "sub": "from £450 a night · Sam stayed",
        "because": null,
        "score": 8.8,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Hospiz Alm",
        "price": "£££",
        "what": "Lunch with a slide to the cellar",
        "score": 9.0,
        "from": "Sophie",
        "match": 88,
        "photo": "food-table"
      },
      {
        "name": "MooserWirt",
        "price": "££",
        "what": "Après on the slopes, then ski down",
        "score": 9.2,
        "from": "Tom",
        "match": 86,
        "photo": "food-wine"
      },
      {
        "name": "Krazy Kanguruh",
        "price": "££",
        "what": "Après with live music",
        "score": 8.8,
        "from": "Sam",
        "match": 80,
        "photo": "food-wine"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Ulmer Hütte",
        "what": "A quiet hut high above Rendl with homemade cake.",
        "from": "Tom",
        "gem": true
      },
      {
        "tag": "Ski",
        "name": "Ski to Lech",
        "what": "The Flexenbahn links St Anton to Lech and Zürs. A full day of new runs.",
        "from": "Tom",
        "gem": false
      },
      {
        "tag": "Evening",
        "name": "Tobogganing at night",
        "what": "Floodlit run down from Gampen on Tuesdays and Thursdays.",
        "from": "Sam",
        "gem": false
      }
    ],
    "culture": [],
    "tips": [
      {
        "tip": "Get the Arlberg pass so you can ski over to Lech and Zürs.",
        "from": "Tom"
      }
    ],
    "credits": null
  },
  "stives": {
    "kicker": "Beach · Weekend",
    "scoreNote": "From 4 friends and people with your taste.",
    "bestTime": "June or September",
    "staysFrom": "from £150 a night",
    "goodFor": [
      "Families",
      "Friends"
    ],
    "temps": [
      10,
      10,
      11,
      13,
      16,
      18,
      20,
      20,
      18,
      16,
      13,
      11
    ],
    "bestMonths": [
      4,
      5,
      8,
      9
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      2,
      1,
      1,
      1
    ],
    "said": [
      {
        "who": "Maya",
        "month": "Aug 2026",
        "quote": "That water is unreal on a sunny day.",
        "score": 8.8,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Boskerris Hotel",
        "type": "Hotel",
        "match": 91,
        "featured": true,
        "sub": "from £230 a night · Every room looks out over Carbis Bay.",
        "because": "Because you loved the views at Casa Arrozal",
        "score": null,
        "photo": null
      },
      {
        "name": "Harbour Loft",
        "type": "Airbnb",
        "match": 87,
        "featured": false,
        "sub": "from £150 a night · Maya stayed",
        "because": null,
        "score": 8.7,
        "photo": null
      },
      {
        "name": "Tregenna Castle",
        "type": "Hotel",
        "match": 79,
        "featured": false,
        "sub": "from £170 a night · Mum stayed",
        "because": null,
        "score": 8.2,
        "photo": "pool-1"
      }
    ],
    "eats": [
      {
        "name": "Porthminster Beach Café",
        "price": "££",
        "what": "Seafood on the sand",
        "score": 9.0,
        "from": "Maya",
        "match": 94,
        "photo": "food-table"
      },
      {
        "name": "Porthmeor Beach Café",
        "price": "££",
        "what": "Tapas as the sun sets",
        "score": 8.8,
        "from": "Sophie",
        "match": 85,
        "photo": "food-wine"
      },
      {
        "name": "The Hub",
        "price": "£",
        "what": "Fish and chips on the harbour",
        "score": 8.2,
        "from": "Sam",
        "match": 83,
        "photo": "food-table"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Porthgwidden",
        "what": "A tiny sheltered beach round the headland that's calm when the others are windy.",
        "from": "Maya",
        "gem": true
      },
      {
        "tag": "Culture",
        "name": "Tate St Ives",
        "what": "Art with a view over Porthmeor beach. Café on the roof.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Hike",
        "name": "Coast path to Zennor",
        "what": "Six wild miles, then a pint at the Tinners Arms.",
        "from": "Maya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Art",
        "when": null,
        "name": "Barbara Hepworth's garden",
        "what": "The sculptor's studio and garden are kept as she left them. Pair it with Tate St Ives.",
        "from": "Priya"
      },
      {
        "tag": "Festival",
        "when": "September",
        "name": "St Ives September Festival",
        "what": "Two weeks of music, poetry and open studios around town.",
        "from": "Priya"
      }
    ],
    "tips": [
      {
        "tip": "Take the sleeper train down on Friday night and wake up by the sea.",
        "from": "Maya"
      }
    ],
    "credits": null
  },
  "stratford": {
    "kicker": "Town · One night",
    "scoreNote": "From 4 friends and people with your taste.",
    "bestTime": "Spring and summer, when the riverside is busy",
    "staysFrom": "from \u00a3160 a night",
    "goodFor": [
      "Couples",
      "Friends"
    ],
    "temps": [
      7,
      8,
      11,
      14,
      17,
      20,
      22,
      22,
      19,
      15,
      10,
      8
    ],
    "bestMonths": [
      4,
      5,
      8
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      2,
      1,
      1,
      2
    ],
    "said": [
      {
        "who": "Sam",
        "month": "Jul 2026",
        "quote": "The play was the highlight of my year.",
        "score": 8.6,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Hotel Indigo Stratford",
        "type": "Hotel",
        "match": 86,
        "featured": true,
        "sub": "from £160 a night · A Tudor building on the high street.",
        "because": "Because you liked the small, central Hôtel du Marais",
        "score": null,
        "photo": null
      },
      {
        "name": "The Arden Hotel",
        "type": "Hotel",
        "match": 84,
        "featured": false,
        "sub": "from £190 a night · Sam stayed",
        "because": null,
        "score": 8.7,
        "photo": null
      },
      {
        "name": "Hotel du Vin Stratford",
        "type": "Hotel",
        "match": 80,
        "featured": false,
        "sub": "from £170 a night · Sophie stayed",
        "because": null,
        "score": 8.5,
        "photo": "bath-1"
      },
      {
        "name": "Ettington Park",
        "type": "Hotel",
        "match": 78,
        "featured": false,
        "sub": "from £190 a night · Mum stayed",
        "because": null,
        "score": 8.6,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "The Rooftop Restaurant",
        "price": "££",
        "what": "Pre-theatre dinner",
        "score": 8.4,
        "from": "Mum",
        "match": 85,
        "photo": "food-table"
      },
      {
        "name": "The Dirty Duck",
        "price": "££",
        "what": "Pre-theatre dinner on the terrace, where the actors drink",
        "score": 8.2,
        "from": "Sam",
        "match": 79,
        "photo": null
      },
      {
        "name": "Lambs",
        "price": "££",
        "what": "Classic bistro",
        "score": 8.5,
        "from": "Sophie",
        "match": 78,
        "photo": "food-wine"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Holy Trinity Church",
        "what": "The peaceful riverside church where Shakespeare is buried.",
        "from": "Sam",
        "gem": true
      },
      {
        "tag": "History",
        "name": "Shakespeare's Birthplace",
        "what": "The half-timbered house where he was born, with actors performing in the garden.",
        "from": "Sam",
        "gem": false
      },
      {
        "tag": "Theatre",
        "name": "An RSC play",
        "what": "Shakespeare performed by the Royal Shakespeare Company in his home town.",
        "from": "Sam",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "Late April",
        "name": "Shakespeare's birthday",
        "what": "The town celebrates with a parade, music and flowers laid on his grave.",
        "from": "Sam"
      }
    ],
    "tips": [
      {
        "tip": "Eat early and book the play before you book the hotel.",
        "from": "Sam"
      },
      {
        "tip": "Hire a rowing boat on the Avon in the morning.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "turks": {
    "kicker": "Island · Beach",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "December to April",
    "staysFrom": "from £650 a night",
    "goodFor": [
      "Couples",
      "Families"
    ],
    "temps": [
      27,
      27,
      28,
      29,
      30,
      31,
      31,
      32,
      31,
      30,
      29,
      28
    ],
    "bestMonths": [
      0,
      1,
      2,
      3,
      11
    ],
    "crowds": [
      3,
      3,
      3,
      3,
      2,
      2,
      2,
      1,
      1,
      1,
      2,
      3
    ],
    "said": [
      {
        "who": "Priya",
        "month": "Mar 2026",
        "quote": "The softest sand and clearest water in the Caribbean.",
        "score": 9.0,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "COMO Parrot Cay",
        "type": "Hotel",
        "match": 90,
        "featured": true,
        "sub": "from £1100 a night · A private island with a long, empty beach.",
        "because": "Because you loved the views at Casa Arrozal",
        "score": null,
        "photo": null
      },
      {
        "name": "Grace Bay Club",
        "type": "Hotel",
        "match": 89,
        "featured": false,
        "sub": "from £750 a night · Priya stayed",
        "because": null,
        "score": 9.1,
        "photo": null
      },
      {
        "name": "The Palms",
        "type": "Hotel",
        "match": 84,
        "featured": false,
        "sub": "from £650 a night · Sam stayed",
        "because": null,
        "score": 8.7,
        "photo": "pool-2"
      }
    ],
    "eats": [
      {
        "name": "Coco Bistro",
        "price": "£££",
        "what": "Dinner under the palms",
        "score": 8.9,
        "from": "Sophie",
        "match": 86,
        "photo": "food-wine"
      },
      {
        "name": "Hemingway's",
        "price": "££",
        "what": "Fish tacos on the beach",
        "score": 8.5,
        "from": "Sam",
        "match": 83,
        "photo": "food-table"
      },
      {
        "name": "Da Conch Shack",
        "price": "££",
        "what": "Fresh conch salad on the beach",
        "score": 8.9,
        "from": "Priya",
        "match": 82,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Long Bay Beach",
        "what": "Kitesurfers and almost nobody else, ten minutes from Grace Bay.",
        "from": "Priya",
        "gem": true
      },
      {
        "tag": "Boat",
        "name": "Iguana Island",
        "what": "Little Water Cay, home to rare rock iguanas. Short boat trip.",
        "from": "Priya",
        "gem": false
      },
      {
        "tag": "Outdoors",
        "name": "Kayak the mangroves",
        "what": "Paddle through calm channels full of baby sharks and turtles.",
        "from": "Priya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "November",
        "name": "Conch Festival",
        "what": "Chefs compete with conch fritters, curry and salad.",
        "from": "Priya"
      }
    ],
    "tips": [
      {
        "tip": "Snorkel Smith's Reef straight from the beach. No boat needed.",
        "from": "Priya"
      },
      {
        "tip": "Go to the Thursday Fish Fry in Bight Park for local food and music.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "valthorens": {
    "kicker": "Ski · Après",
    "scoreNote": "From 4 friends and people with your taste.",
    "bestTime": "December to April",
    "staysFrom": "from £320 a night",
    "goodFor": [
      "Friends"
    ],
    "temps": [
      -4,
      -3,
      0,
      3,
      7,
      12,
      15,
      15,
      11,
      6,
      0,
      -3
    ],
    "bestMonths": [
      10
    ],
    "crowds": [
      3,
      3,
      3,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      1,
      3
    ],
    "said": [
      {
        "who": "Maya",
        "month": "Jan 2026",
        "quote": "Snow is brilliant even in April. Great for groups.",
        "score": 8.4,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Altapura",
        "type": "Hotel",
        "match": 87,
        "featured": true,
        "sub": "from £520 a night · Ski-in, ski-out with a big outdoor pool.",
        "because": "Because you gave Villa Limone a 9.0",
        "score": null,
        "photo": null
      },
      {
        "name": "Fitz Roy",
        "type": "Hotel",
        "match": 86,
        "featured": false,
        "sub": "from £520 a night · Sophie stayed",
        "because": null,
        "score": 8.8,
        "photo": null
      },
      {
        "name": "Ski-in Chalet Cîmes",
        "type": "Hotel",
        "match": 80,
        "featured": false,
        "sub": "from £320 a night · Maya stayed",
        "because": null,
        "score": 8.5,
        "photo": null
      },
      {
        "name": "Koh-I Nor",
        "type": "Hotel",
        "match": 79,
        "featured": false,
        "sub": "from £480 a night · Sam stayed",
        "because": null,
        "score": 8.6,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "La Folie Douce",
        "price": "££",
        "what": "Long lunch and dancing on the tables",
        "score": 8.7,
        "from": "Maya",
        "match": 83,
        "photo": null
      },
      {
        "name": "Les Chalets du Thorens",
        "price": "££",
        "what": "Lunch on the slopes",
        "score": 8.6,
        "from": "Sophie",
        "match": 82,
        "photo": "food-table"
      },
      {
        "name": "Le Bouchon",
        "price": "££",
        "what": "Tartiflette after skiing",
        "score": 8.3,
        "from": "Sam",
        "match": 81,
        "photo": "food-wine"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Sunrise first lift",
        "what": "Be on the first chair and have the whole mountain to yourself for an hour.",
        "from": "Maya",
        "gem": true
      },
      {
        "tag": "Ski",
        "name": "Three Valleys ski day",
        "what": "Ski across to Méribel and back in a day. Start early.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Fun",
        "name": "Toboggan run",
        "what": "A 6km sledge run lit up at night.",
        "from": "Maya",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Food ritual",
        "when": null,
        "name": "Savoyard dinners",
        "what": "Raclette, fondue and tartiflette. Book a mountain restaurant for a cheese night.",
        "from": "Maya"
      }
    ],
    "tips": [
      {
        "tip": "Book the Three Valleys pass. You can ski over to Méribel and Courchevel for lunch.",
        "from": "Maya"
      }
    ],
    "credits": null
  },
  "verbier": {
    "kicker": "Ski · Mountains",
    "scoreNote": "From 3 friends and people with your taste.",
    "bestTime": "January to March",
    "staysFrom": "from £290 a night",
    "goodFor": [
      "Friends",
      "Couples"
    ],
    "temps": [
      -1,
      0,
      4,
      8,
      13,
      17,
      20,
      19,
      15,
      10,
      4,
      0
    ],
    "bestMonths": [
      0,
      1,
      2
    ],
    "crowds": [
      3,
      3,
      3,
      2,
      1,
      2,
      2,
      2,
      1,
      1,
      1,
      3
    ],
    "said": [
      {
        "who": "Sophie",
        "month": "Feb 2026",
        "quote": "Gorgeous village and properly challenging skiing.",
        "score": 9.0,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Cordée des Alpes",
        "type": "Hotel",
        "match": 92,
        "featured": true,
        "sub": "from £480 a night · Calm, wood-panelled, with a spa.",
        "because": "Because you gave Riad Zitoun a 9.1",
        "score": null,
        "photo": null
      },
      {
        "name": "Chalet d'Adrien",
        "type": "Hotel",
        "match": 89,
        "featured": false,
        "sub": "from £640 a night · Maya stayed",
        "because": null,
        "score": 9.1,
        "photo": null
      },
      {
        "name": "W Verbier",
        "type": "Hotel",
        "match": 82,
        "featured": false,
        "sub": "from £520 a night · Sophie stayed",
        "because": null,
        "score": 8.8,
        "photo": null
      },
      {
        "name": "Hotel Farinet",
        "type": "Hotel",
        "match": 80,
        "featured": false,
        "sub": "from £290 a night · Sam stayed",
        "because": null,
        "score": 8.4,
        "photo": "bath-1"
      }
    ],
    "eats": [
      {
        "name": "Cabane Mont Fort",
        "price": "££",
        "what": "Rösti at 2,457m",
        "score": 8.9,
        "from": "Sam",
        "match": 86,
        "photo": "food-table"
      },
      {
        "name": "La Marlenaz",
        "price": "££",
        "what": "Raclette in a mountain hut",
        "score": 9.0,
        "from": "Sophie",
        "match": 82,
        "photo": "food-table"
      },
      {
        "name": "Le Rouge",
        "price": "££",
        "what": "Lunch and DJ sets on the slopes",
        "score": 8.5,
        "from": "Maya",
        "match": 78,
        "photo": "food-wine"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Bruson",
        "what": "A quiet sister resort across the valley. No queues.",
        "from": "Sophie",
        "gem": true
      },
      {
        "tag": "Ski",
        "name": "Mont Fort",
        "what": "The top of the 4 Vallées at 3,330m. Views to the Matterhorn.",
        "from": "Sophie",
        "gem": false
      },
      {
        "tag": "Relax",
        "name": "W Spa",
        "what": "Pool and hammam after skiing.",
        "from": "Sophie",
        "gem": false
      }
    ],
    "culture": [],
    "tips": [
      {
        "tip": "Fly to Geneva, it's two hours by train and bus. Ski Mont Fort early for the view.",
        "from": "Sophie"
      }
    ],
    "credits": null
  },
  "warwick": {
    "kicker": "Castle · One night",
    "scoreNote": "From 5 friends and people with your taste.",
    "bestTime": "Summer holidays for the shows",
    "staysFrom": "from £110 a night",
    "goodFor": [
      "Families"
    ],
    "temps": [
      7,
      8,
      11,
      14,
      17,
      20,
      22,
      22,
      19,
      15,
      10,
      8
    ],
    "bestMonths": [
      4,
      5,
      8
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      2,
      1,
      1,
      2
    ],
    "said": [
      {
        "who": "Sam",
        "month": "Aug 2026",
        "quote": "The kids talked about it for weeks.",
        "score": 8.8,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "The Lord Leycester Hotel",
        "type": "Hotel",
        "match": 85,
        "featured": true,
        "sub": "from £130 a night · Old coaching inn, a short walk to the castle.",
        "because": "Because you liked the small, central Hôtel du Marais",
        "score": null,
        "photo": null
      },
      {
        "name": "Warwick Castle Knight's Village",
        "type": "Hotel",
        "match": 84,
        "featured": false,
        "sub": "from £220 a night · Sam stayed",
        "because": null,
        "score": 8.9,
        "photo": null
      },
      {
        "name": "Warwick Castle Glamping",
        "type": "Hotel",
        "match": 81,
        "featured": false,
        "sub": "from £160 a night · Sam stayed",
        "because": null,
        "score": 8.4,
        "photo": null
      },
      {
        "name": "The Tudor House Inn",
        "type": "B&B",
        "match": 81,
        "featured": false,
        "sub": "from £110 a night · Mum stayed",
        "because": null,
        "score": 8.0,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Tailors",
        "price": "££",
        "what": "Seasonal dinner in town",
        "score": 8.6,
        "from": "Mum",
        "match": 82,
        "photo": "food-table"
      },
      {
        "name": "Thomas Oken Tea Rooms",
        "price": "£",
        "what": "Cream tea",
        "score": 8.3,
        "from": "Sophie",
        "match": 79,
        "photo": null
      },
      {
        "name": "The castle feast",
        "price": "££",
        "what": "Dinner with jesters and knights in Knight's Village",
        "score": 8.3,
        "from": "Sam",
        "match": 75,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Lord Leycester Hospital",
        "what": "A wonky medieval building in Warwick town with a lovely walled garden.",
        "from": "Sam",
        "gem": true
      },
      {
        "tag": "Show",
        "name": "The trebuchet",
        "what": "Watch one of the world's biggest siege machines fire across the river.",
        "from": "Sam",
        "gem": false
      },
      {
        "tag": "Show",
        "name": "Birds of prey show",
        "what": "Eagles and vultures swoop low over the crowd.",
        "from": "Sam",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "1,000 years of castle",
        "what": "William the Conqueror built the first castle here in 1068.",
        "from": "Sam"
      }
    ],
    "tips": [
      {
        "tip": "Book castle tickets online in advance. It's cheaper.",
        "from": "Sam"
      },
      {
        "tip": "Arrive for the first shows, then explore the towers when it's quieter.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "york": {
    "kicker": "City · One night",
    "scoreNote": "From 8 friends and people with your taste.",
    "bestTime": "December for the Christmas market, or spring",
    "staysFrom": "from £170 a night",
    "goodFor": [
      "Couples",
      "Friends"
    ],
    "temps": [
      7,
      8,
      11,
      14,
      17,
      20,
      22,
      22,
      19,
      15,
      10,
      8
    ],
    "bestMonths": [
      4,
      5,
      8
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      2,
      1,
      1,
      2
    ],
    "said": [
      {
        "who": "Tom",
        "month": "Dec 2025",
        "quote": "So much history in such a small place.",
        "score": 8.9,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "The Grays Court",
        "type": "Hotel",
        "match": 92,
        "featured": true,
        "sub": "from £220 a night · Right by the Minster, with a private garden on the city walls.",
        "because": "Because you loved breakfast in the garden at Es Molí",
        "score": null,
        "photo": null
      },
      {
        "name": "The Grand, York",
        "type": "Hotel",
        "match": 88,
        "featured": false,
        "sub": "from £230 a night · Tom stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      },
      {
        "name": "Middlethorpe Hall",
        "type": "Hotel",
        "match": 85,
        "featured": false,
        "sub": "from £230 a night · Mum stayed",
        "because": null,
        "score": 8.9,
        "photo": null
      },
      {
        "name": "No.1 York",
        "type": "Hotel",
        "match": 77,
        "featured": false,
        "sub": "from £170 a night · Sam stayed",
        "because": null,
        "score": 8.5,
        "photo": "bath-1"
      }
    ],
    "eats": [
      {
        "name": "Brew & Brownie",
        "price": "£",
        "what": "Brownies and coffee",
        "score": 8.7,
        "from": "Sophie",
        "match": 84,
        "photo": null
      },
      {
        "name": "Bettys",
        "price": "££",
        "what": "Afternoon tea and a Fat Rascal scone",
        "score": 8.6,
        "from": "Tom",
        "match": 83,
        "photo": null
      },
      {
        "name": "The Star Inn the City",
        "price": "££",
        "what": "Lunch by the river",
        "score": 8.5,
        "from": "Mum",
        "match": 78,
        "photo": "food-table"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Minster tower climb",
        "what": "275 steps up the central tower for a view over the rooftops.",
        "from": "Tom",
        "gem": true
      },
      {
        "tag": "History",
        "name": "York Minster",
        "what": "One of Europe's great Gothic cathedrals.",
        "from": "Tom",
        "gem": false
      },
      {
        "tag": "Walk",
        "name": "The city walls",
        "what": "Almost two miles of medieval walls you can walk along for free.",
        "from": "Tom",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "February",
        "name": "Jorvik Viking Festival",
        "what": "Viking battles, markets and parades celebrating the city's Norse past.",
        "from": "Sam"
      }
    ],
    "tips": [
      {
        "tip": "The queue for Bettys is shortest first thing in the morning.",
        "from": "Tom"
      },
      {
        "tip": "Walk the city walls at the start of the day, before the crowds.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "zanzibar": {
    "kicker": "Island · Beach",
    "scoreNote": "From 4 friends and people with your taste.",
    "bestTime": "June to October, or January and February",
    "staysFrom": "from £180 a night",
    "goodFor": [
      "Couples",
      "Friends"
    ],
    "temps": [
      32,
      32,
      32,
      30,
      29,
      28,
      28,
      28,
      29,
      30,
      31,
      32
    ],
    "bestMonths": [
      0,
      1,
      5,
      6,
      7,
      8,
      9
    ],
    "crowds": [
      2,
      3,
      2,
      1,
      1,
      2,
      3,
      3,
      3,
      2,
      1,
      3
    ],
    "said": [
      {
        "who": "Jonah",
        "month": "Aug 2025",
        "quote": "Stone Town at dusk, then a week on the beach. Perfect mix.",
        "score": 8.9,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Matemwe Lodge",
        "type": "Hotel",
        "match": 92,
        "featured": true,
        "sub": "from £400 a night · Thatched bungalows on a cliff over the reef.",
        "because": "Because you gave Riad Zitoun a 9.1",
        "score": null,
        "photo": null
      },
      {
        "name": "Zuri Zanzibar",
        "type": "Hotel",
        "match": 91,
        "featured": false,
        "sub": "from £450 a night · Jonah stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      },
      {
        "name": "Kholle House",
        "type": "B&B",
        "match": 87,
        "featured": false,
        "sub": "from £180 a night · Sam stayed",
        "because": null,
        "score": 8.6,
        "photo": null
      },
      {
        "name": "Emerson Spice",
        "type": "B&B",
        "match": 86,
        "featured": false,
        "sub": "from £180 a night · Priya stayed",
        "because": null,
        "score": 8.8,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Emerson Spice Rooftop",
        "price": "££",
        "what": "Swahili dinner at sunset",
        "score": 9.0,
        "from": "Sophie",
        "match": 85,
        "photo": "food-wine"
      },
      {
        "name": "Lukmaan",
        "price": "£",
        "what": "Biryani and chapati",
        "score": 8.7,
        "from": "Sam",
        "match": 85,
        "photo": "food-table"
      },
      {
        "name": "The Rock",
        "price": "££",
        "what": "Lobster in a restaurant on a rock in the sea",
        "score": 8.8,
        "from": "Jonah",
        "match": 83,
        "photo": null
      },
      {
        "name": "Forodhani Gardens",
        "price": "£",
        "what": "Zanzibar pizza at the night market",
        "score": 8.5,
        "from": "Priya",
        "match": 80,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Mnemba snorkel",
        "what": "Turtles and dolphins off the northeast tip. Go early.",
        "from": "Jonah",
        "gem": true
      },
      {
        "tag": "Food",
        "name": "Spice farm tour",
        "what": "Taste cloves, nutmeg and vanilla straight from the plant.",
        "from": "Jonah",
        "gem": false
      },
      {
        "tag": "Boat",
        "name": "Nakupenda sandbank",
        "what": "A strip of sand in the middle of the sea, with lunch grilled on the beach.",
        "from": "Jonah",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "February",
        "name": "Sauti za Busara",
        "what": "East Africa's biggest music festival, in Stone Town's old fort.",
        "from": "Jonah"
      },
      {
        "tag": "History",
        "when": null,
        "name": "Freddie Mercury's home town",
        "what": "He was born in Stone Town. There's a little museum in his old house.",
        "from": "Priya"
      }
    ],
    "tips": [
      {
        "tip": "Spend 2 nights in Stone Town, then head to the north coast where the tide doesn't go far out.",
        "from": "Jonah"
      },
      {
        "tip": "Book The Rock for high tide, so you arrive by boat.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "zermatt": {
    "kicker": "Ski · Mountains",
    "scoreNote": "From 3 friends and people with your taste.",
    "bestTime": "January to March",
    "staysFrom": "from £450 a night",
    "goodFor": [
      "Couples",
      "Friends"
    ],
    "temps": [
      -1,
      1,
      4,
      8,
      13,
      17,
      20,
      19,
      15,
      10,
      4,
      0
    ],
    "bestMonths": [
      0,
      1,
      2
    ],
    "crowds": [
      3,
      3,
      3,
      2,
      1,
      2,
      2,
      2,
      1,
      1,
      1,
      3
    ],
    "said": [
      {
        "who": "Jonah",
        "month": "Feb 2026",
        "quote": "Pricey, but the best skiing and food I've had.",
        "score": 9.1,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "The Omnia",
        "type": "Hotel",
        "match": 90,
        "featured": true,
        "sub": "from £650 a night · A calm hideaway on the rock above town.",
        "because": "Because you gave Riad Zitoun a 9.1",
        "score": null,
        "photo": null
      },
      {
        "name": "Chalet Matterhorn View",
        "type": "Airbnb",
        "match": 89,
        "featured": false,
        "sub": "from £450 a night · Jonah stayed",
        "because": null,
        "score": 9.2,
        "photo": null
      },
      {
        "name": "Cervo Mountain Resort",
        "type": "Hotel",
        "match": 85,
        "featured": false,
        "sub": "from £540 a night · Tom stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Chez Vrony",
        "price": "£££",
        "what": "Rösti on the terrace, mid-mountain",
        "score": 9.3,
        "from": "Jonah",
        "match": 91,
        "photo": null
      },
      {
        "name": "Findlerhof",
        "price": "££",
        "what": "Rösti with Matterhorn views",
        "score": 9.0,
        "from": "Sophie",
        "match": 88,
        "photo": "food-table"
      },
      {
        "name": "Café du Pont",
        "price": "££",
        "what": "Fondue in the old town",
        "score": 8.5,
        "from": "Sam",
        "match": 85,
        "photo": "food-wine"
      }
    ],
    "dos": [
      {
        "tag": "Hidden gem",
        "name": "Findeln hamlet",
        "what": "Tiny old wooden huts and restaurants on the piste, with the best view of the Matterhorn.",
        "from": "Jonah",
        "gem": true
      },
      {
        "tag": "Ski",
        "name": "Ski to Italy",
        "what": "Cross the border at the top and ski down to Cervinia for lunch. Take your passport.",
        "from": "Jonah",
        "gem": false
      },
      {
        "tag": "Views",
        "name": "Gornergrat railway",
        "what": "The mountain train up for the best Matterhorn view. Go at sunrise.",
        "from": "Jonah",
        "gem": false
      }
    ],
    "culture": [
      {
        "tag": "Custom",
        "when": null,
        "name": "A car-free village",
        "what": "Leave the car in Täsch and take the shuttle train in. Electric taxis do the rest.",
        "from": "Jonah"
      },
      {
        "tag": "History",
        "when": null,
        "name": "Matterhorn Museum",
        "what": "An underground museum about the first climb of the Matterhorn in 1865 and the village before skiing.",
        "from": "Jonah"
      }
    ],
    "tips": [
      {
        "tip": "Fly to Geneva or Zurich and take the train. It's car-free, so don't bother hiring one.",
        "from": "Jonah"
      }
    ],
    "credits": null
  },
  "southafrica": {
    "kicker": "City · Safari · Food",
    "scoreNote": "From 3 friends and people with your taste.",
    "bestTime": "October to April for Cape Town; May to September for safari",
    "staysFrom": "from £90 a night",
    "goodFor": [
      "Couples",
      "Friends",
      "Families"
    ],
    "temps": [
      27,
      27,
      26,
      24,
      21,
      19,
      18,
      19,
      20,
      22,
      24,
      26
    ],
    "bestMonths": [
      0,
      1,
      2,
      3,
      9,
      10,
      11
    ],
    "crowds": [
      3,
      2,
      2,
      2,
      1,
      1,
      1,
      1,
      2,
      2,
      2,
      3
    ],
    "said": [
      {
        "who": "Sophie",
        "month": "Mar 2026",
        "quote": "Table Mountain in the morning, a wine farm for lunch, penguins by teatime.",
        "score": 9.3,
        "face": null
      },
      {
        "who": "Sam",
        "month": "Sep 2025",
        "quote": "Three days in Kruger and we saw the big five. Unreal.",
        "score": 9.2,
        "face": null
      },
      {
        "who": "Priya",
        "month": "Jan 2026",
        "quote": "Cape Town has everything: beaches, mountains and brilliant food.",
        "score": 8.9,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "The Silo Hotel",
        "type": "Hotel",
        "match": 92,
        "featured": true,
        "sub": "from £800 a night · An old grain silo on the waterfront with huge glass windows.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Babylonstoren",
        "type": "Hotel",
        "match": 90,
        "featured": false,
        "sub": "from £450 a night · Sophie stayed",
        "because": null,
        "score": 9.4,
        "photo": null
      },
      {
        "name": "Sabi Sabi Bush Lodge",
        "type": "Hotel",
        "match": 89,
        "featured": false,
        "sub": "from £700 a night · Sam stayed",
        "because": null,
        "score": 9.2,
        "photo": "own-safari-cheetahs"
      },
      {
        "name": "A flat in Bo-Kaap",
        "type": "Airbnb",
        "match": 84,
        "featured": false,
        "sub": "from £90 a night · Priya stayed",
        "because": null,
        "score": 8.6,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "La Colombe",
        "price": "£££",
        "what": "Tasting menu in the Constantia vineyards",
        "score": 9.4,
        "from": "Sophie",
        "match": 88,
        "photo": null
      },
      {
        "name": "Babel at Babylonstoren",
        "price": "££",
        "what": "Lunch picked from the farm's garden",
        "score": 9.1,
        "from": "Sophie",
        "match": 86,
        "photo": null
      },
      {
        "name": "Kloof Street House",
        "price": "££",
        "what": "Dinner in an old Victorian house",
        "score": 8.8,
        "from": "Priya",
        "match": 83,
        "photo": null
      },
      {
        "name": "Mzoli's",
        "price": "£",
        "what": "A proper braai (barbecue) in Gugulethu",
        "score": 8.9,
        "from": "Sam",
        "match": 82,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Views",
        "name": "Table Mountain",
        "what": "Take the cable car up first thing, before the cloud rolls in.",
        "from": "Sophie",
        "gem": false
      },
      {
        "tag": "Animals",
        "name": "Boulders Beach penguins",
        "what": "Swim in a sheltered cove with hundreds of African penguins.",
        "from": "Priya",
        "gem": false
      },
      {
        "tag": "Animals",
        "name": "Game drives in Kruger",
        "what": "Dawn and dusk drives are best for lions and leopards.",
        "from": "Sam",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Kalk Bay harbour",
        "what": "Fish and chips on the harbour wall, with seals waiting for scraps.",
        "from": "Priya",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "Robben Island",
        "what": "Ferry out to where Nelson Mandela was held, with tours led by former prisoners.",
        "from": "Sophie"
      },
      {
        "tag": "Music",
        "when": "March",
        "name": "Cape Town Jazz Festival",
        "what": "Two nights of jazz and African music in the city centre.",
        "from": "Priya"
      }
    ],
    "tips": [
      {
        "tip": "Hire a car. The drive to Cape Point and the winelands is half the fun.",
        "from": "Priya"
      },
      {
        "tip": "Fly to Kruger rather than drive, and give it at least three nights.",
        "from": "Sam"
      },
      {
        "tip": "Book Table Mountain tickets online and check the wind first; the cable car shuts when it's gusty.",
        "from": "Sophie"
      }
    ],
    "credits": null
  },
  "corfu": {
    "kicker": "Island · Beach",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "May, June or September",
    "staysFrom": "from \u00a3320 a night",
    "goodFor": [
      "Couples",
      "Families"
    ],
    "temps": [
      14,
      15,
      17,
      20,
      24,
      29,
      32,
      32,
      28,
      23,
      19,
      15
    ],
    "bestMonths": [
      4,
      5,
      8
    ],
    "crowds": [
      1,
      1,
      1,
      1,
      2,
      3,
      3,
      3,
      2,
      1,
      1,
      1
    ],
    "said": [
      {
        "who": "Sophie",
        "month": "Jun 2025",
        "quote": "Olive groves down to the sea, and swimming before breakfast.",
        "score": 8.9,
        "face": null
      },
      {
        "who": "Jonah",
        "month": "Sep 2024",
        "quote": "Paleokastritsa's coves by boat were the highlight.",
        "score": 8.6,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Domes Miramare",
        "type": "Hotel",
        "match": 93,
        "featured": true,
        "sub": "from £350 a night · A 1960s seaside estate, adults only.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Ikos Dassia",
        "type": "Hotel",
        "match": 88,
        "featured": false,
        "sub": "from £380 a night · Sophie stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      },
      {
        "name": "Grecotel Corfu Imperial",
        "type": "Hotel",
        "match": 84,
        "featured": false,
        "sub": "from £320 a night · Jonah stayed",
        "because": null,
        "score": 8.7,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "The Venetian Well",
        "price": "££",
        "what": "Modern Greek in a hidden square",
        "score": 9.1,
        "from": "Sophie",
        "match": 90,
        "photo": null
      },
      {
        "name": "Taverna Agni",
        "price": "££",
        "what": "Grilled fish on a tiny bay",
        "score": 9.0,
        "from": "Jonah",
        "match": 88,
        "photo": null
      },
      {
        "name": "Rex",
        "price": "££",
        "what": "Old Town classics since 1932",
        "score": 8.5,
        "from": null,
        "match": 82,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Walk",
        "name": "Corfu Old Town",
        "what": "Venetian lanes, the Liston arcades and the old fortress.",
        "from": "Sophie",
        "gem": false
      },
      {
        "tag": "Boat",
        "name": "Boat to the Paleokastritsa caves",
        "what": "Little boats leave the beach for the sea caves all morning.",
        "from": "Jonah",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Kalami Bay",
        "what": "The Durrells' White House sits on this quiet bay. Swim, then lunch on the water.",
        "from": "Jonah",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "Achilleion Palace",
        "what": "Empress Sisi's summer palace, with gardens over the sea.",
        "from": null
      },
      {
        "tag": "Custom",
        "when": "Easter Saturday",
        "name": "Easter pot throwing",
        "what": "At 11am people throw clay pots from Old Town balconies to welcome spring.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Hire a small car: the north-east coast roads are narrow and the best coves are down steep lanes.",
        "from": "Sophie"
      }
    ],
    "credits": null
  },
  "cyprus": {
    "kicker": "Island · Beach",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "May, June or October",
    "staysFrom": "from \u00a3170 a night",
    "goodFor": [
      "Families",
      "Friends"
    ],
    "temps": [
      17,
      17,
      19,
      23,
      27,
      31,
      34,
      34,
      31,
      28,
      23,
      19
    ],
    "bestMonths": [
      4,
      5,
      9
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      3,
      3,
      3,
      3,
      2,
      1,
      1
    ],
    "said": [
      {
        "who": "Sam",
        "month": "Aug 2025",
        "quote": "Nissi Beach is as clear as the Maldives, honestly.",
        "score": 8.4,
        "face": null
      },
      {
        "who": "Harriet",
        "month": "Oct 2024",
        "quote": "Paphos harbour at sunset and halloumi with everything.",
        "score": 8.7,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Anassa",
        "type": "Hotel",
        "match": 92,
        "featured": true,
        "sub": "from £450 a night · A whitewashed village above a quiet beach.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Nissi Beach Resort",
        "type": "Hotel",
        "match": 83,
        "featured": false,
        "sub": "from £170 a night · Sam stayed",
        "because": null,
        "score": 8.3,
        "photo": null
      },
      {
        "name": "Almyra",
        "type": "Hotel",
        "match": 86,
        "featured": false,
        "sub": "from £230 a night · Harriet stayed",
        "because": null,
        "score": 8.8,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Seven St Georges Tavern",
        "price": "££",
        "what": "Meze from the family garden",
        "score": 9.2,
        "from": "Harriet",
        "match": 90,
        "photo": null
      },
      {
        "name": "Militzis",
        "price": "££",
        "what": "Kleftiko from clay ovens",
        "score": 8.6,
        "from": "Sam",
        "match": 84,
        "photo": null
      },
      {
        "name": "Bunch of Grapes",
        "price": "££",
        "what": "An old village inn with a courtyard",
        "score": 8.7,
        "from": null,
        "match": 85,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Beach",
        "name": "Nissi Beach",
        "what": "Shallow, clear water that stays knee-deep a long way out.",
        "from": "Sam",
        "gem": false
      },
      {
        "tag": "Boat",
        "name": "Cape Greco sea caves",
        "what": "Swim and jump off the rocks round the sea caves and the Love Bridge.",
        "from": "Sam",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Avakas Gorge",
        "what": "A cool, narrow gorge walk near Paphos. Go early.",
        "from": "Harriet",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "Tombs of the Kings",
        "what": "Rock-cut tombs by the sea in Paphos, over 2,000 years old.",
        "from": "Harriet"
      },
      {
        "tag": "Food",
        "when": null,
        "name": "Halloumi and commandaria",
        "what": "Grilled halloumi everywhere, and commandaria, the island's sweet dessert wine.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Distances are bigger than they look: Ayia Napa to Paphos is two hours, so pick one end.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "mallorca": {
    "kicker": "Island · Beach",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "May, June or September",
    "staysFrom": "from \u00a3280 a night",
    "goodFor": [
      "Couples",
      "Families"
    ],
    "temps": [
      15,
      15,
      18,
      20,
      24,
      28,
      31,
      31,
      28,
      24,
      19,
      16
    ],
    "bestMonths": [
      4,
      5,
      8
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      3,
      3,
      3,
      2,
      2,
      1,
      1
    ],
    "said": [
      {
        "who": "Priya",
        "month": "Sep 2025",
        "quote": "Palma for the old town, Deià for the views, Caló des Moro for a swim.",
        "score": 8.9,
        "face": null
      },
      {
        "who": "Tom",
        "month": "Jun 2024",
        "quote": "Cycled the Tramuntana. Brutal and brilliant.",
        "score": 8.6,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Cap Rocat",
        "type": "Hotel",
        "match": 92,
        "featured": true,
        "sub": "from £500 a night · A sea fort turned hotel near Palma.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Can Ferrereta",
        "type": "Hotel",
        "match": 89,
        "featured": false,
        "sub": "from £320 a night · Priya stayed",
        "because": null,
        "score": 9.1,
        "photo": null
      },
      {
        "name": "Son Brull",
        "type": "Hotel",
        "match": 85,
        "featured": false,
        "sub": "from £280 a night · Tom stayed",
        "because": null,
        "score": 8.7,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Ca'n Joan de s'Aigo",
        "price": "£",
        "what": "Ensaïmadas and hot chocolate since 1700",
        "score": 8.9,
        "from": "Priya",
        "match": 88,
        "photo": null
      },
      {
        "name": "Marc Fosh",
        "price": "£££",
        "what": "Michelin-starred tasting menu in Palma",
        "score": 9.2,
        "from": "Tom",
        "match": 87,
        "photo": null
      },
      {
        "name": "Sa Foradada",
        "price": "££",
        "what": "Paella cooked over wood, reached on foot",
        "score": 9.0,
        "from": "Priya",
        "match": 89,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Beach",
        "name": "Caló des Moro",
        "what": "A tiny turquoise cove. Get there by 9am.",
        "from": "Priya",
        "gem": false
      },
      {
        "tag": "Outdoors",
        "name": "Cycle the Tramuntana",
        "what": "Sa Calobra's hairpins are the famous climb.",
        "from": "Tom",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Vintage train to Sóller",
        "what": "A wooden train from Palma through the mountains, then the old tram to the sea.",
        "from": "Priya",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "Palma Cathedral",
        "what": "The Gothic cathedral on the seafront, with a ceiling by Gaudí.",
        "from": null
      },
      {
        "tag": "Custom",
        "when": null,
        "name": "Village markets",
        "what": "Every town has a weekly market; Sineu's on Wednesday is the oldest.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Rent a car, but park outside Palma's old town and walk in.",
        "from": "Priya"
      }
    ],
    "credits": null
  },
  "tenerife": {
    "kicker": "Island · Beach",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "All year (warmest May to October)",
    "staysFrom": "from \u00a3180 a night",
    "goodFor": [
      "Families",
      "Couples"
    ],
    "temps": [
      21,
      21,
      22,
      23,
      24,
      26,
      28,
      29,
      28,
      26,
      24,
      22
    ],
    "bestMonths": [
      0,
      1,
      2,
      10,
      11
    ],
    "crowds": [
      3,
      3,
      2,
      2,
      1,
      2,
      3,
      3,
      2,
      2,
      2,
      3
    ],
    "said": [
      {
        "who": "Jonah",
        "month": "Feb 2025",
        "quote": "Winter sun four hours from home, and Teide above the clouds.",
        "score": 8.5,
        "face": null
      },
      {
        "who": "Maya",
        "month": "Nov 2024",
        "quote": "The Masca walk, then fish in Los Gigantes.",
        "score": 8.3,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "The Ritz-Carlton, Abama",
        "type": "Hotel",
        "match": 91,
        "featured": true,
        "sub": "from £350 a night · On the cliffs, with its own lift down to the beach.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Bahía del Duque",
        "type": "Hotel",
        "match": 87,
        "featured": false,
        "sub": "from £300 a night · Jonah stayed",
        "because": null,
        "score": 8.8,
        "photo": null
      },
      {
        "name": "Hotel Botánico",
        "type": "Hotel",
        "match": 82,
        "featured": false,
        "sub": "from £180 a night · Maya stayed",
        "because": null,
        "score": 8.4,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "El Rincón de Juan Carlos",
        "price": "£££",
        "what": "Tasting menu in Los Gigantes",
        "score": 9.1,
        "from": "Maya",
        "match": 88,
        "photo": null
      },
      {
        "name": "A guachinche",
        "price": "£",
        "what": "Family wine-cellar kitchens up in the hills. Cash only",
        "score": 8.8,
        "from": "Jonah",
        "match": 87,
        "photo": null
      },
      {
        "name": "San Sebastián 57",
        "price": "££",
        "what": "Creative Canarian in Puerto de la Cruz",
        "score": 8.6,
        "from": null,
        "match": 83,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Outdoors",
        "name": "Teide by cable car",
        "what": "Go up for sunset, or get a permit to reach the very top.",
        "from": "Jonah",
        "gem": false
      },
      {
        "tag": "Hike",
        "name": "Masca gorge",
        "what": "A steep walk down to the sea. Check it is open first.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Stargazing on Teide",
        "what": "One of the best night skies in Europe. Take a coat.",
        "from": "Jonah",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "February",
        "name": "Carnival of Santa Cruz",
        "what": "One of the biggest carnivals in the world: two weeks of parades.",
        "from": null
      },
      {
        "tag": "Food",
        "when": null,
        "name": "Papas arrugadas",
        "what": "Wrinkly salted potatoes with red and green mojo come with almost everything.",
        "from": "Maya"
      }
    ],
    "tips": [
      {
        "tip": "The south is sunnier, the north greener. Stay south, explore north.",
        "from": "Jonah"
      }
    ],
    "credits": null
  },
  "costabrava": {
    "kicker": "Coast · Food",
    "scoreNote": "From 1 friend and people with your taste.",
    "bestTime": "June or September",
    "staysFrom": "from £170 a night",
    "goodFor": [
      "Couples",
      "Friends"
    ],
    "temps": [
      13,
      14,
      16,
      18,
      22,
      26,
      29,
      29,
      26,
      22,
      17,
      14
    ],
    "bestMonths": [
      5,
      8
    ],
    "crowds": [
      1,
      1,
      1,
      1,
      2,
      3,
      3,
      3,
      2,
      1,
      1,
      1
    ],
    "said": [
      {
        "who": "Tom",
        "month": "Sep 2025",
        "quote": "Coves you can only reach on foot, and the best seafood rice.",
        "score": 8.7,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Mas de Torrent",
        "type": "Hotel",
        "match": 90,
        "featured": true,
        "sub": "from £350 a night · A farmhouse hotel among the fields near Pals.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Hotel Aigua Blava",
        "type": "Hotel",
        "match": 86,
        "featured": false,
        "sub": "from £200 a night · Tom stayed",
        "because": null,
        "score": 8.6,
        "photo": null
      },
      {
        "name": "Hotel Llevant",
        "type": "Hotel",
        "match": 83,
        "featured": false,
        "sub": "from £170 a night · On the beach in Llafranc.",
        "because": null,
        "score": null,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "El Celler de Can Roca",
        "price": "£££",
        "what": "Book months ahead for one of the best in the world",
        "score": 9.6,
        "from": null,
        "match": 90,
        "photo": null
      },
      {
        "name": "Toc al Mar",
        "price": "££",
        "what": "Grilled fish on the beach at Aiguablava",
        "score": 9.0,
        "from": "Tom",
        "match": 88,
        "photo": null
      },
      {
        "name": "Compartir",
        "price": "££",
        "what": "Sharing plates in Cadaqués",
        "score": 8.9,
        "from": null,
        "match": 86,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Walk",
        "name": "Camí de Ronda",
        "what": "The old coastal path between coves. Llafranc to Tamariu is lovely.",
        "from": "Tom",
        "gem": false
      },
      {
        "tag": "Art",
        "name": "Dalí's house, Portlligat",
        "what": "Small groups only, so book ahead.",
        "from": null,
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Sa Tuna",
        "what": "A tiny fishing cove near Begur with one bar.",
        "from": "Tom",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Art",
        "when": null,
        "name": "Dalí Theatre-Museum, Figueres",
        "what": "Dalí's own museum, as strange as you'd hope.",
        "from": null
      },
      {
        "tag": "History",
        "when": null,
        "name": "Pals",
        "what": "A medieval village of stone lanes and a tower above the rice fields.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "In August, park early: the coves fill up by 11.",
        "from": "Tom"
      }
    ],
    "credits": null
  },
  "algarve": {
    "kicker": "Beach · Coast",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "May, June or September",
    "staysFrom": "from \u00a3250 a night",
    "goodFor": [
      "Families",
      "Couples"
    ],
    "temps": [
      16,
      17,
      19,
      21,
      24,
      27,
      29,
      29,
      27,
      24,
      19,
      17
    ],
    "bestMonths": [
      4,
      5,
      8,
      9
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      3,
      3,
      3,
      2,
      1,
      1,
      1
    ],
    "said": [
      {
        "who": "Sophie",
        "month": "Jun 2025",
        "quote": "Golden cliffs, kayaking into Benagil, sardines every night.",
        "score": 8.8,
        "face": null
      },
      {
        "who": "Sam",
        "month": "Aug 2024",
        "quote": "Perfect for a big family group in a villa.",
        "score": 8.5,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Vila Vita Parc",
        "type": "Hotel",
        "match": 91,
        "featured": true,
        "sub": "from £400 a night · Clifftop gardens and a private beach.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Pine Cliffs",
        "type": "Hotel",
        "match": 88,
        "featured": false,
        "sub": "from £250 a night · Sophie stayed",
        "because": null,
        "score": 8.9,
        "photo": null
      },
      {
        "name": "A villa in Quinta do Lago",
        "type": "Villa",
        "match": 85,
        "featured": false,
        "sub": "from £350 a night · Sam stayed",
        "because": null,
        "score": 8.6,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Vila Joya",
        "price": "£££",
        "what": "Two-star cooking on the cliffs",
        "score": 9.4,
        "from": null,
        "match": 88,
        "photo": null
      },
      {
        "name": "O Leão de Porches",
        "price": "££",
        "what": "An old farmhouse kitchen",
        "score": 8.8,
        "from": "Sophie",
        "match": 86,
        "photo": null
      },
      {
        "name": "Vai e Volta",
        "price": "£",
        "what": "All-you-can-eat grilled fish. Cash only",
        "score": 8.7,
        "from": "Sam",
        "match": 85,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Boat",
        "name": "Kayak to Benagil cave",
        "what": "Go early, by kayak, not on the big boats.",
        "from": "Sophie",
        "gem": false
      },
      {
        "tag": "Walk",
        "name": "Seven Hanging Valleys trail",
        "what": "A clifftop path from Marinha beach.",
        "from": "Sophie",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "The Ria Formosa islands",
        "what": "Ferry from Olhão to Culatra for empty sand.",
        "from": "Sam",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "Lagos old town",
        "what": "Old walls, tiled churches and a fort over the harbour.",
        "from": null
      },
      {
        "tag": "Food",
        "when": null,
        "name": "Cataplana",
        "what": "Seafood stew cooked in a copper clam-shaped pan. Order it for two.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "West of Lagos is wilder; east of Faro has the calm, warm lagoon water.",
        "from": "Sophie"
      }
    ],
    "credits": null
  },
  "venice": {
    "kicker": "City · Culture",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "April, May or October",
    "staysFrom": "from \u00a3300 a night",
    "goodFor": [
      "Couples"
    ],
    "temps": [
      7,
      9,
      13,
      17,
      22,
      26,
      28,
      28,
      24,
      18,
      12,
      8
    ],
    "bestMonths": [
      3,
      4,
      9
    ],
    "crowds": [
      1,
      2,
      2,
      3,
      3,
      3,
      3,
      3,
      3,
      2,
      1,
      2
    ],
    "said": [
      {
        "who": "Maya",
        "month": "Oct 2025",
        "quote": "Get lost after 6pm, when the day-trippers have gone.",
        "score": 9.2,
        "face": null
      },
      {
        "who": "Harriet",
        "month": "Apr 2024",
        "quote": "A cicchetti crawl, then a Bellini at Harry's.",
        "score": 8.7,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Aman Venice",
        "type": "Hotel",
        "match": 90,
        "featured": true,
        "sub": "from £1200 a night · A palazzo on the Grand Canal.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Ca' Maria Adele",
        "type": "Hotel",
        "match": 89,
        "featured": false,
        "sub": "from £300 a night · Maya stayed",
        "because": null,
        "score": 9.1,
        "photo": null
      },
      {
        "name": "Hotel Danieli",
        "type": "Hotel",
        "match": 85,
        "featured": false,
        "sub": "from £500 a night · Harriet stayed",
        "because": null,
        "score": 8.8,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Cantina Do Spade",
        "price": "££",
        "what": "Cicchetti and spritz since 1475",
        "score": 8.9,
        "from": "Maya",
        "match": 88,
        "photo": null
      },
      {
        "name": "Harry's Bar",
        "price": "£££",
        "what": "Where the Bellini began",
        "score": 8.2,
        "from": "Harriet",
        "match": 80,
        "photo": null
      },
      {
        "name": "Trattoria Al Gatto Nero",
        "price": "££",
        "what": "Risotto on Burano",
        "score": 9.1,
        "from": null,
        "match": 87,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Boat",
        "name": "Vaporetto line 1 at dusk",
        "what": "The slow boat down the Grand Canal is the cheapest tour there is.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Art",
        "name": "Peggy Guggenheim Collection",
        "what": "Modern art in a palazzo, with a garden.",
        "from": "Harriet",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Torcello",
        "what": "The quiet island where Venice began.",
        "from": "Maya",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "St Mark's Basilica",
        "what": "Book a timed slot to skip the queue, and go up to see the horses.",
        "from": null
      },
      {
        "tag": "Festival",
        "when": "Third weekend in July",
        "name": "Festa del Redentore",
        "what": "Fireworks over the lagoon, watched from boats.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Get the 72-hour vaporetto pass; it pays for itself in two days.",
        "from": "Maya"
      }
    ],
    "credits": null
  },
  "tuscany": {
    "kicker": "Countryside · Food",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "May, June or September",
    "staysFrom": "from \u00a3350 a night",
    "goodFor": [
      "Couples",
      "Friends"
    ],
    "temps": [
      11,
      13,
      16,
      19,
      24,
      28,
      32,
      32,
      27,
      21,
      15,
      11
    ],
    "bestMonths": [
      4,
      5,
      8,
      9
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      3,
      3,
      3,
      3,
      2,
      1,
      1
    ],
    "said": [
      {
        "who": "Harriet",
        "month": "Sep 2025",
        "quote": "Cypress roads, Brunello and long lunches.",
        "score": 9.3,
        "face": null
      },
      {
        "who": "Sophie",
        "month": "May 2024",
        "quote": "A farmhouse with friends near Montalcino.",
        "score": 8.9,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Castello di Casole",
        "type": "Hotel",
        "match": 92,
        "featured": true,
        "sub": "from £600 a night · A castle estate between Siena and Volterra.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Borgo Pignano",
        "type": "Hotel",
        "match": 90,
        "featured": false,
        "sub": "from £350 a night · Harriet stayed",
        "because": null,
        "score": 9.2,
        "photo": null
      },
      {
        "name": "Castiglion del Bosco",
        "type": "Hotel",
        "match": 86,
        "featured": false,
        "sub": "from £700 a night · Sophie stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Osteria Le Logge",
        "price": "££",
        "what": "Pici and Tuscan classics in Siena",
        "score": 8.9,
        "from": "Harriet",
        "match": 87,
        "photo": null
      },
      {
        "name": "Antica Macelleria Cecchini",
        "price": "££",
        "what": "A famous butcher's table in Panzano",
        "score": 9.1,
        "from": "Sophie",
        "match": 88,
        "photo": null
      },
      {
        "name": "Trattoria Sostanza",
        "price": "££",
        "what": "Florentine classics since 1869",
        "score": 8.8,
        "from": null,
        "match": 85,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Food",
        "name": "Brunello tasting in Montalcino",
        "what": "Book a small family winery rather than the big names.",
        "from": "Harriet",
        "gem": false
      },
      {
        "tag": "Views",
        "name": "Drive the Val d’Orcia",
        "what": "Pienza, Montepulciano and the cypress bend near San Quirico.",
        "from": "Sophie",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Bagni San Filippo",
        "what": "Free hot springs in the woods.",
        "from": "Sophie",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "Piazza del Campo, Siena",
        "what": "The shell-shaped square, best with a coffee in the morning.",
        "from": null
      },
      {
        "tag": "Festival",
        "when": "2 July and 16 August",
        "name": "Palio di Siena",
        "what": "A bareback horse race round the square.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Base yourself in one village and do day trips; the roads are slow and winding.",
        "from": "Harriet"
      }
    ],
    "credits": null
  },
  "capri": {
    "kicker": "Island · Coast",
    "scoreNote": "From 1 friend and people with your taste.",
    "bestTime": "May, June or September",
    "staysFrom": "from £350 a night",
    "goodFor": [
      "Couples"
    ],
    "temps": [
      14,
      14,
      16,
      19,
      23,
      27,
      30,
      30,
      27,
      23,
      18,
      15
    ],
    "bestMonths": [
      4,
      5,
      8
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      3,
      3,
      3,
      3,
      3,
      2,
      1,
      1
    ],
    "said": [
      {
        "who": "Priya",
        "month": "Jun 2025",
        "quote": "Stay the night: once the ferries leave, it's magic.",
        "score": 9.1,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "J.K. Place Capri",
        "type": "Hotel",
        "match": 90,
        "featured": true,
        "sub": "from £900 a night · A white villa above Marina Grande.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Hotel Caesar Augustus",
        "type": "Hotel",
        "match": 91,
        "featured": false,
        "sub": "from £600 a night · Priya stayed",
        "because": null,
        "score": 9.3,
        "photo": null
      },
      {
        "name": "Hotel La Minerva",
        "type": "Hotel",
        "match": 85,
        "featured": false,
        "sub": "from £350 a night · Terraces of bougainvillea near the Piazzetta.",
        "because": null,
        "score": null,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Da Paolino",
        "price": "£££",
        "what": "Dinner under the lemon trees",
        "score": 9.0,
        "from": "Priya",
        "match": 88,
        "photo": null
      },
      {
        "name": "La Fontelina",
        "price": "£££",
        "what": "Beach club lunch by the Faraglioni",
        "score": 8.9,
        "from": null,
        "match": 85,
        "photo": null
      },
      {
        "name": "Pulalli",
        "price": "££",
        "what": "A wine bar on the clock tower terrace",
        "score": 8.7,
        "from": "Priya",
        "match": 84,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Boat",
        "name": "Boat round the island",
        "what": "Two hours, sea caves and a swim at the Faraglioni.",
        "from": "Priya",
        "gem": false
      },
      {
        "tag": "Walk",
        "name": "Via Krupp",
        "what": "The hairpin path down to Marina Piccola (check it is open).",
        "from": null,
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Villa Lysis",
        "what": "A quiet villa with sea views, far from the crowds.",
        "from": "Priya",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "Villa Jovis",
        "what": "Emperor Tiberius' palace ruins at the top of the island.",
        "from": null
      },
      {
        "tag": "Food",
        "when": null,
        "name": "Caprese and torta caprese",
        "what": "Both were born here: tomato and mozzarella, and a flourless chocolate almond cake.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Take the first ferry and do the Blue Grotto early, before the queues.",
        "from": "Priya"
      }
    ],
    "credits": null
  },
  "milan": {
    "kicker": "City · Food",
    "scoreNote": "From 1 friend and people with your taste.",
    "bestTime": "April, May, September or October",
    "staysFrom": "from £220 a night",
    "goodFor": [
      "Solo",
      "Friends"
    ],
    "temps": [
      7,
      10,
      15,
      18,
      23,
      27,
      30,
      29,
      25,
      18,
      12,
      7
    ],
    "bestMonths": [
      3,
      4,
      8,
      9
    ],
    "crowds": [
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      3,
      2,
      2,
      2
    ],
    "said": [
      {
        "who": "Tom",
        "month": "Mar 2025",
        "quote": "The best aperitivo in Italy, and the Duomo roof.",
        "score": 8.4,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Portrait Milano",
        "type": "Hotel",
        "match": 88,
        "featured": true,
        "sub": "from £700 a night · An old seminary turned hotel off Corso Venezia.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Room Mate Giulia",
        "type": "Hotel",
        "match": 84,
        "featured": false,
        "sub": "from £220 a night · Tom stayed",
        "because": null,
        "score": 8.3,
        "photo": null
      },
      {
        "name": "Palazzo Parigi",
        "type": "Hotel",
        "match": 82,
        "featured": false,
        "sub": "from £600 a night · Grand and calm, near the shops.",
        "because": null,
        "score": null,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Trattoria Milanese",
        "price": "££",
        "what": "Saffron risotto and cotoletta",
        "score": 8.8,
        "from": "Tom",
        "match": 87,
        "photo": null
      },
      {
        "name": "Pasticceria Marchesi",
        "price": "£",
        "what": "Pastries in an 1824 café",
        "score": 8.9,
        "from": null,
        "match": 86,
        "photo": null
      },
      {
        "name": "Ratanà",
        "price": "££",
        "what": "Modern Milanese in an old railway house",
        "score": 8.7,
        "from": null,
        "match": 84,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Views",
        "name": "The Duomo roof",
        "what": "Walk among the spires; go late afternoon.",
        "from": "Tom",
        "gem": false
      },
      {
        "tag": "Art",
        "name": "The Last Supper",
        "what": "Book weeks ahead: 15-minute slots.",
        "from": null,
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Villa Necchi Campiglio",
        "what": "A 1930s villa and garden, just as it was.",
        "from": "Tom",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Evening",
        "when": null,
        "name": "Aperitivo in the Navigli",
        "what": "Drinks along the canals come with snacks from 6pm.",
        "from": null
      },
      {
        "tag": "Theatre",
        "when": null,
        "name": "La Scala",
        "what": "Cheap standing tickets go on sale on the day.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Lake Como is an hour by train, so add a day trip.",
        "from": "Tom"
      }
    ],
    "credits": null
  },
  "zurich": {
    "kicker": "City · Lakes",
    "scoreNote": "From 1 friend and people with your taste.",
    "bestTime": "June to September, or December for the markets",
    "staysFrom": "from \u00a3180 a night",
    "goodFor": [
      "Solo",
      "Couples"
    ],
    "temps": [
      3,
      5,
      10,
      14,
      19,
      22,
      24,
      24,
      19,
      14,
      8,
      4
    ],
    "bestMonths": [
      5,
      6,
      7,
      8,
      11
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      2,
      2,
      1,
      2
    ],
    "said": [
      {
        "who": "Harriet",
        "month": "Jul 2025",
        "quote": "Swimming in the river in the middle of the city.",
        "score": 8.3,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Baur au Lac",
        "type": "Hotel",
        "match": 87,
        "featured": true,
        "sub": "from £800 a night · Gardens on the lake at the end of Bahnhofstrasse.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Widder Hotel",
        "type": "Hotel",
        "match": 86,
        "featured": false,
        "sub": "from £450 a night · Harriet stayed",
        "because": null,
        "score": 8.7,
        "photo": null
      },
      {
        "name": "25hours Hotel Langstrasse",
        "type": "Hotel",
        "match": 82,
        "featured": false,
        "sub": "from £180 a night · Playful and central.",
        "because": null,
        "score": null,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Kronenhalle",
        "price": "£££",
        "what": "Swiss classics among Picassos and Chagalls",
        "score": 9.0,
        "from": "Harriet",
        "match": 87,
        "photo": null
      },
      {
        "name": "Zeughauskeller",
        "price": "££",
        "what": "Sausages and rösti in an old armoury",
        "score": 8.4,
        "from": null,
        "match": 82,
        "photo": null
      },
      {
        "name": "Sprüngli",
        "price": "£",
        "what": "Luxemburgerli and hot chocolate",
        "score": 8.8,
        "from": "Harriet",
        "match": 85,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Outdoors",
        "name": "River swim at Oberer Letten",
        "what": "Float down the Limmat in summer, like the locals.",
        "from": "Harriet",
        "gem": false
      },
      {
        "tag": "Views",
        "name": "Uetliberg",
        "what": "Take the train up the city's own mountain for lake and Alps views.",
        "from": null,
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Lindenhof",
        "what": "A quiet tree-lined square above the old town.",
        "from": null,
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Art",
        "when": null,
        "name": "Kunsthaus Zürich",
        "what": "Switzerland's big art museum, from Monet to Giacometti.",
        "from": null
      },
      {
        "tag": "History",
        "when": null,
        "name": "Grossmünster",
        "what": "Climb one of the twin towers for the view.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Get a ZürichCard: trams, boats and the Uetliberg train are included.",
        "from": "Harriet"
      }
    ],
    "credits": null
  },
  "valdisere": {
    "kicker": "Ski · Mountains · Après",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "January to March",
    "staysFrom": "from \u00a3250 a night",
    "goodFor": [
      "Friends",
      "Couples"
    ],
    "temps": [
      -2,
      -1,
      3,
      7,
      12,
      16,
      19,
      19,
      15,
      10,
      4,
      -1
    ],
    "bestMonths": [
      0,
      1,
      2
    ],
    "crowds": [
      3,
      3,
      3,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      1,
      3
    ],
    "said": [
      {
        "who": "Jonah",
        "month": "Feb 2025",
        "quote": "A huge ski area with Tignes, and La Folie Douce at 3pm.",
        "score": 9.0,
        "face": null
      },
      {
        "who": "Tom",
        "month": "Jan 2024",
        "quote": "The Face de Bellevarde is properly steep.",
        "score": 8.8,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Le Blizzard",
        "type": "Hotel",
        "match": 89,
        "featured": true,
        "sub": "from £400 a night · Central, with an outdoor pool.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Hotel Avancher",
        "type": "Hotel",
        "match": 86,
        "featured": false,
        "sub": "from £250 a night · Jonah stayed",
        "because": null,
        "score": 8.7,
        "photo": null
      },
      {
        "name": "Le Yule",
        "type": "Hotel",
        "match": 85,
        "featured": false,
        "sub": "from £600 a night · Tom stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "La Folie Douce",
        "price": "££",
        "what": "Dancing on the tables in ski boots",
        "score": 8.9,
        "from": "Jonah",
        "match": 87,
        "photo": null
      },
      {
        "name": "L'Edelweiss",
        "price": "££",
        "what": "Mountain lunch on the slopes. Book ahead",
        "score": 9.0,
        "from": "Tom",
        "match": 88,
        "photo": null
      },
      {
        "name": "La Fruitière",
        "price": "££",
        "what": "Dairy-themed lunches up the mountain",
        "score": 8.8,
        "from": null,
        "match": 85,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Ski",
        "name": "Face de Bellevarde",
        "what": "The 1992 Olympic downhill. Black, long, unforgiving.",
        "from": "Tom",
        "gem": false
      },
      {
        "tag": "Ski",
        "name": "Ski across to Tignes",
        "what": "The lifts link the two resorts; a pass covers both.",
        "from": "Jonah",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Le Fornet",
        "what": "The quiet end of the valley, with the best snow on busy days.",
        "from": "Jonah",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Custom",
        "when": null,
        "name": "Après-ski",
        "what": "Drinks and music on the mountain from 3pm, then dinner in the village.",
        "from": null
      },
      {
        "tag": "History",
        "when": null,
        "name": "The old village church",
        "what": "A 17th-century church at the heart of the old village.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Buy the full Tignes–Val d’Isère pass, not the local one.",
        "from": "Jonah"
      }
    ],
    "credits": null
  },
  "avoriaz": {
    "kicker": "Ski · Family",
    "scoreNote": "From 1 friend and people with your taste.",
    "bestTime": "January to March",
    "staysFrom": "from £180 a night",
    "goodFor": [
      "Families",
      "Friends"
    ],
    "temps": [
      -2,
      -1,
      3,
      7,
      12,
      16,
      19,
      19,
      15,
      10,
      4,
      -1
    ],
    "bestMonths": [
      0,
      1,
      2
    ],
    "crowds": [
      3,
      3,
      3,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      1,
      3
    ],
    "said": [
      {
        "who": "Sam",
        "month": "Feb 2025",
        "quote": "Car-free, ski to the door, and the kids loved the snow park.",
        "score": 8.5,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Hôtel des Dromonts",
        "type": "Hotel",
        "match": 87,
        "featured": true,
        "sub": "from £350 a night · The 1960s icon of the resort.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Amara",
        "type": "Apartment",
        "match": 84,
        "featured": false,
        "sub": "from £180 a night · Sam stayed",
        "because": null,
        "score": 8.2,
        "photo": null
      },
      {
        "name": "MiL8",
        "type": "Apartment",
        "match": 82,
        "featured": false,
        "sub": "from £500 a night · Ski-in apartments with a spa.",
        "because": null,
        "score": null,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Les Lindarets",
        "price": "££",
        "what": "A hamlet of mountain restaurants (and goats) for lunch",
        "score": 8.6,
        "from": "Sam",
        "match": 85,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Ski",
        "name": "The Portes du Soleil",
        "what": "Ski over to Switzerland and back in a day.",
        "from": "Sam",
        "gem": false
      },
      {
        "tag": "Family",
        "name": "Aquariaz",
        "what": "A tropical indoor water park for tired legs.",
        "from": "Sam",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Sleigh rides",
        "what": "The village is car-free: horse-drawn sleighs are the taxis.",
        "from": null,
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Custom",
        "when": null,
        "name": "The wooden towers",
        "what": "The whole resort was built in the 1960s to look like the cliffs it sits on.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Book ski school by December for February half-term.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "kitzbuhel": {
    "kicker": "Ski · Old town · Après",
    "scoreNote": "From 1 friend and people with your taste.",
    "bestTime": "January to March, or July for walking",
    "staysFrom": "from £250 a night",
    "goodFor": [
      "Couples",
      "Friends"
    ],
    "temps": [
      1,
      3,
      7,
      12,
      17,
      20,
      22,
      22,
      18,
      13,
      6,
      2
    ],
    "bestMonths": [
      0,
      1,
      2,
      6
    ],
    "crowds": [
      3,
      3,
      2,
      1,
      1,
      2,
      2,
      2,
      1,
      1,
      1,
      3
    ],
    "said": [
      {
        "who": "Sophie",
        "month": "Jan 2025",
        "quote": "A proper medieval town, not just a resort. And the Streif!",
        "score": 8.7,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Schloss Lebenberg",
        "type": "Hotel",
        "match": 87,
        "featured": true,
        "sub": "from £250 a night · A castle hotel above the town.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "A-ROSA Kitzbühel",
        "type": "Hotel",
        "match": 85,
        "featured": false,
        "sub": "from £300 a night · Sophie stayed",
        "because": null,
        "score": 8.6,
        "photo": null
      },
      {
        "name": "Hotel Tennerhof",
        "type": "Hotel",
        "match": 84,
        "featured": false,
        "sub": "from £350 a night · A gourmet chalet hotel.",
        "because": null,
        "score": null,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Rosi's Sonnbergstuben",
        "price": "££",
        "what": "Schnitzel and singing",
        "score": 8.6,
        "from": "Sophie",
        "match": 85,
        "photo": null
      },
      {
        "name": "Café Praxmair",
        "price": "£",
        "what": "Florentines and coffee in the old town",
        "score": 8.7,
        "from": null,
        "match": 84,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Ski",
        "name": "Ski the Streif",
        "what": "The world's scariest downhill, open to the public (most of it).",
        "from": "Sophie",
        "gem": false
      },
      {
        "tag": "Outdoors",
        "name": "Schwarzsee",
        "what": "A warm lake for summer swims and winter walks.",
        "from": null,
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Bichlalm",
        "what": "Quiet slopes and huts on the edge of the area.",
        "from": null,
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Festival",
        "when": "Late January",
        "name": "Hahnenkamm race weekend",
        "what": "The famous downhill race; the town parties for days.",
        "from": null
      },
      {
        "tag": "History",
        "when": null,
        "name": "The medieval old town",
        "what": "Painted houses along the Vorderstadt.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Avoid race weekend unless you want the party: prices triple.",
        "from": "Sophie"
      }
    ],
    "credits": null
  },
  "dubai": {
    "kicker": "City · Beach",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "November to March",
    "staysFrom": "from \u00a3120 a night",
    "goodFor": [
      "Families",
      "Couples"
    ],
    "temps": [
      24,
      25,
      28,
      33,
      38,
      40,
      41,
      41,
      39,
      35,
      30,
      26
    ],
    "bestMonths": [
      0,
      1,
      2,
      10,
      11
    ],
    "crowds": [
      3,
      3,
      3,
      2,
      1,
      1,
      1,
      1,
      1,
      2,
      3,
      3
    ],
    "said": [
      {
        "who": "Maya",
        "month": "Dec 2024",
        "quote": "The desert at sunrise, then brunch, then the beach.",
        "score": 8.3,
        "face": null
      },
      {
        "who": "Jonah",
        "month": "Feb 2025",
        "quote": "The view from the top of the Burj is unreal.",
        "score": 8.1,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "One&Only The Palm",
        "type": "Hotel",
        "match": 88,
        "featured": true,
        "sub": "from £800 a night · Calm and green on the Palm.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Jumeirah Al Qasr",
        "type": "Hotel",
        "match": 86,
        "featured": false,
        "sub": "from £450 a night · Maya stayed",
        "because": null,
        "score": 8.7,
        "photo": null
      },
      {
        "name": "Rove Downtown",
        "type": "Hotel",
        "match": 80,
        "featured": false,
        "sub": "from £120 a night · Jonah stayed",
        "because": null,
        "score": 8.0,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Al Ustad Special Kebab",
        "price": "£",
        "what": "Old-school kebabs since 1978",
        "score": 8.8,
        "from": "Jonah",
        "match": 86,
        "photo": null
      },
      {
        "name": "Pierchic",
        "price": "£££",
        "what": "Seafood at the end of a pier",
        "score": 8.7,
        "from": "Maya",
        "match": 85,
        "photo": null
      },
      {
        "name": "Arabian Tea House",
        "price": "£",
        "what": "Breakfast in a courtyard in Al Fahidi",
        "score": 8.5,
        "from": null,
        "match": 83,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Views",
        "name": "At the Top, Burj Khalifa",
        "what": "Book a sunset slot.",
        "from": "Jonah",
        "gem": false
      },
      {
        "tag": "Outdoors",
        "name": "The desert at sunrise",
        "what": "Dunes, camels and quiet before the heat.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "An abra across the Creek",
        "what": "Old wooden boats to the gold and spice souks, for pennies.",
        "from": "Maya",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "Al Fahidi",
        "what": "Wind towers and lanes from old Dubai.",
        "from": null
      },
      {
        "tag": "Custom",
        "when": null,
        "name": "Friday brunch",
        "what": "A Dubai ritual: long, lavish and loud.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Go between November and March; the summer heat is too much for most.",
        "from": "Maya"
      }
    ],
    "credits": null
  },
  "victoriafalls": {
    "kicker": "Safari · Hiking",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "April to July for the falls; August to November for safari",
    "staysFrom": "from \u00a3350 a night",
    "goodFor": [
      "Couples",
      "Families"
    ],
    "temps": [
      29,
      29,
      29,
      28,
      26,
      23,
      24,
      27,
      31,
      33,
      32,
      30
    ],
    "bestMonths": [
      3,
      4,
      5,
      6
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      3,
      2,
      1,
      1
    ],
    "said": [
      {
        "who": "Sophie",
        "month": "Jun 2025",
        "quote": "You hear it before you see it. Get soaked and love it.",
        "score": 9.4,
        "face": null
      },
      {
        "who": "Harriet",
        "month": "Sep 2024",
        "quote": "A sunset cruise on the Zambezi, with hippos.",
        "score": 9.0,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "The Victoria Falls Hotel",
        "type": "Hotel",
        "match": 90,
        "featured": true,
        "sub": "from £350 a night · Edwardian grandeur facing the gorge.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Matetsi Victoria Falls",
        "type": "Lodge",
        "match": 89,
        "featured": false,
        "sub": "from £700 a night · Sophie stayed",
        "because": null,
        "score": 9.3,
        "photo": null
      },
      {
        "name": "Tongabezi",
        "type": "Lodge",
        "match": 87,
        "featured": false,
        "sub": "from £450 a night · Harriet stayed",
        "because": null,
        "score": 9.1,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "The Lookout Café",
        "price": "££",
        "what": "Lunch over the gorge, with zip-liners passing",
        "score": 8.6,
        "from": "Harriet",
        "match": 85,
        "photo": null
      },
      {
        "name": "Stanley's Terrace",
        "price": "££",
        "what": "High tea at the Victoria Falls Hotel",
        "score": 8.9,
        "from": "Sophie",
        "match": 87,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Walk",
        "name": "The rainforest walk",
        "what": "Every viewpoint along the falls. Take a raincoat.",
        "from": "Sophie",
        "gem": false
      },
      {
        "tag": "Boat",
        "name": "Zambezi sunset cruise",
        "what": "Hippos, elephants and a gin and tonic.",
        "from": "Harriet",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Devil's Pool",
        "what": "Swim at the very edge, from the Zambian side, August to January only.",
        "from": "Sophie",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Custom",
        "when": null,
        "name": "Mosi-oa-Tunya",
        "what": "'The smoke that thunders': the falls' local name.",
        "from": null
      },
      {
        "tag": "History",
        "when": null,
        "name": "Victoria Falls Bridge",
        "what": "A 1905 bridge between two countries; walk out to the middle.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Get the KAZA visa to cross between Zimbabwe and Zambia as often as you like.",
        "from": "Sophie"
      }
    ],
    "credits": null
  },
  "tanzania": {
    "kicker": "Safari",
    "scoreNote": "From 1 friend and people with your taste.",
    "bestTime": "June to October (calving in February)",
    "staysFrom": "from \u00a3350 a night",
    "goodFor": [
      "Couples",
      "Families"
    ],
    "temps": [
      27,
      28,
      28,
      26,
      26,
      26,
      26,
      27,
      28,
      29,
      28,
      27
    ],
    "bestMonths": [
      0,
      1,
      5,
      6,
      7,
      8,
      9
    ],
    "crowds": [
      2,
      2,
      1,
      1,
      1,
      2,
      3,
      3,
      3,
      2,
      1,
      2
    ],
    "said": [
      {
        "who": "Jonah",
        "month": "Aug 2025",
        "quote": "Saw a river crossing. I didn't speak for an hour.",
        "score": 9.6,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Four Seasons Safari Lodge",
        "type": "Lodge",
        "match": 90,
        "featured": true,
        "sub": "from £1200 a night · A waterhole in front of the pool.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Sayari Camp",
        "type": "Camp",
        "match": 91,
        "featured": false,
        "sub": "from £900 a night · Jonah stayed",
        "because": null,
        "score": 9.5,
        "photo": null
      },
      {
        "name": "Serengeti Serena Safari Lodge",
        "type": "Lodge",
        "match": 84,
        "featured": false,
        "sub": "from £350 a night · Views over the plains.",
        "because": null,
        "score": null,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "A bush breakfast",
        "price": null,
        "what": "Breakfast laid out under an acacia on a game drive",
        "score": 9.2,
        "from": "Jonah",
        "match": 88,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Animals",
        "name": "The Great Migration",
        "what": "River crossings on the Mara River, July to September. Patience pays.",
        "from": "Jonah",
        "gem": false
      },
      {
        "tag": "Outdoors",
        "name": "Hot-air balloon safari",
        "what": "A sunrise flight, then breakfast in the bush.",
        "from": null,
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Ngorongoro Crater",
        "what": "A day in a giant crater full of animals, on the way in or out.",
        "from": null,
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Culture",
        "when": null,
        "name": "Maasai villages",
        "what": "Visit with a guide who knows the community.",
        "from": null
      },
      {
        "tag": "Custom",
        "when": null,
        "name": "Sundowners",
        "what": "Drinks at sunset to end every game drive.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Fly between camps in light aircraft; the roads take all day. Kilimanjaro is best seen from Arusha or Amboseli at dawn.",
        "from": "Jonah"
      }
    ],
    "credits": null
  },
  "singapore": {
    "kicker": "City · Food",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "February to April",
    "staysFrom": "from \u00a3250 a night",
    "goodFor": [
      "Families",
      "Solo"
    ],
    "temps": [
      30,
      31,
      32,
      32,
      32,
      31,
      31,
      31,
      31,
      31,
      31,
      30
    ],
    "bestMonths": [
      1,
      2,
      3
    ],
    "crowds": [
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      3
    ],
    "said": [
      {
        "who": "Priya",
        "month": "Mar 2025",
        "quote": "Hawker centres for every meal, Gardens by the Bay at night.",
        "score": 8.9,
        "face": null
      },
      {
        "who": "Sam",
        "month": "Dec 2024",
        "quote": "The perfect stopover with kids. So clean and easy.",
        "score": 8.4,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Raffles Hotel",
        "type": "Hotel",
        "match": 88,
        "featured": true,
        "sub": "from £700 a night · The colonial original, with the Long Bar.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "The Warehouse Hotel",
        "type": "Hotel",
        "match": 89,
        "featured": false,
        "sub": "from £250 a night · Priya stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      },
      {
        "name": "Marina Bay Sands",
        "type": "Hotel",
        "match": 83,
        "featured": false,
        "sub": "from £450 a night · Sam stayed",
        "because": null,
        "score": 8.4,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Maxwell Food Centre",
        "price": "£",
        "what": "Tian Tian chicken rice",
        "score": 9.0,
        "from": "Priya",
        "match": 89,
        "photo": null
      },
      {
        "name": "Lau Pa Sat",
        "price": "£",
        "what": "Satay Street at night",
        "score": 8.6,
        "from": "Sam",
        "match": 85,
        "photo": null
      },
      {
        "name": "Burnt Ends",
        "price": "£££",
        "what": "Wood-fired cooking. Hard to book",
        "score": 9.2,
        "from": null,
        "match": 87,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Outdoors",
        "name": "Gardens by the Bay",
        "what": "The Supertree light show at 7.45pm and 8.45pm.",
        "from": "Sam",
        "gem": false
      },
      {
        "tag": "Outdoors",
        "name": "Jewel Changi",
        "what": "The indoor waterfall at the airport. Go before your flight.",
        "from": null,
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Pulau Ubin",
        "what": "A bumboat to an old-style island of bikes and mangroves.",
        "from": "Priya",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Culture",
        "when": null,
        "name": "Chinatown and Little India",
        "what": "Temples, spice shops and hawker stalls side by side.",
        "from": null
      },
      {
        "tag": "Food",
        "when": null,
        "name": "Kaya toast breakfast",
        "what": "Coconut jam toast, soft eggs and kopi.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "The MRT goes everywhere and is air-conditioned. Contactless cards work.",
        "from": "Priya"
      }
    ],
    "credits": null
  },
  "srilanka": {
    "kicker": "Beach · Culture",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "December to April (south and west coast)",
    "staysFrom": "from \u00a3150 a night",
    "goodFor": [
      "Couples",
      "Friends"
    ],
    "temps": [
      30,
      31,
      31,
      31,
      30,
      29,
      29,
      29,
      29,
      29,
      29,
      29
    ],
    "bestMonths": [
      0,
      1,
      2,
      3,
      11
    ],
    "crowds": [
      3,
      3,
      2,
      2,
      1,
      1,
      2,
      2,
      1,
      1,
      1,
      3
    ],
    "said": [
      {
        "who": "Maya",
        "month": "Feb 2025",
        "quote": "Sigiriya at dawn, tea country by train, then the south coast.",
        "score": 9.2,
        "face": null
      },
      {
        "who": "Sophie",
        "month": "Jan 2024",
        "quote": "Watched turtles feeding at Hiriketiya.",
        "score": 8.9,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Cape Weligama",
        "type": "Hotel",
        "match": 91,
        "featured": true,
        "sub": "from £450 a night · Clifftop villas over the bay.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Amangalla",
        "type": "Hotel",
        "match": 89,
        "featured": false,
        "sub": "from £600 a night · Maya stayed",
        "because": null,
        "score": 9.3,
        "photo": null
      },
      {
        "name": "98 Acres Resort",
        "type": "Hotel",
        "match": 86,
        "featured": false,
        "sub": "from £150 a night · Sophie stayed",
        "because": null,
        "score": 8.8,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Ministry of Crab",
        "price": "£££",
        "what": "Giant lagoon crabs in Colombo",
        "score": 9.0,
        "from": "Maya",
        "match": 87,
        "photo": null
      },
      {
        "name": "Rice and curry",
        "price": "£",
        "what": "Lunch in any local café: a dozen little curries",
        "score": 8.9,
        "from": "Sophie",
        "match": 88,
        "photo": null
      },
      {
        "name": "Pedlar's Inn Café",
        "price": "£",
        "what": "Coffee and snacks inside Galle Fort",
        "score": 8.5,
        "from": null,
        "match": 83,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Hike",
        "name": "Sigiriya Lion Rock",
        "what": "Climb at 7am, before the heat.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Outdoors",
        "name": "The Kandy to Ella train",
        "what": "Tea plantations all the way. Book an observation seat.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Turtle spotting at Hiriketiya",
        "what": "Green turtles feed on the rocks at high tide. Watch, never touch.",
        "from": "Sophie",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "Temple of the Tooth, Kandy",
        "what": "Go for the evening ceremony with drums.",
        "from": null
      },
      {
        "tag": "History",
        "when": null,
        "name": "Galle Fort",
        "what": "Walk the ramparts at sunset.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Hire a driver for the inland part; it is affordable and the roads are slow.",
        "from": "Maya"
      }
    ],
    "credits": null
  },
  "newyork": {
    "kicker": "City · Culture",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "May, September or December",
    "staysFrom": "from \u00a3250 a night",
    "goodFor": [
      "Friends",
      "Couples"
    ],
    "temps": [
      4,
      6,
      10,
      17,
      22,
      27,
      29,
      29,
      25,
      19,
      12,
      7
    ],
    "bestMonths": [
      4,
      5,
      8,
      9,
      11
    ],
    "crowds": [
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      3,
      2,
      2,
      3,
      3
    ],
    "said": [
      {
        "who": "Tom",
        "month": "Dec 2024",
        "quote": "Skating in Central Park, the tree, a slice at 2am.",
        "score": 8.9,
        "face": null
      },
      {
        "who": "Harriet",
        "month": "May 2025",
        "quote": "Walk the High Line and eat your way round the West Village.",
        "score": 8.6,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "The Greenwich Hotel",
        "type": "Hotel",
        "match": 88,
        "featured": true,
        "sub": "from £800 a night · Tribeca calm, with a candlelit pool.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "The Whitby",
        "type": "Hotel",
        "match": 87,
        "featured": false,
        "sub": "from £600 a night · Harriet stayed",
        "because": null,
        "score": 9.0,
        "photo": null
      },
      {
        "name": "Ace Hotel Brooklyn",
        "type": "Hotel",
        "match": 84,
        "featured": false,
        "sub": "from £250 a night · Tom stayed",
        "because": null,
        "score": 8.4,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Katz's Delicatessen",
        "price": "££",
        "what": "Pastrami on rye, as in the films",
        "score": 8.8,
        "from": "Tom",
        "match": 86,
        "photo": null
      },
      {
        "name": "Via Carota",
        "price": "££",
        "what": "West Village Italian. Walk in early",
        "score": 9.1,
        "from": "Harriet",
        "match": 89,
        "photo": null
      },
      {
        "name": "Joe's Pizza",
        "price": "£",
        "what": "The classic folded slice",
        "score": 8.6,
        "from": null,
        "match": 84,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Walk",
        "name": "The High Line",
        "what": "An old railway turned into a garden walk.",
        "from": "Harriet",
        "gem": false
      },
      {
        "tag": "Views",
        "name": "Top of the Rock",
        "what": "Better than the Empire State, because you can see the Empire State.",
        "from": "Tom",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "The Staten Island Ferry",
        "what": "Free, with the Statue of Liberty on the way.",
        "from": "Tom",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Art",
        "when": null,
        "name": "The Met",
        "what": "Pick two or three rooms; you could spend a week.",
        "from": null
      },
      {
        "tag": "Theatre",
        "when": null,
        "name": "A Broadway show",
        "what": "The TKTS booth in Times Square has same-day deals.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Walk everywhere you can and use the subway for the rest; taxis crawl in traffic.",
        "from": "Tom"
      }
    ],
    "credits": null
  },
  "lasvegas": {
    "kicker": "City · Weekend",
    "scoreNote": "From 1 friend and people with your taste.",
    "bestTime": "March to May, or October and November",
    "staysFrom": "from \u00a3180 a night",
    "goodFor": [
      "Friends"
    ],
    "temps": [
      14,
      17,
      21,
      26,
      32,
      38,
      41,
      40,
      35,
      27,
      19,
      14
    ],
    "bestMonths": [
      2,
      3,
      4,
      9,
      10
    ],
    "crowds": [
      2,
      2,
      3,
      3,
      3,
      2,
      2,
      2,
      2,
      3,
      2,
      2
    ],
    "said": [
      {
        "who": "Sam",
        "month": "Oct 2024",
        "quote": "A show every night and a helicopter to the Grand Canyon.",
        "score": 8.0,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Bellagio",
        "type": "Hotel",
        "match": 85,
        "featured": true,
        "sub": "from £180 a night · The fountains outside your window.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "The Cosmopolitan",
        "type": "Hotel",
        "match": 84,
        "featured": false,
        "sub": "from £200 a night · Sam stayed",
        "because": null,
        "score": 8.3,
        "photo": null
      },
      {
        "name": "Wynn Las Vegas",
        "type": "Hotel",
        "match": 83,
        "featured": false,
        "sub": "from £250 a night · Calm, green and grown-up.",
        "because": null,
        "score": null,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Bacchanal Buffet",
        "price": "££",
        "what": "The famous Caesars buffet",
        "score": 8.2,
        "from": "Sam",
        "match": 82,
        "photo": null
      },
      {
        "name": "Lotus of Siam",
        "price": "££",
        "what": "Northern Thai, a local favourite",
        "score": 8.9,
        "from": null,
        "match": 86,
        "photo": null
      },
      {
        "name": "Hash House A Go Go",
        "price": "£",
        "what": "Giant brunch plates",
        "score": 8.0,
        "from": "Sam",
        "match": 80,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Show",
        "name": "A Cirque du Soleil show",
        "what": "\"O\" at the Bellagio is the one in water.",
        "from": "Sam",
        "gem": false
      },
      {
        "tag": "Outdoors",
        "name": "Grand Canyon by helicopter",
        "what": "Expensive and unforgettable.",
        "from": "Sam",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Red Rock Canyon",
        "what": "Red cliffs and walks 30 minutes from the Strip.",
        "from": null,
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Evening",
        "when": null,
        "name": "Fremont Street",
        "what": "Old Vegas downtown, under a giant light canopy.",
        "from": null
      },
      {
        "tag": "Art",
        "when": null,
        "name": "The Neon Museum",
        "what": "A yard of old casino signs. Go at night.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Walking the Strip takes far longer than it looks: it's four miles.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "sanfrancisco": {
    "kicker": "City · Food",
    "scoreNote": "From 1 friend and people with your taste.",
    "bestTime": "September or October",
    "staysFrom": "from \u00a3250 a night",
    "goodFor": [
      "Couples",
      "Solo"
    ],
    "temps": [
      14,
      16,
      17,
      18,
      19,
      21,
      21,
      22,
      23,
      22,
      18,
      14
    ],
    "bestMonths": [
      8,
      9
    ],
    "crowds": [
      1,
      1,
      2,
      2,
      2,
      3,
      3,
      3,
      2,
      2,
      1,
      1
    ],
    "said": [
      {
        "who": "Harriet",
        "month": "Sep 2025",
        "quote": "Cycled the Golden Gate to Sausalito and took the ferry back.",
        "score": 8.6,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Fairmont San Francisco",
        "type": "Hotel",
        "match": 86,
        "featured": true,
        "sub": "from £300 a night · Nob Hill grandeur, cable cars outside.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Hotel Vitale",
        "type": "Hotel",
        "match": 85,
        "featured": false,
        "sub": "from £250 a night · Harriet stayed",
        "because": null,
        "score": 8.5,
        "photo": null
      },
      {
        "name": "The Ritz-Carlton, San Francisco",
        "type": "Hotel",
        "match": 83,
        "featured": false,
        "sub": "from £400 a night · Calm, on Nob Hill.",
        "because": null,
        "score": null,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Tartine Bakery",
        "price": "£",
        "what": "Morning buns and country loaves",
        "score": 8.9,
        "from": "Harriet",
        "match": 87,
        "photo": null
      },
      {
        "name": "Zuni Café",
        "price": "££",
        "what": "Roast chicken for two",
        "score": 8.8,
        "from": null,
        "match": 85,
        "photo": null
      },
      {
        "name": "Swan Oyster Depot",
        "price": "££",
        "what": "Oysters at a marble counter",
        "score": 8.9,
        "from": "Harriet",
        "match": 86,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Outdoors",
        "name": "Cycle the Golden Gate Bridge",
        "what": "On to Sausalito, then the ferry back.",
        "from": "Harriet",
        "gem": false
      },
      {
        "tag": "History",
        "name": "Alcatraz",
        "what": "Book weeks ahead. The night tour is best.",
        "from": null,
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Lands End trail",
        "what": "A coastal path with bridge views and old baths.",
        "from": null,
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Food",
        "when": null,
        "name": "Ferry Building Marketplace",
        "what": "Saturday's farmers' market is the one to see.",
        "from": null
      },
      {
        "tag": "Art",
        "when": null,
        "name": "Mission murals",
        "what": "The painted walls of Balmy Alley.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Bring layers: the summer fog makes it cold even in July.",
        "from": "Harriet"
      }
    ],
    "credits": null
  },
  "lakelouise": {
    "kicker": "Lakes · Mountains · Hiking",
    "scoreNote": "From 1 friend and people with your taste.",
    "bestTime": "July to September, or January for skiing",
    "staysFrom": "from \u00a3350 a night",
    "goodFor": [
      "Couples",
      "Families"
    ],
    "temps": [
      -6,
      -3,
      1,
      7,
      12,
      16,
      20,
      19,
      14,
      7,
      -2,
      -6
    ],
    "bestMonths": [
      6,
      7,
      8
    ],
    "crowds": [
      2,
      2,
      1,
      1,
      2,
      3,
      3,
      3,
      2,
      1,
      1,
      2
    ],
    "said": [
      {
        "who": "Priya",
        "month": "Aug 2024",
        "quote": "The colour of the water doesn't look real. Canoe at 7am.",
        "score": 9.3,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Fairmont Chateau Lake Louise",
        "type": "Hotel",
        "match": 89,
        "featured": true,
        "sub": "from £500 a night · Right on the lake shore.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Moraine Lake Lodge",
        "type": "Lodge",
        "match": 90,
        "featured": false,
        "sub": "from £600 a night · Priya stayed",
        "because": null,
        "score": 9.2,
        "photo": null
      },
      {
        "name": "Post Hotel",
        "type": "Hotel",
        "match": 85,
        "featured": false,
        "sub": "from £350 a night · A riverside lodge with a famous wine cellar.",
        "because": null,
        "score": null,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Lake Agnes Tea House",
        "price": "£",
        "what": "Tea at the end of a lake walk",
        "score": 9.0,
        "from": "Priya",
        "match": 88,
        "photo": null
      },
      {
        "name": "Fairview",
        "price": "£££",
        "what": "Dinner looking at the glacier",
        "score": 8.5,
        "from": null,
        "match": 83,
        "photo": null
      },
      {
        "name": "Laggan's Mountain Bakery",
        "price": "£",
        "what": "Pastries for the trail",
        "score": 8.4,
        "from": "Priya",
        "match": 82,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Boat",
        "name": "Canoe on Lake Louise",
        "what": "Go at opening, before the crowds.",
        "from": "Priya",
        "gem": false
      },
      {
        "tag": "Hike",
        "name": "Plain of Six Glaciers",
        "what": "Walk up to the glacier and another tea house.",
        "from": null,
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Moraine Lake at sunrise",
        "what": "Shuttle only, so book the first one.",
        "from": "Priya",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Custom",
        "when": null,
        "name": "Bears",
        "what": "Carry bear spray on trails and keep your distance.",
        "from": null
      },
      {
        "tag": "Spa",
        "when": null,
        "name": "Banff Upper Hot Springs",
        "what": "Hot pools with a mountain view, open since the 1880s.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "You can't drive to Moraine Lake: book the Parks Canada shuttle.",
        "from": "Priya"
      }
    ],
    "credits": null
  },
  "whitsundays": {
    "kicker": "Islands · Beach",
    "scoreNote": "From 1 friend and people with your taste.",
    "bestTime": "June to October",
    "staysFrom": "from \u00a3180 a night",
    "goodFor": [
      "Couples",
      "Families"
    ],
    "temps": [
      31,
      31,
      30,
      28,
      26,
      24,
      23,
      24,
      26,
      28,
      30,
      31
    ],
    "bestMonths": [
      5,
      6,
      7,
      8,
      9
    ],
    "crowds": [
      3,
      2,
      2,
      2,
      1,
      2,
      3,
      3,
      2,
      2,
      2,
      3
    ],
    "said": [
      {
        "who": "Sam",
        "month": "Jul 2025",
        "quote": "The sand at Whitehaven squeaks. We sailed for three days.",
        "score": 9.3,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "InterContinental Hayman Island",
        "type": "Hotel",
        "match": 90,
        "featured": true,
        "sub": "from £600 a night · A private island resort on the reef.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Coral Sea Marina Resort",
        "type": "Hotel",
        "match": 84,
        "featured": false,
        "sub": "from £180 a night · Sam stayed",
        "because": null,
        "score": 8.5,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Fish D'vine",
        "price": "££",
        "what": "A fish and rum bar in Airlie Beach",
        "score": 8.4,
        "from": "Sam",
        "match": 83,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Boat",
        "name": "Sail the islands",
        "what": "Two or three nights on a yacht is the way to see them.",
        "from": "Sam",
        "gem": false
      },
      {
        "tag": "Beach",
        "name": "Whitehaven Beach",
        "what": "Seven kilometres of pure white sand.",
        "from": "Sam",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Hill Inlet lookout",
        "what": "Swirling sand and sea from above, best at low tide.",
        "from": null,
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Custom",
        "when": null,
        "name": "Stinger suits",
        "what": "Wear one to swim from November to May: it is jellyfish season.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Fly into Hamilton Island, or Proserpine for Airlie Beach.",
        "from": "Sam"
      }
    ],
    "credits": null
  },
  "hamiltonisland": {
    "kicker": "Island · Beach · Family",
    "scoreNote": "From 1 friend and people with your taste.",
    "bestTime": "June to October",
    "staysFrom": "from £250 a night",
    "goodFor": [
      "Families",
      "Couples"
    ],
    "temps": [
      31,
      31,
      30,
      28,
      26,
      24,
      23,
      24,
      26,
      28,
      30,
      31
    ],
    "bestMonths": [
      5,
      6,
      7,
      8,
      9
    ],
    "crowds": [
      3,
      2,
      2,
      2,
      1,
      2,
      3,
      3,
      2,
      2,
      2,
      3
    ],
    "said": [
      {
        "who": "Harriet",
        "month": "Aug 2025",
        "quote": "Golf buggies, koalas and a day trip to Whitehaven.",
        "score": 8.8,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "qualia",
        "type": "Hotel",
        "match": 89,
        "featured": true,
        "sub": "from £900 a night · Adults-only pavilions on the island's tip.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Beach Club",
        "type": "Hotel",
        "match": 87,
        "featured": false,
        "sub": "from £400 a night · Harriet stayed",
        "because": null,
        "score": 8.9,
        "photo": null
      },
      {
        "name": "Reef View Hotel",
        "type": "Hotel",
        "match": 83,
        "featured": false,
        "sub": "from £250 a night · Big and family-friendly, by the beach.",
        "because": null,
        "score": null,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Bommie",
        "price": "£££",
        "what": "Fine dining over the marina",
        "score": 8.7,
        "from": "Harriet",
        "match": 85,
        "photo": null
      },
      {
        "name": "Romano's",
        "price": "££",
        "what": "Italian over the water",
        "score": 8.4,
        "from": null,
        "match": 82,
        "photo": null
      },
      {
        "name": "Manta Ray Café",
        "price": "£",
        "what": "Wood-fired pizza in the marina",
        "score": 8.3,
        "from": null,
        "match": 81,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Family",
        "name": "Wild Life Hamilton Island",
        "what": "Breakfast with the koalas.",
        "from": "Harriet",
        "gem": false
      },
      {
        "tag": "Beach",
        "name": "Catseye Beach",
        "what": "Calm water, with paddleboards and snorkels to borrow.",
        "from": null,
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Passage Peak",
        "what": "A steep walk to the island's top for sunrise.",
        "from": null,
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Custom",
        "when": null,
        "name": "Golf buggies",
        "what": "There are no cars: everyone gets about by buggy.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Book a Whitehaven day trip from the marina.",
        "from": "Harriet"
      }
    ],
    "credits": null
  },
  "rottnest": {
    "kicker": "Island · Beach",
    "scoreNote": "From 1 friend and people with your taste.",
    "bestTime": "October to April",
    "staysFrom": "from \u00a3180 a night",
    "goodFor": [
      "Families",
      "Friends"
    ],
    "temps": [
      30,
      30,
      28,
      25,
      22,
      19,
      18,
      19,
      20,
      23,
      26,
      28
    ],
    "bestMonths": [
      0,
      1,
      2,
      10,
      11
    ],
    "crowds": [
      3,
      3,
      2,
      2,
      1,
      1,
      1,
      1,
      1,
      2,
      2,
      3
    ],
    "said": [
      {
        "who": "Tom",
        "month": "Jan 2025",
        "quote": "Cycled the whole island and got a quokka selfie.",
        "score": 8.7,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Discovery Rottnest Island",
        "type": "Other",
        "match": 87,
        "featured": true,
        "sub": "from £200 a night · Safari tents behind Pinky Beach.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Hotel Rottnest",
        "type": "Hotel",
        "match": 84,
        "featured": false,
        "sub": "from £180 a night · Tom stayed",
        "because": null,
        "score": 8.4,
        "photo": null
      },
      {
        "name": "Samphire Rottnest",
        "type": "Hotel",
        "match": 83,
        "featured": false,
        "sub": "from £220 a night · Rooms on the beach at Thomson Bay.",
        "because": null,
        "score": null,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Hotel Rottnest",
        "price": "££",
        "what": "Sunset drinks on the lawn",
        "score": 8.5,
        "from": "Tom",
        "match": 84,
        "photo": null
      },
      {
        "name": "Rottnest Bakery",
        "price": "£",
        "what": "Famous for its doughnuts",
        "score": 8.6,
        "from": null,
        "match": 83,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Outdoors",
        "name": "Cycle the island",
        "what": "A 22 km loop with no cars. Hire bikes at the jetty.",
        "from": "Tom",
        "gem": false
      },
      {
        "tag": "Snorkel",
        "name": "The Basin",
        "what": "A shallow reef pool, good for first snorkels.",
        "from": null,
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Little Salmon Bay",
        "what": "A snorkel trail with plaques under the water.",
        "from": null,
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "Animals",
        "when": null,
        "name": "Quokkas",
        "what": "Friendly, but never feed or touch them.",
        "from": "Tom"
      },
      {
        "tag": "History",
        "when": null,
        "name": "Wadjemup Lighthouse",
        "what": "Climb it for views over the whole island.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Book the ferry and bike hire together from Fremantle; it is cheaper.",
        "from": "Tom"
      }
    ],
    "credits": null
  },
  "santorini": {
    "kicker": "Island · Coast",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "May, June, September or October",
    "staysFrom": "from £350 a night",
    "goodFor": [
      "Couples"
    ],
    "temps": [
      14,
      14,
      16,
      19,
      23,
      27,
      29,
      29,
      26,
      22,
      18,
      15
    ],
    "bestMonths": [
      4,
      5,
      8,
      9
    ],
    "crowds": [
      1,
      1,
      1,
      2,
      2,
      3,
      3,
      3,
      3,
      2,
      1,
      1
    ],
    "said": [
      {
        "who": "Maya",
        "month": "Sep 2025",
        "quote": "Sunset in Oia lives up to it, but Imerovigli is calmer.",
        "score": 8.9,
        "face": null
      },
      {
        "who": "Sam",
        "month": "Jun 2024",
        "quote": "Black sand beaches and the volcano boat trip.",
        "score": 8.5,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Canaves Oia",
        "type": "Hotel",
        "match": 90,
        "featured": true,
        "sub": "from £700 a night · Cave suites over the caldera.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Grace Hotel Santorini",
        "type": "Hotel",
        "match": 89,
        "featured": false,
        "sub": "from £600 a night · Maya stayed",
        "because": null,
        "score": 9.1,
        "photo": null
      },
      {
        "name": "Astra Suites",
        "type": "Hotel",
        "match": 85,
        "featured": false,
        "sub": "from £350 a night · Sam stayed",
        "because": null,
        "score": 8.6,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Metaxi Mas",
        "price": "££",
        "what": "A village taverna locals love",
        "score": 9.2,
        "from": "Maya",
        "match": 89,
        "photo": null
      },
      {
        "name": "Ammoudi Fish Tavern",
        "price": "££",
        "what": "Fish by the water below Oia",
        "score": 8.8,
        "from": "Sam",
        "match": 86,
        "photo": null
      },
      {
        "name": "Lucky's Souvlakis",
        "price": "£",
        "what": "The best cheap gyros in Fira",
        "score": 8.6,
        "from": null,
        "match": 84,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Walk",
        "name": "Fira to Oia clifftop walk",
        "what": "About three hours along the caldera rim. Start early.",
        "from": "Maya",
        "gem": false
      },
      {
        "tag": "Boat",
        "name": "Volcano and hot springs boat",
        "what": "Climb the volcano, then swim to the warm springs.",
        "from": "Sam",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Pyrgos",
        "what": "A hilltop village with sunset views and no crowds.",
        "from": "Maya",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "Akrotiri",
        "what": "A Bronze Age town buried by the eruption, like Pompeii.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Watch the sunset from Imerovigli or Pyrgos instead of Oia's crush.",
        "from": "Maya"
      }
    ],
    "credits": null
  },
  "mykonos": {
    "kicker": "Island · Beach",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "June or September",
    "staysFrom": "from £300 a night",
    "goodFor": [
      "Friends",
      "Couples"
    ],
    "temps": [
      14,
      14,
      16,
      19,
      23,
      27,
      28,
      28,
      25,
      22,
      18,
      15
    ],
    "bestMonths": [
      5,
      8
    ],
    "crowds": [
      1,
      1,
      1,
      1,
      2,
      3,
      3,
      3,
      2,
      1,
      1,
      1
    ],
    "said": [
      {
        "who": "Jonah",
        "month": "Jul 2025",
        "quote": "Little Venice at sunset, then dancing till late.",
        "score": 8.4,
        "face": null
      },
      {
        "who": "Sophie",
        "month": "Sep 2024",
        "quote": "Quieter in September, and the sea is still warm.",
        "score": 8.7,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Cavo Tagoo",
        "type": "Hotel",
        "match": 89,
        "featured": true,
        "sub": "from £600 a night · Cave-style rooms and an infinity pool over the sea.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Bill & Coo Suites",
        "type": "Hotel",
        "match": 88,
        "featured": false,
        "sub": "from £450 a night · Sophie stayed",
        "because": null,
        "score": 8.9,
        "photo": null
      },
      {
        "name": "Semeli Hotel",
        "type": "Hotel",
        "match": 84,
        "featured": false,
        "sub": "from £300 a night · Jonah stayed",
        "because": null,
        "score": 8.3,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Kiki's Tavern",
        "price": "££",
        "what": "Grilled meat above a beach, no sign, no bookings",
        "score": 9.0,
        "from": "Sophie",
        "match": 88,
        "photo": null
      },
      {
        "name": "Nammos",
        "price": "£££",
        "what": "The famous beach club at Psarou",
        "score": 8.1,
        "from": "Jonah",
        "match": 80,
        "photo": null
      },
      {
        "name": "Niko's Taverna",
        "price": "££",
        "what": "An Old Town classic",
        "score": 8.4,
        "from": null,
        "match": 83,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "Walk",
        "name": "Little Venice at sunset",
        "what": "Drinks on the water, then up to the windmills.",
        "from": "Jonah",
        "gem": false
      },
      {
        "tag": "Boat",
        "name": "Day trip to Delos",
        "what": "The sacred island of ancient Greece, half an hour by boat. Closed Mondays.",
        "from": "Sophie",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "Agios Sostis beach",
        "what": "No sunbeds, no music, and Kiki's for lunch.",
        "from": "Sophie",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "Kato Mili windmills",
        "what": "Sixteenth-century windmills above Little Venice.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Go in June or September: July and August are packed and pricey.",
        "from": "Sophie"
      }
    ],
    "credits": null
  },
  "rhodes": {
    "kicker": "Island · Beach",
    "scoreNote": "From 2 friends and people with your taste.",
    "bestTime": "May, June, September or October",
    "staysFrom": "from £200 a night",
    "goodFor": [
      "Families",
      "Couples"
    ],
    "temps": [
      15,
      15,
      17,
      20,
      24,
      28,
      31,
      31,
      28,
      24,
      20,
      16
    ],
    "bestMonths": [
      4,
      5,
      8,
      9
    ],
    "crowds": [
      1,
      1,
      1,
      1,
      2,
      3,
      3,
      3,
      2,
      1,
      1,
      1
    ],
    "said": [
      {
        "who": "Harriet",
        "month": "Jun 2025",
        "quote": "The acropolis at Lindos in the morning, St Paul's Bay all afternoon.",
        "score": 8.9,
        "face": null
      },
      {
        "who": "Sam",
        "month": "Aug 2024",
        "quote": "Easy with the kids, and Rhodes Old Town at night.",
        "score": 8.3,
        "face": null
      }
    ],
    "stays": [
      {
        "name": "Lindos Blu",
        "type": "Hotel",
        "match": 89,
        "featured": true,
        "sub": "from £400 a night · Adults only, looking over Lindos bay.",
        "because": null,
        "score": null,
        "photo": null
      },
      {
        "name": "Melenos Lindos",
        "type": "Hotel",
        "match": 89,
        "featured": false,
        "sub": "from £350 a night · Harriet stayed",
        "because": null,
        "score": 9.1,
        "photo": null
      },
      {
        "name": "Lindos Imperial",
        "type": "Hotel",
        "match": 83,
        "featured": false,
        "sub": "from £200 a night · Sam stayed",
        "because": null,
        "score": 8.2,
        "photo": null
      }
    ],
    "eats": [
      {
        "name": "Mavrikos",
        "price": "££",
        "what": "Family-run in Lindos for generations",
        "score": 9.0,
        "from": "Harriet",
        "match": 88,
        "photo": null
      },
      {
        "name": "Marco Polo Café",
        "price": "££",
        "what": "Dinner in the courtyard of an old mansion",
        "score": 8.8,
        "from": null,
        "match": 85,
        "photo": null
      },
      {
        "name": "Kalypso",
        "price": "££",
        "what": "On the roof of an old captain's house",
        "score": 8.5,
        "from": "Sam",
        "match": 83,
        "photo": null
      }
    ],
    "dos": [
      {
        "tag": "History",
        "name": "Acropolis of Lindos",
        "what": "Go at opening, before the heat and the crowds.",
        "from": "Harriet",
        "gem": false
      },
      {
        "tag": "Walk",
        "name": "Rhodes Old Town",
        "what": "The medieval walled town of the Knights. Lovely at night.",
        "from": "Sam",
        "gem": false
      },
      {
        "tag": "Hidden gem",
        "name": "St Paul's Bay",
        "what": "A tiny round bay below Lindos, perfect for a swim.",
        "from": "Harriet",
        "gem": true
      }
    ],
    "culture": [
      {
        "tag": "History",
        "when": null,
        "name": "Palace of the Grand Master",
        "what": "The Knights' castle at the top of the Street of the Knights.",
        "from": null
      }
    ],
    "tips": [
      {
        "tip": "Stay near Lindos for beaches and evenings; it's about an hour from the airport.",
        "from": "Harriet"
      }
    ],
    "credits": null
  }
};
