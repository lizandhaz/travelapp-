import { plain } from './knownPlaces';

/**
 * A flag and continent for every country the app knows (worldPlaces' WORLD_COUNTRIES, plus "United Kingdom"), for the
 * "countries you've been to" sheet on You. Format: "name|code|continent;…": the code is ISO 3166 (two letters), or
 * ENG / SCT / WLS for England, Scotland and Wales, which have their own flags. Continents: EU AS AF NA SA OC AN.
 */
const TABLE =
  "Afghanistan|AF|AS;Albania|AL|EU;Algeria|DZ|AF;American Samoa|AS|OC;Andorra|AD|EU;Angola|AO|AF;Anguilla|AI|NA;Antigua and Barbuda|AG|NA;Argentina|AR|SA;Armenia|AM|AS;Aruba|AW|NA;Australia|AU|OC;Austria|AT|EU;Azerbaijan|AZ|AS;Bahamas|BS|NA;Bahrain|BH|AS;Bangladesh|BD|AS;Barbados|BB|NA;Belarus|BY|EU;Belgium|BE|EU;Belize|BZ|NA;Benin|BJ|AF;Bermuda|BM|NA;Bhutan|BT|AS;Bolivia|BO|SA;Bosnia and Herzegovina|BA|EU;Botswana|BW|AF;Brazil|BR|SA;British Virgin Islands|VG|NA;Brunei|BN|AS;Bulgaria|BG|EU;Burkina Faso|BF|AF;Burundi|BI|AF;Cambodia|KH|AS;Cameroon|CM|AF;Canada|CA|NA;Cape Verde|CV|AF;Caribbean Netherlands|BQ|NA;Cayman Islands|KY|NA;Central African Republic|CF|AF;Chad|TD|AF;Chile|CL|SA;China|CN|AS;Christmas Island|CX|OC;Cocos (Keeling) Islands|CC|OC;Colombia|CO|SA;Comoros|KM|AF;Congo|CG|AF;Cook Islands|CK|OC;Costa Rica|CR|NA;Croatia|HR|EU;Cuba|CU|NA;Curaçao|CW|NA;Cyprus|CY|EU;Czechia|CZ|EU;Côte d’Ivoire|CI|AF;DR Congo|CD|AF;Denmark|DK|EU;Djibouti|DJ|AF;Dominica|DM|NA;Dominican Republic|DO|NA;Ecuador|EC|SA;Egypt|EG|AF;El Salvador|SV|NA;England|ENG|EU;Equatorial Guinea|GQ|AF;Eritrea|ER|AF;Estonia|EE|EU;Eswatini|SZ|AF;Ethiopia|ET|AF;Falkland Islands|FK|SA;Faroe Islands|FO|EU;Fiji|FJ|OC;Finland|FI|EU;France|FR|EU;French Guiana|GF|SA;French Polynesia|PF|OC;French Southern Territories|TF|AN;Gabon|GA|AF;Gambia|GM|AF;Georgia|GE|AS;Germany|DE|EU;Ghana|GH|AF;Gibraltar|GI|EU;Greece|GR|EU;Greenland|GL|NA;Grenada|GD|NA;Guadeloupe|GP|NA;Guam|GU|OC;Guatemala|GT|NA;Guernsey|GG|EU;Guinea|GN|AF;Guinea-Bissau|GW|AF;Guyana|GY|SA;Haiti|HT|NA;Honduras|HN|NA;Hong Kong|HK|AS;Hungary|HU|EU;Iceland|IS|EU;India|IN|AS;Indonesia|ID|AS;Iran|IR|AS;Iraq|IQ|AS;Ireland|IE|EU;Isle of Man|IM|EU;Israel|IL|AS;Italy|IT|EU;Jamaica|JM|NA;Japan|JP|AS;Jersey|JE|EU;Jordan|JO|AS;Kazakhstan|KZ|AS;Kenya|KE|AF;Kiribati|KI|OC;Kosovo|XK|EU;Kuwait|KW|AS;Kyrgyzstan|KG|AS;Laos|LA|AS;Latvia|LV|EU;Lebanon|LB|AS;Lesotho|LS|AF;Liberia|LR|AF;Libya|LY|AF;Liechtenstein|LI|EU;Lithuania|LT|EU;Luxembourg|LU|EU;Macao|MO|AS;Madagascar|MG|AF;Malawi|MW|AF;Malaysia|MY|AS;Maldives|MV|AS;Mali|ML|AF;Malta|MT|EU;Marshall Islands|MH|OC;Martinique|MQ|NA;Mauritania|MR|AF;Mauritius|MU|AF;Mayotte|YT|AF;Mexico|MX|NA;Micronesia|FM|OC;Moldova|MD|EU;Monaco|MC|EU;Mongolia|MN|AS;Montenegro|ME|EU;Montserrat|MS|NA;Morocco|MA|AF;Mozambique|MZ|AF;Myanmar|MM|AS;Namibia|NA|AF;Nauru|NR|OC;Nepal|NP|AS;Netherlands|NL|EU;New Caledonia|NC|OC;New Zealand|NZ|OC;Nicaragua|NI|NA;Niger|NE|AF;Nigeria|NG|AF;Niue|NU|OC;Norfolk Island|NF|OC;North Korea|KP|AS;North Macedonia|MK|EU;Northern Ireland|GB|EU;Northern Mariana Islands|MP|OC;Norway|NO|EU;Oman|OM|AS;Pakistan|PK|AS;Palau|PW|OC;Palestine|PS|AS;Panama|PA|NA;Papua New Guinea|PG|OC;Paraguay|PY|SA;Peru|PE|SA;Philippines|PH|AS;Pitcairn Islands|PN|OC;Poland|PL|EU;Portugal|PT|EU;Puerto Rico|PR|NA;Qatar|QA|AS;Romania|RO|EU;Russia|RU|EU;Rwanda|RW|AF;Réunion|RE|AF;Saint Barthélemy|BL|NA;Saint Martin|MF|NA;Samoa|WS|OC;San Marino|SM|EU;Saudi Arabia|SA|AS;Scotland|SCT|EU;Senegal|SN|AF;Serbia|RS|EU;Seychelles|SC|AF;Sierra Leone|SL|AF;Singapore|SG|AS;Sint Maarten|SX|NA;Slovakia|SK|EU;Slovenia|SI|EU;Solomon Islands|SB|OC;Somalia|SO|AF;South Africa|ZA|AF;South Georgia and South Sandwich Islands|GS|AN;South Korea|KR|AS;South Sudan|SS|AF;Spain|ES|EU;Sri Lanka|LK|AS;St Helena|SH|AF;St Kitts and Nevis|KN|NA;St Lucia|LC|NA;St Pierre and Miquelon|PM|NA;St Vincent and the Grenadines|VC|NA;Sudan|SD|AF;Suriname|SR|SA;Svalbard and Jan Mayen|SJ|EU;Sweden|SE|EU;Switzerland|CH|EU;Syria|SY|AS;São Tomé and Príncipe|ST|AF;Taiwan|TW|AS;Tajikistan|TJ|AS;Tanzania|TZ|AF;Thailand|TH|AS;Timor-Leste|TL|AS;Togo|TG|AF;Tonga|TO|OC;Trinidad and Tobago|TT|NA;Tunisia|TN|AF;Turkey|TR|EU;Turkmenistan|TM|AS;Turks and Caicos|TC|NA;Tuvalu|TV|OC;US Virgin Islands|VI|NA;USA|US|NA;Uganda|UG|AF;Ukraine|UA|EU;United Arab Emirates|AE|AS;Uruguay|UY|SA;Uzbekistan|UZ|AS;Vanuatu|VU|OC;Vatican City|VA|EU;Venezuela|VE|SA;Vietnam|VN|AS;Wales|WLS|EU;Wallis and Futuna|WF|OC;Western Sahara|EH|AF;Yemen|YE|AS;Zambia|ZM|AF;Zimbabwe|ZW|AF;Åland Islands|AX|EU;United Kingdom|GB|EU";

export type Continent = 'Europe' | 'Asia' | 'Africa' | 'North America' | 'South America' | 'Oceania' | 'Antarctica' | 'Elsewhere';
const CONTINENTS: Record<string, Continent> = { EU: 'Europe', AS: 'Asia', AF: 'Africa', NA: 'North America', SA: 'South America', OC: 'Oceania', AN: 'Antarctica' };

export type CountryInfo = { name: string; flag: string; continent: Continent };

/** Other ways people write a country (matched ignoring case and accents). */
const ALIASES: Record<string, string> = {
  uk: 'United Kingdom', 'great britain': 'United Kingdom', britain: 'United Kingdom', gb: 'United Kingdom',
  us: 'USA', 'u.s.': 'USA', 'u.s.a.': 'USA', 'united states': 'USA', 'united states of america': 'USA', america: 'USA',
  uae: 'United Arab Emirates', 'czech republic': 'Czechia', holland: 'Netherlands', 'the netherlands': 'Netherlands',
  'republic of ireland': 'Ireland', eire: 'Ireland', 'ivory coast': 'Côte d’Ivoire', "cote d'ivoire": 'Côte d’Ivoire',
  'south korea': 'South Korea', korea: 'South Korea', burma: 'Myanmar', swaziland: 'Eswatini', macau: 'Macao',
  vatican: 'Vatican City', bosnia: 'Bosnia and Herzegovina', macedonia: 'North Macedonia', 'cabo verde': 'Cape Verde',
  'turks and caicos islands': 'Turks and Caicos', 'east timor': 'Timor-Leste', 'the bahamas': 'Bahamas', 'the gambia': 'Gambia',
  'st. lucia': 'St Lucia', 'saint lucia': 'St Lucia', 'saint kitts and nevis': 'St Kitts and Nevis', turkiye: 'Turkey',
  'democratic republic of the congo': 'DR Congo', 'republic of the congo': 'Congo', 'french polynesia (tahiti)': 'French Polynesia', tahiti: 'French Polynesia',
};

/** A flag from a code: two regional-indicator letters, or the black-flag tag sequence for England, Scotland, Wales. */
function flagFor(code: string): string {
  const tags: Record<string, string> = { ENG: 'gbeng', SCT: 'gbsct', WLS: 'gbwls' };
  if (tags[code]) return '\u{1F3F4}' + [...tags[code]].map((c) => String.fromCodePoint(0xe0000 + c.charCodeAt(0))).join('') + '\u{E007F}';
  return [...code].map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join('');
}

const BY_NAME = new Map<string, CountryInfo>();
for (const row of TABLE.split(';')) {
  const [name, code, cont] = row.split('|');
  BY_NAME.set(plain(name), { name, flag: flagFor(code), continent: CONTINENTS[cont] });
}

/** The country's flag, tidy name and continent; unknown names keep what was written, with a globe. */
export function countryInfo(country: string): CountryInfo {
  const key = plain(country).replace(/^the /, '');
  const known = BY_NAME.get(key) ?? BY_NAME.get(plain(ALIASES[key] ?? '')) ?? BY_NAME.get(plain(country));
  return known ?? { name: country.trim(), flag: '\u{1F30D}', continent: 'Elsewhere' };
}
