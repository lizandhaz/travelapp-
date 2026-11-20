import type { Place } from './trips';

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
Tokyo|Japan;Kyoto|Japan;Osaka|Japan;Bangkok|Thailand;Phuket|Thailand;Koh Samui|Thailand;Koh Lanta|Thailand;Chiang Mai|Thailand;Bali|Indonesia;Singapore|Singapore;Hong Kong|Hong Kong;Seoul|South Korea;Hanoi|Vietnam;Ho Chi Minh City|Vietnam;Hoi An|Vietnam;Sri Lanka|Sri Lanka;Goa|India;Kerala|India;Sydney|Australia;Melbourne|Australia;Auckland|New Zealand;Queenstown|New Zealand;Bora Bora|French Polynesia;Fiji|Fiji`;

export const KNOWN_PLACES: Place[] = RAW.split(';')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => {
    const [name, country] = s.split('|');
    return { name, country };
  });

const BY_NAME = new Map(KNOWN_PLACES.map((p) => [p.name.toLowerCase(), p.country]));

/** The country for a place name you typed, if we know it ("venice" → "Italy"). */
export function countryFor(name: string): string {
  return BY_NAME.get(name.trim().toLowerCase()) ?? BY_NAME.get(name.trim().toLowerCase().replace(/^the /, '')) ?? '';
}

/** A stop's country: what was saved, or what we know for that place name. */
export function countryOf(p: Place): string {
  return p.country || countryFor(p.name);
}
