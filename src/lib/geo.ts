import { countryOf } from './knownPlaces';
import type { Place } from './trips';
import { WORLD_VIEWBOX } from './worldMap';

/**
 * Rough map positions (latitude, longitude) for the travel map on You.
 * Only roughly right: a dot on a small world map, never a live location.
 * Places we don't know fall back to the middle of their country; anything
 * else is listed under the map without a dot.
 */
const PLACES = `
Venice|45.44|12.33;Rome|41.9|12.5;Florence|43.77|11.25;Milan|45.46|9.19;Naples|40.85|14.27;Amalfi Coast|40.63|14.6;Positano|40.63|14.48;Sorrento|40.63|14.38;Capri|40.55|14.24;Lake Como|45.99|9.26;Lake Garda|45.6|10.65;Tuscany|43.4|11.1;Cinque Terre|44.13|9.7;Sicily|37.6|14;Palermo|38.12|13.36;Taormina|37.85|15.29;Sardinia|40.1|9.0;Puglia|40.9|16.8;Polignano a Mare|40.99|17.22;Bologna|44.49|11.34;Verona|45.44|10.99;Turin|45.07|7.69;Dolomites|46.4|11.85;
Lisbon|38.72|-9.14;Porto|41.15|-8.61;Algarve|37.1|-8.2;Lagos|37.1|-8.67;Faro|37.02|-7.93;Albufeira|37.09|-8.25;Vilamoura|37.08|-8.12;Comporta|38.38|-8.78;Sintra|38.8|-9.38;Madeira|32.75|-16.95;Funchal|32.65|-16.91;Azores|37.75|-25.67;Cascais|38.7|-9.42;Douro Valley|41.16|-7.79;
Barcelona|41.39|2.17;Madrid|40.42|-3.7;Seville|37.39|-5.98;Granada|37.18|-3.6;Malaga|36.72|-4.42;Marbella|36.51|-4.88;Valencia|39.47|-0.38;Mallorca|39.6|2.9;Majorca|39.6|2.9;Palma|39.57|2.65;Deià|39.75|2.65;Ibiza|38.98|1.43;Menorca|39.95|4.1;Tenerife|28.29|-16.63;Lanzarote|29.05|-13.6;Gran Canaria|27.92|-15.6;Fuerteventura|28.36|-14.05;San Sebastián|43.32|-1.98;Bilbao|43.26|-2.93;Costa del Sol|36.6|-4.6;Costa Brava|41.9|3.1;Cádiz|36.53|-6.29;
Paris|48.86|2.35;Nice|43.7|7.27;Cannes|43.55|7.02;Provence|43.9|5.6;Bordeaux|44.84|-0.58;Lyon|45.76|4.84;Marseille|43.3|5.37;Chamonix|45.92|6.87;Courchevel|45.41|6.63;Val Thorens|45.3|6.58;Méribel|45.4|6.57;Biarritz|43.48|-1.56;Normandy|49.2|-0.4;Brittany|48.2|-3;Corsica|42.15|9.1;Antibes|43.58|7.12;Saint-Tropez|43.27|6.64;Champagne|49.04|3.96;Dordogne|44.9|0.7;
Athens|37.98|23.73;Santorini|36.39|25.46;Mykonos|37.45|25.33;Crete|35.24|24.8;Chania|35.51|24.02;Rhodes|36.43|28.22;Corfu|39.62|19.92;Hydra|37.35|23.47;Paros|37.08|25.15;Naxos|37.1|25.38;Zakynthos|37.78|20.9;Kefalonia|38.2|20.5;Milos|36.7|24.42;Thessaloniki|40.64|22.94;Halkidiki|40.3|23.5;
Amsterdam|52.37|4.9;Brussels|50.85|4.35;Bruges|51.21|3.22;Berlin|52.52|13.4;Munich|48.14|11.58;Hamburg|53.55|9.99;Heidelberg|49.4|8.67;Cologne|50.94|6.96;Vienna|48.21|16.37;Salzburg|47.8|13.04;St Anton|47.13|10.27;Innsbruck|47.27|11.39;Zurich|47.38|8.54;Geneva|46.2|6.14;Zermatt|46.02|7.75;Verbier|46.1|7.23;Lucerne|47.05|8.31;Interlaken|46.69|7.86;Prague|50.08|14.44;Budapest|47.5|19.04;Kraków|50.06|19.94;Warsaw|52.23|21.01;Dubrovnik|42.65|18.09;Split|43.51|16.44;Hvar|43.17|16.44;Copenhagen|55.68|12.57;Stockholm|59.33|18.07;Oslo|59.91|10.75;Bergen|60.39|5.32;Helsinki|60.17|24.94;Reykjavik|64.15|-21.94;Iceland|64.9|-19;Dublin|53.35|-6.26;Galway|53.27|-9.05;Kotor|42.42|18.77;Valletta|35.9|14.51;Malta|35.9|14.45;Gozo|36.04|14.25;Paphos|34.77|32.42;Ayia Napa|34.99|34;Istanbul|41.01|28.98;Bodrum|37.03|27.43;Dalaman|36.77|28.8;Antalya|36.9|30.7;
London|51.51|-0.13;Bath|51.38|-2.36;York|53.96|-1.08;Oxford|51.75|-1.26;Cambridge|52.21|0.12;Brighton|50.82|-0.14;Cornwall|50.4|-4.9;St Ives|50.21|-5.48;Padstow|50.54|-4.94;Devon|50.7|-3.8;Cotswolds|51.85|-1.8;The Cotswolds|51.85|-1.8;Lake District|54.46|-3.09;Norfolk|52.6|1;Whitstable|51.36|1.03;Cheltenham|51.9|-2.08;Stratford-upon-Avon|52.19|-1.71;Warwick|52.28|-1.58;Warwick Castle|52.28|-1.58;Longleat|51.19|-2.28;Liverpool|53.41|-2.98;Manchester|53.48|-2.24;Bristol|51.45|-2.59;Isle of Wight|50.69|-1.3;Edinburgh|55.95|-3.19;Glasgow|55.86|-4.25;Isle of Skye|57.3|-6.2;Highlands|57.2|-4.8;Cardiff|51.48|-3.18;Snowdonia|53.07|-3.9;Pembrokeshire|51.8|-5;Belfast|54.6|-5.93;
Marrakech|31.63|-7.99;Essaouira|31.51|-9.77;Cape Town|-33.92|18.42;Zanzibar|-6.16|39.2;Mauritius|-20.2|57.5;Seychelles|-4.68|55.49;La Digue|-4.36|55.84;Maldives|3.2|73.5;The Maldives|3.2|73.5;Dubai|25.2|55.27;Abu Dhabi|24.45|54.38;Egypt|26.8|30.8;Sharm El Sheikh|27.92|34.33;Kenya|-0.02|37.9;
New York|40.71|-74;Orlando|28.54|-81.38;Miami|25.76|-80.19;Los Angeles|34.05|-118.24;San Francisco|37.77|-122.42;Las Vegas|36.17|-115.14;Hawaii|20.8|-156.3;Boston|42.36|-71.06;Chicago|41.88|-87.63;New Orleans|29.95|-90.07;Toronto|43.65|-79.38;Vancouver|49.28|-123.12;Montreal|45.5|-73.57;Mexico City|19.43|-99.13;Tulum|20.21|-87.47;Cancún|21.16|-86.85;Barbados|13.19|-59.54;Antigua|17.07|-61.8;St Lucia|13.91|-60.98;Jamaica|18.11|-77.3;Turks and Caicos|21.69|-71.8;Bahamas|25.03|-77.4;Cuba|21.5|-79;Havana|23.11|-82.37;Costa Rica|9.75|-83.75;Peru|-9.2|-75;Cusco|-13.53|-71.97;Rio de Janeiro|-22.91|-43.17;Buenos Aires|-34.6|-58.38;Patagonia|-50|-72;
Tokyo|35.68|139.69;Kyoto|35.01|135.77;Osaka|34.69|135.5;Bangkok|13.75|100.5;Phuket|7.88|98.39;Koh Samui|9.51|100.01;Koh Lanta|7.6|99.05;Chiang Mai|18.79|98.98;Bali|-8.4|115.19;Singapore|1.35|103.82;Hong Kong|22.32|114.17;Seoul|37.57|126.98;Hanoi|21.03|105.85;Ho Chi Minh City|10.82|106.63;Hoi An|15.88|108.33;Sri Lanka|7.87|80.77;Goa|15.3|74.12;Kerala|10.85|76.27;Sydney|-33.87|151.21;Melbourne|-37.81|144.96;Auckland|-36.85|174.76;Queenstown|-45.03|168.66;Bora Bora|-16.5|-151.74;Fiji|-17.71|178.07`;

/** The middle of each country, for places we don't have a position for. */
const COUNTRIES = `
Italy|42.8|12.6;Portugal|39.6|-8.2;Spain|40.2|-3.6;France|46.6|2.4;Greece|39.1|22.4;Netherlands|52.2|5.5;Belgium|50.6|4.6;Germany|51.1|10.4;Austria|47.6|14.1;Switzerland|46.8|8.2;Czechia|49.8|15.5;Hungary|47.2|19.5;Poland|52|19.4;Croatia|45.1|15.2;Denmark|56|9.5;Sweden|62|15;Norway|61|9;Finland|63|26;Iceland|64.9|-19;Ireland|53.4|-8;Montenegro|42.7|19.4;Malta|35.9|14.45;Cyprus|35|33.2;Turkey|39|35;
England|52.5|-1.5;Scotland|56.8|-4.2;Wales|52.3|-3.7;Northern Ireland|54.6|-6.7;United Kingdom|54|-2;UK|54|-2;
Morocco|31.8|-7.1;South Africa|-30.6|22.9;Tanzania|-6.4|34.9;Mauritius|-20.2|57.5;Seychelles|-4.68|55.49;Maldives|3.2|73.5;United Arab Emirates|24|54;UAE|24|54;Egypt|26.8|30.8;Kenya|-0.02|37.9;Tunisia|34|9.5;Jordan|31|36.5;Israel|31.2|34.9;Namibia|-22.6|17.1;Botswana|-22.3|24.7;Madagascar|-19|46.7;Cape Verde|16|-24;
USA|39.5|-98.4;United States|39.5|-98.4;Canada|56|-106;Mexico|23.6|-102.5;Barbados|13.19|-59.54;Antigua and Barbuda|17.07|-61.8;Saint Lucia|13.91|-60.98;Jamaica|18.11|-77.3;Turks and Caicos|21.69|-71.8;Bahamas|25.03|-77.4;Cuba|21.5|-79;Costa Rica|9.75|-83.75;Peru|-9.2|-75;Brazil|-10.8|-52.9;Argentina|-38.4|-63.6;Chile|-35.7|-71.5;Colombia|4.6|-74.1;Dominican Republic|18.7|-70.2;
Japan|36.2|138.3;Thailand|15.9|100.9;Indonesia|-2.5|118;Singapore|1.35|103.82;Hong Kong|22.32|114.17;South Korea|36.5|127.9;Vietnam|14.1|108.3;Sri Lanka|7.87|80.77;India|21|78;China|35|104;Malaysia|4.2|102;Philippines|12.9|121.8;Cambodia|12.6|104.9;Nepal|28.4|84.1;
Australia|-25.3|133.8;New Zealand|-41.3|174.8;French Polynesia|-17.7|-149.4;Fiji|-17.71|178.07`;

function parse(raw: string) {
  return new Map(
    raw
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const [name, lat, lon] = s.split('|');
        return [name.toLowerCase(), [Number(lat), Number(lon)] as [number, number]];
      }),
  );
}

const PLACE_POS = parse(PLACES);
const COUNTRY_POS = parse(COUNTRIES);

/** Latitude and longitude for a place, or null if we don't know roughly where it is. */
export function positionOf(p: Place): [number, number] | null {
  const n = p.name.trim().toLowerCase();
  return PLACE_POS.get(n) ?? PLACE_POS.get(n.replace(/^the /, '')) ?? COUNTRY_POS.get(countryOf(p).trim().toLowerCase()) ?? null;
}

/**
 * Where a latitude and longitude sit on the world map (360 × 158), matching the
 * prototype's map projection (a rounded world, like the Robinson projection).
 */
export function toMap([lat, lon]: [number, number]): { x: number; y: number } {
  const x = 179.88 + lon * (0.9729 - 6.347e-5 * lat * lat);
  const y = 87.53 - 1.3239 * lat - 1.001e-4 * lat * lat + 4.3816e-5 * lat * lat * lat;
  return { x: Math.min(WORLD_VIEWBOX.width - 3, Math.max(3, x)), y: Math.min(WORLD_VIEWBOX.height - 3, Math.max(3, y)) };
}
