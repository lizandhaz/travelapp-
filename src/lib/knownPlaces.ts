import type { Place } from './trips';
import { WORLD_COUNTRIES, WORLD_PLACES_RAW } from './worldPlaces';

/**
 * Popular holiday places and their countries. Used to suggest places as you
 * type ("Venice, Italy"), and to work out the country for trips saved without
 * one (so "Venice" still counts towards Italy).
 */
const RAW = `
Venice|Italy;Rome|Italy;Florence|Italy;Milan|Italy;Naples|Italy;Amalfi Coast|Italy;Positano|Italy;Sorrento|Italy;Capri|Italy;Lake Como|Italy;Lake Garda|Italy;Tuscany|Italy;Cinque Terre|Italy;Sicily|Italy;Palermo|Italy;Taormina|Italy;Sardinia|Italy;Puglia|Italy;Polignano a Mare|Italy;Bologna|Italy;Verona|Italy;Turin|Italy;Dolomites|Italy;
Lisbon|Portugal;Porto|Portugal;Algarve|Portugal;Lagos|Portugal;Faro|Portugal;Albufeira|Portugal;Vilamoura|Portugal;Comporta|Portugal;Sintra|Portugal;Madeira|Portugal;Funchal|Portugal;Azores|Portugal;Cascais|Portugal;Douro Valley|Portugal;
Barcelona|Spain;Madrid|Spain;Seville|Spain;Granada|Spain;Malaga|Spain;Marbella|Spain;Valencia|Spain;Mallorca|Spain;Majorca|Spain;Palma|Spain;Deià|Spain;Ibiza|Spain;Menorca|Spain;Tenerife|Spain;Lanzarote|Spain;Gran Canaria|Spain;Fuerteventura|Spain;San Sebastián|Spain;Bilbao|Spain;Costa del Sol|Spain;Costa Brava|Spain;Cádiz|Spain;
Paris|France;Nice|France;Cannes|France;Provence|France;Bordeaux|France;Lyon|France;Marseille|France;Chamonix|France;Courchevel|France;Val Thorens|France;Méribel|France;Biarritz|France;Normandy|France;Brittany|France;Corsica|France;Antibes|France;Saint-Tropez|France;Champagne|France;Dordogne|France;
Athens|Greece;Santorini|Greece;Mykonos|Greece;Crete|Greece;Chania|Greece;Rhodes|Greece;Corfu|Greece;Hydra|Greece;Paros|Greece;Naxos|Greece;Zakynthos|Greece;Kefalonia|Greece;Milos|Greece;Thessaloniki|Greece;Halkidiki|Greece;
Amsterdam|Netherlands;Brussels|Belgium;Bruges|Belgium;Berlin|Germany;Munich|Germany;Hamburg|Germany;Heidelberg|Germany;Cologne|Germany;Vienna|Austria;Salzburg|Austria;St Anton|Austria;Innsbruck|Austria;Zurich|Switzerland;Geneva|Switzerland;Zermatt|Switzerland;Verbier|Switzerland;Lucerne|Switzerland;Interlaken|Switzerland;Prague|Czechia;Budapest|Hungary;Kraków|Poland;Warsaw|Poland;Dubrovnik|Croatia;Split|Croatia;Hvar|Croatia;Copenhagen|Denmark;Stockholm|Sweden;Oslo|Norway;Bergen|Norway;Helsinki|Finland;Reykjavik|Iceland;Iceland|Iceland;Dublin|Ireland;Galway|Ireland;Kotor|Montenegro;Valletta|Malta;Malta|Malta;Gozo|Malta;Paphos|Cyprus;Ayia Napa|Cyprus;Istanbul|Turkey;Bodrum|Turkey;Dalaman|Turkey;Antalya|Turkey;
London|England;Bath|England;York|England;Oxford|England;Cambridge|England;Brighton|England;Cornwall|England;St Ives|England;Padstow|England;Devon|England;Cotswolds|England;The Cotswolds|England;Lake District|England;Norfolk|England;Whitstable|England;Cheltenham|England;Stratford-upon-Avon|England;Warwick|England;Liverpool|England;Manchester|England;Bristol|England;Isle of Wight|England;Edinburgh|Scotland;Glasgow|Scotland;Isle of Skye|Scotland;Highlands|Scotland;Cardiff|Wales;Snowdonia|Wales;Pembrokeshire|Wales;Belfast|Northern Ireland;
Marrakech|Morocco;Essaouira|Morocco;Cape Town|South Africa;Zanzibar|Tanzania;Mauritius|Mauritius;Seychelles|Seychelles;La Digue|Seychelles;Maldives|Maldives;The Maldives|Maldives;Dubai|United Arab Emirates;Abu Dhabi|United Arab Emirates;Egypt|Egypt;Sharm El Sheikh|Egypt;Kenya|Kenya;
New York|USA;Orlando|USA;Miami|USA;Los Angeles|USA;San Francisco|USA;Las Vegas|USA;Hawaii|USA;Boston|USA;Chicago|USA;New Orleans|USA;Toronto|Canada;Vancouver|Canada;Montreal|Canada;Mexico City|Mexico;Tulum|Mexico;Cancún|Mexico;Barbados|Barbados;Antigua|Antigua and Barbuda;St Lucia|Saint Lucia;Jamaica|Jamaica;Turks and Caicos|Turks and Caicos;Bahamas|Bahamas;Cuba|Cuba;Havana|Cuba;Costa Rica|Costa Rica;Peru|Peru;Cusco|Peru;Rio de Janeiro|Brazil;Buenos Aires|Argentina;Patagonia|Argentina;
Tokyo|Japan;Kyoto|Japan;Osaka|Japan;Bangkok|Thailand;Phuket|Thailand;Koh Samui|Thailand;Koh Lanta|Thailand;Chiang Mai|Thailand;Bali|Indonesia;Singapore|Singapore;Hong Kong|Hong Kong;Seoul|South Korea;Hanoi|Vietnam;Ho Chi Minh City|Vietnam;Hoi An|Vietnam;Sri Lanka|Sri Lanka;Goa|India;Kerala|India;Sydney|Australia;Melbourne|Australia;Auckland|New Zealand;Queenstown|New Zealand;Bora Bora|French Polynesia;Fiji|Fiji;
Oia|Greece;Fira|Greece;Paxos|Greece;Skiathos|Greece;Skopelos|Greece;Lefkada|Greece;Ithaca|Greece;Kos|Greece;Folegandros|Greece;Sifnos|Greece;Spetses|Greece;Elounda|Greece;Nafplio|Greece;Meteora|Greece;Lindos|Greece;Symi|Greece;Portofino|Italy;Ravello|Italy;Amalfi|Italy;Bellagio|Italy;Varenna|Italy;Sirmione|Italy;Lake Maggiore|Italy;Matera|Italy;Alberobello|Italy;Ostuni|Italy;Lecce|Italy;Siena|Italy;San Gimignano|Italy;Montepulciano|Italy;Lucca|Italy;Ischia|Italy;Procida|Italy;Cortina d'Ampezzo|Italy;Lake Orta|Italy;Cefalù|Italy;Ortigia|Italy;Aeolian Islands|Italy;Salina|Italy;Panarea|Italy;Langhe|Italy;Val d'Orcia|Italy;Forte dei Marmi|Italy;Ericeira|Portugal;Tavira|Portugal;Carvoeiro|Portugal;Óbidos|Portugal;Évora|Portugal;Melides|Portugal;Nazaré|Portugal;Porto Santo|Portugal;Sóller|Spain;Pollença|Spain;Formentera|Spain;Ronda|Spain;Nerja|Spain;Sitges|Spain;Cadaqués|Spain;Tarifa|Spain;La Palma|Spain;La Gomera|Spain;Toledo|Spain;Córdoba|Spain;Annecy|France;Èze|France;Menton|France;Gordes|France;Arles|France;Avignon|France;Île de Ré|France;Mont-Saint-Michel|France;Étretat|France;Carcassonne|France;Colmar|France;Megève|France;Tignes|France;Val d'Isère|France;Morzine|France;Les Arcs|France;La Plagne|France;Alpe d'Huez|France;Cap Ferrat|France;Porquerolles|France;Loire Valley|France;Hallstatt|Austria;Kitzbühel|Austria;Lech|Austria;Ischgl|Austria;Sölden|Austria;Mayrhofen|Austria;Grindelwald|Switzerland;Wengen|Switzerland;St. Moritz|Switzerland;Davos|Switzerland;Gstaad|Switzerland;Lauterbrunnen|Switzerland;Lake Bled|Slovenia;Bled|Slovenia;Ljubljana|Slovenia;Piran|Slovenia;Rovinj|Croatia;Korčula|Croatia;Vis|Croatia;Plitvice Lakes|Croatia;Brač|Croatia;Budva|Montenegro;Sveti Stefan|Montenegro;Ohrid|North Macedonia;Ksamil|Albania;Saranda|Albania;Ghent|Belgium;Giethoorn|Netherlands;Cesky Krumlov|Czechia;Lofoten|Norway;Tromsø|Norway;Geirangerfjord|Norway;Lapland|Finland;Rovaniemi|Finland;Faroe Islands|Faroe Islands;Gotland|Sweden;Tallinn|Estonia;Riga|Latvia;Vilnius|Lithuania;Kinsale|Ireland;Dingle|Ireland;Killarney|Ireland;Connemara|Ireland;Rye|England;Salcombe|England;Dartmouth|England;Rock|England;Falmouth|England;Mousehole|England;Fowey|England;Whitby|England;Isles of Scilly|England;New Forest|England;Peak District|England;Yorkshire Dales|England;Northumberland|England;Jurassic Coast|England;Lyme Regis|England;Aldeburgh|England;Southwold|England;Burford|England;Bibury|England;Windermere|England;Ambleside|England;St Andrews|Scotland;Isle of Mull|Scotland;Islay|Scotland;Orkney|Scotland;Fort William|Scotland;Inverness|Scotland;Tenby|Wales;Portmeirion|Wales;Anglesey|Wales;Brecon Beacons|Wales;Jersey|Jersey;Guernsey|Guernsey;Isle of Man|Isle of Man;Chefchaouen|Morocco;Fes|Morocco;Agafay Desert|Morocco;Sahara|Morocco;Djerba|Tunisia;Luxor|Egypt;Petra|Jordan;Wadi Rum|Jordan;Masai Mara|Kenya;Serengeti|Tanzania;Kruger|South Africa;Franschhoek|South Africa;Stellenbosch|South Africa;Victoria Falls|Zimbabwe;Okavango Delta|Botswana;Sossusvlei|Namibia;Lamu|Kenya;Diani Beach|Kenya;Praslin|Seychelles;Mahé|Seychelles;Oman|Oman;Muscat|Oman;Big Sur|USA;Napa Valley|USA;Yosemite|USA;Grand Canyon|USA;Aspen|USA;Vail|USA;Jackson Hole|USA;Nantucket|USA;Martha's Vineyard|USA;The Hamptons|USA;Florida Keys|USA;Key West|USA;Maui|USA;Kauai|USA;Oahu|USA;Nashville|USA;Austin|USA;Charleston|USA;Savannah|USA;Whistler|Canada;Banff|Canada;Quebec City|Canada;Tobago|Trinidad and Tobago;Grenada|Grenada;Mustique|Saint Vincent and the Grenadines;St Barts|Saint Barthélemy;Anguilla|Anguilla;British Virgin Islands|British Virgin Islands;Aruba|Aruba;Curaçao|Curaçao;Puerto Rico|Puerto Rico;Dominican Republic|Dominican Republic;Punta Cana|Dominican Republic;Belize|Belize;Holbox|Mexico;Playa del Carmen|Mexico;Oaxaca|Mexico;Cabo San Lucas|Mexico;Puerto Escondido|Mexico;Cartagena|Colombia;Galápagos|Ecuador;Machu Picchu|Peru;Atacama|Chile;Torres del Paine|Chile;Trancoso|Brazil;Florianópolis|Brazil;Mendoza|Argentina;Ubud|Indonesia;Seminyak|Indonesia;Uluwatu|Indonesia;Lombok|Indonesia;Gili Islands|Indonesia;Komodo|Indonesia;Koh Phangan|Thailand;Koh Tao|Thailand;Krabi|Thailand;Koh Yao Noi|Thailand;Koh Lipe|Thailand;Khao Lak|Thailand;Langkawi|Malaysia;Penang|Malaysia;Palawan|Philippines;El Nido|Philippines;Siargao|Philippines;Boracay|Philippines;Siem Reap|Cambodia;Luang Prabang|Laos;Ha Long Bay|Vietnam;Da Nang|Vietnam;Phu Quoc|Vietnam;Sapa|Vietnam;Hakone|Japan;Nara|Japan;Niseko|Japan;Hokkaido|Japan;Okinawa|Japan;Hiroshima|Japan;Kanazawa|Japan;Jeju|South Korea;Rajasthan|India;Jaipur|India;Udaipur|India;Agra|India;Rishikesh|India;Galle|Sri Lanka;Ella|Sri Lanka;Kandy|Sri Lanka;Bhutan|Bhutan;Kathmandu|Nepal;Pokhara|Nepal;Byron Bay|Australia;Noosa|Australia;Great Barrier Reef|Australia;Whitsundays|Australia;Uluru|Australia;Tasmania|Australia;Margaret River|Australia;Perth|Australia;Wanaka|New Zealand;Rotorua|New Zealand;Milford Sound|New Zealand;Bay of Islands|New Zealand;Moorea|French Polynesia;Tahiti|French Polynesia;Cook Islands|Cook Islands;Samoa|Samoa;Vanuatu|Vanuatu`;

export const KNOWN_PLACES: Place[] = RAW.split(';')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => {
    const [name, country] = s.split('|');
    return { name, country };
  });

/** About 10,000 towns and cities worldwide (most populous first), with map positions. */
export const WORLD_PLACES: (Place & { lat: number; lon: number })[] = WORLD_PLACES_RAW.split(';').map((s) => {
  const [name, country, lat, lon] = s.split('|');
  return { name, country, lat: Number(lat), lon: Number(lon) };
});

/** Every country as a place of its own ("Greece"). */
export const COUNTRY_PLACES: Place[] = WORLD_COUNTRIES.map((c) => ({ name: c, country: c }));

/** Everything to suggest when you type a place: popular holiday places first, then countries, then towns and cities. */
export const ALL_PLACES: Place[] = [...KNOWN_PLACES, ...COUNTRY_PLACES, ...WORLD_PLACES];

const BY_NAME = new Map<string, string>();
for (const p of ALL_PLACES) {
  const key = p.name.toLowerCase();
  if (!BY_NAME.has(key)) BY_NAME.set(key, p.country); // the first (best-known) place with that name wins
}

/** The country for a place name you typed, if we know it ("venice" → "Italy"). */
export function countryFor(name: string): string {
  return BY_NAME.get(name.trim().toLowerCase()) ?? BY_NAME.get(name.trim().toLowerCase().replace(/^the /, '')) ?? '';
}

/** A stop's country: what was saved, or what we know for that place name. */
export function countryOf(p: Place): string {
  return p.country || countryFor(p.name);
}

/** Lower case without accents, for matching ("Málaga" → "malaga"). */
export function plain(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
