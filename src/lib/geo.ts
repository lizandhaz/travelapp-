import { countryOf, plain, WORLD_PLACES } from './knownPlaces';
import type { Place } from './trips';
import { WORLD_VIEWBOX } from './worldMap';
import { CAPITALS } from './worldPlaces';

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
Tokyo|35.68|139.69;Kyoto|35.01|135.77;Osaka|34.69|135.5;Bangkok|13.75|100.5;Phuket|7.88|98.39;Koh Samui|9.51|100.01;Koh Lanta|7.6|99.05;Chiang Mai|18.79|98.98;Bali|-8.4|115.19;Singapore|1.35|103.82;Hong Kong|22.32|114.17;Seoul|37.57|126.98;Hanoi|21.03|105.85;Ho Chi Minh City|10.82|106.63;Hoi An|15.88|108.33;Sri Lanka|7.87|80.77;Goa|15.3|74.12;Kerala|10.85|76.27;Sydney|-33.87|151.21;Melbourne|-37.81|144.96;Auckland|-36.85|174.76;Queenstown|-45.03|168.66;Bora Bora|-16.5|-151.74;Fiji|-17.71|178.07;
Oia|36.46|25.38;Fira|36.42|25.43;Paxos|39.2|20.18;Skiathos|39.16|23.49;Skopelos|39.12|23.73;Lefkada|38.83|20.7;Ithaca|38.4|20.68;Kos|36.89|27.29;Folegandros|36.62|24.92;Sifnos|36.97|24.7;Spetses|37.26|23.15;Elounda|35.26|25.72;Nafplio|37.57|22.8;Meteora|39.72|21.63;Lindos|36.09|28.09;Symi|36.58|27.84;Portofino|44.3|9.21;Ravello|40.65|14.61;Amalfi|40.63|14.6;Bellagio|45.99|9.26;Varenna|46.01|9.28;Sirmione|45.49|10.61;Lake Maggiore|45.95|8.63;Matera|40.67|16.6;Alberobello|40.78|17.24;Ostuni|40.73|17.58;Lecce|40.35|18.17;Siena|43.32|11.33;San Gimignano|43.47|11.04;Montepulciano|43.09|11.78;Lucca|43.84|10.5;Ischia|40.73|13.9;Procida|40.76|14.02;Cortina d'Ampezzo|46.54|12.14;Lake Orta|45.81|8.4;Cefalù|38.04|14.02;Ortigia|37.06|15.29;Aeolian Islands|38.53|14.9;Salina|38.56|14.85;Panarea|38.64|15.07;Langhe|44.6|8.0;Val d'Orcia|43.0|11.6;Forte dei Marmi|43.96|10.17;Ericeira|38.96|-9.42;Tavira|37.13|-7.65;Carvoeiro|37.1|-8.47;Óbidos|39.36|-9.16;Évora|38.57|-7.91;Melides|38.14|-8.73;Nazaré|39.6|-9.07;Porto Santo|33.06|-16.34;Sóller|39.77|2.71;Pollença|39.88|3.02;Formentera|38.7|1.45;Ronda|36.74|-5.17;Nerja|36.75|-3.87;Sitges|41.24|1.81;Cadaqués|42.29|3.28;Tarifa|36.01|-5.6;La Palma|28.68|-17.86;La Gomera|28.1|-17.11;Toledo|39.86|-4.03;Córdoba|37.89|-4.78;Annecy|45.9|6.13;Èze|43.73|7.36;Menton|43.78|7.5;Gordes|43.91|5.2;Arles|43.68|4.63;Avignon|43.95|4.81;Île de Ré|46.2|-1.42;Mont-Saint-Michel|48.64|-1.51;Étretat|49.71|0.2;Carcassonne|43.21|2.35;Colmar|48.08|7.36;Megève|45.86|6.62;Tignes|45.47|6.91;Val d'Isère|45.45|6.98;Morzine|46.18|6.71;Les Arcs|45.57|6.83;La Plagne|45.51|6.68;Alpe d'Huez|45.09|6.07;Cap Ferrat|43.69|7.33;Porquerolles|43.0|6.2;Loire Valley|47.4|0.7;Hallstatt|47.56|13.65;Kitzbühel|47.45|12.39;Lech|47.21|10.14;Ischgl|47.01|10.29;Sölden|46.97|11.0;Mayrhofen|47.17|11.86;Grindelwald|46.62|8.04;Wengen|46.61|7.92;St. Moritz|46.5|9.84;Davos|46.8|9.84;Gstaad|46.47|7.29;Lauterbrunnen|46.59|7.91;Lake Bled|46.36|14.09;Bled|46.37|14.11;Ljubljana|46.06|14.51;Piran|45.53|13.57;Rovinj|45.08|13.64;Korčula|42.96|17.14;Vis|43.06|16.18;Plitvice Lakes|44.88|15.62;Brač|43.32|16.65;Budva|42.29|18.84;Sveti Stefan|42.26|18.89;Ohrid|41.12|20.8;Ksamil|39.77|20.0;Saranda|39.88|20.0;Ghent|51.05|3.72;Giethoorn|52.74|6.08;Cesky Krumlov|48.81|14.32;Lofoten|68.2|14.0;Tromsø|69.65|18.96;Geirangerfjord|62.1|7.1;Lapland|67.5|26.5;Rovaniemi|66.5|25.73;Faroe Islands|62.0|-6.8;Gotland|57.5|18.5;Tallinn|59.44|24.75;Riga|56.95|24.11;Vilnius|54.69|25.28;Kinsale|51.71|-8.53;Dingle|52.14|-10.27;Killarney|52.06|-9.5;Connemara|53.5|-9.8;Rye|50.95|0.73;Salcombe|50.24|-3.77;Dartmouth|50.35|-3.58;Rock|50.55|-4.92;Falmouth|50.15|-5.07;Mousehole|50.08|-5.54;Fowey|50.33|-4.64;Whitby|54.49|-0.61;Isles of Scilly|49.92|-6.31;New Forest|50.87|-1.6;Peak District|53.3|-1.8;Yorkshire Dales|54.25|-2.1;Northumberland|55.2|-2.0;Jurassic Coast|50.6|-2.5;Lyme Regis|50.73|-2.94;Aldeburgh|52.15|1.6;Southwold|52.33|1.68;Burford|51.81|-1.64;Bibury|51.76|-1.83;Windermere|54.38|-2.91;Ambleside|54.43|-2.96;St Andrews|56.34|-2.8;Isle of Mull|56.45|-6.0;Islay|55.77|-6.2;Orkney|59.0|-3.0;Fort William|56.82|-5.11;Inverness|57.48|-4.22;Tenby|51.67|-4.7;Portmeirion|52.91|-4.1;Anglesey|53.27|-4.35;Brecon Beacons|51.88|-3.44;Jersey|49.21|-2.13;Guernsey|49.45|-2.58;Isle of Man|54.24|-4.55;Chefchaouen|35.17|-5.26;Fes|34.03|-5.0;Agafay Desert|31.45|-8.2;Sahara|31.1|-4.0;Djerba|33.81|10.86;Luxor|25.69|32.64;Petra|30.33|35.44;Wadi Rum|29.58|35.42;Masai Mara|-1.5|35.15;Serengeti|-2.33|34.83;Kruger|-24.0|31.5;Franschhoek|-33.91|19.12;Stellenbosch|-33.93|18.86;Victoria Falls|-17.92|25.86;Okavango Delta|-19.3|22.9;Sossusvlei|-24.73|15.3;Lamu|-2.27|40.9;Diani Beach|-4.32|39.58;Praslin|-4.33|55.73;Mahé|-4.68|55.48;Oman|21.5|56.0;Muscat|23.59|58.41;Big Sur|36.27|-121.81;Napa Valley|38.5|-122.3;Yosemite|37.75|-119.59;Grand Canyon|36.1|-112.1;Aspen|39.19|-106.82;Vail|39.64|-106.37;Jackson Hole|43.48|-110.76;Nantucket|41.28|-70.1;Martha's Vineyard|41.4|-70.6;The Hamptons|40.96|-72.18;Florida Keys|24.7|-81.1;Key West|24.56|-81.78;Maui|20.8|-156.33;Kauai|22.06|-159.5;Oahu|21.47|-157.98;Nashville|36.16|-86.78;Austin|30.27|-97.74;Charleston|32.78|-79.93;Savannah|32.08|-81.09;Whistler|50.12|-122.95;Banff|51.18|-115.57;Quebec City|46.81|-71.21;Tobago|11.25|-60.67;Grenada|12.12|-61.68;Mustique|12.88|-61.19;St Barts|17.9|-62.83;Anguilla|18.22|-63.07;British Virgin Islands|18.43|-64.62;Aruba|12.52|-69.97;Curaçao|12.17|-68.98;Puerto Rico|18.22|-66.59;Dominican Republic|18.74|-70.16;Punta Cana|18.58|-68.4;Belize|17.19|-88.5;Holbox|21.52|-87.38;Playa del Carmen|20.63|-87.08;Oaxaca|17.07|-96.73;Cabo San Lucas|22.89|-109.92;Puerto Escondido|15.86|-97.07;Cartagena|10.39|-75.48;Galápagos|-0.95|-90.97;Machu Picchu|-13.16|-72.55;Atacama|-23.0|-68.2;Torres del Paine|-51.0|-73.0;Trancoso|-16.59|-39.1;Florianópolis|-27.6|-48.55;Mendoza|-32.89|-68.84;Ubud|-8.51|115.26;Seminyak|-8.69|115.16;Uluwatu|-8.83|115.09;Lombok|-8.65|116.32;Gili Islands|-8.35|116.06;Komodo|-8.55|119.49;Koh Phangan|9.73|100.01;Koh Tao|10.1|99.84;Krabi|8.09|98.91;Koh Yao Noi|8.13|98.62;Koh Lipe|6.49|99.3;Khao Lak|8.63|98.25;Langkawi|6.35|99.8;Penang|5.41|100.33;Palawan|9.84|118.74;El Nido|11.2|119.42;Siargao|9.85|126.05;Boracay|11.97|121.92;Siem Reap|13.36|103.86;Luang Prabang|19.89|102.13;Ha Long Bay|20.91|107.18;Da Nang|16.05|108.2;Phu Quoc|10.29|103.98;Sapa|22.34|103.84;Hakone|35.23|139.11;Nara|34.69|135.8;Niseko|42.8|140.69;Hokkaido|43.2|142.8;Okinawa|26.5|127.9;Hiroshima|34.39|132.46;Kanazawa|36.56|136.66;Jeju|33.49|126.5;Rajasthan|26.9|73.8;Jaipur|26.91|75.79;Udaipur|24.59|73.71;Agra|27.18|78.01;Rishikesh|30.09|78.27;Galle|6.03|80.22;Ella|6.87|81.05;Kandy|7.29|80.63;Bhutan|27.5|90.4;Kathmandu|27.72|85.32;Pokhara|28.21|83.99;Byron Bay|-28.64|153.61;Noosa|-26.39|153.09;Great Barrier Reef|-18.29|147.7;Whitsundays|-20.28|148.95;Uluru|-25.34|131.04;Tasmania|-42.0|146.6;Margaret River|-33.95|115.07;Perth|-31.95|115.86;Wanaka|-44.7|169.13;Rotorua|-38.14|176.25;Milford Sound|-44.67|167.93;Bay of Islands|-35.2|174.1;Moorea|-17.53|-149.83;Tahiti|-17.65|-149.43;Cook Islands|-21.24|-159.78;Samoa|-13.76|-172.1;Vanuatu|-15.4|166.96`;

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

// Towns and cities by plain name ("malaga"), most populous first.
const WORLD_POS = new Map<string, { country: string; pos: [number, number] }[]>();
for (const p of WORLD_PLACES) {
  const key = plain(p.name);
  const list = WORLD_POS.get(key) ?? [];
  list.push({ country: plain(p.country), pos: [p.lat, p.lon] });
  WORLD_POS.set(key, list);
}
const CAPITAL_POS = new Map(Object.entries(CAPITALS).map(([c, pos]) => [plain(c), pos]));

/** Latitude and longitude for a place, or null if we don't know roughly where it is. */
export function positionOf(p: Place): [number, number] | null {
  const n = plain(p.name);
  const country = plain(countryOf(p));
  const known = PLACE_POS.get(p.name.trim().toLowerCase()) ?? PLACE_POS.get(p.name.trim().toLowerCase().replace(/^the /, ''));
  if (known) return known;
  const towns = WORLD_POS.get(n) ?? WORLD_POS.get(n.replace(/^the /, ''));
  const town = towns?.find((t) => !country || t.country === country);
  if (town) return town.pos;
  return COUNTRY_POS.get(country) ?? CAPITAL_POS.get(country) ?? null;
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
