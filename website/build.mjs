// Builds the website into _site/ for GitHub Pages.
// The app's name comes from src/constants/brand.json (the one place it lives), and the public
// Supabase address and publishable key from src/lib/config.ts (public by design; never the secret key).
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const brand = JSON.parse(readFileSync('src/constants/brand.json', 'utf8'));
const config = readFileSync('src/lib/config.ts', 'utf8');
const url = config.match(/'(https:\/\/[a-z0-9]+\.supabase\.co)'/)?.[1];
const key = config.match(/'(sb_publishable_[A-Za-z0-9_-]+)'/)?.[1];
if (!brand.appName || !url || !key) throw new Error('Missing the app name, Supabase address or publishable key');

const html = readFileSync('website/index.html', 'utf8')
  .replaceAll('{{app}}', brand.appName)
  .replaceAll('{{supabaseUrl}}', url)
  .replaceAll('{{supabaseKey}}', key);
if (html.includes('{{')) throw new Error('A {{placeholder}} was left in the page');

rmSync('_site', { recursive: true, force: true });
mkdirSync('_site');
writeFileSync('_site/index.html', html);
cpSync('website/img', '_site/img', { recursive: true });
cpSync('website/favicon.png', '_site/favicon.png');
writeFileSync('_site/.nojekyll', '');
console.log(`Built _site for ${brand.appName}`);
