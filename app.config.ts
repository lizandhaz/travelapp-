import type { ConfigContext, ExpoConfig } from 'expo/config';

// Plain JSON so Expo's config loader can read it (it can't load app TypeScript files).
import brand from './src/constants/brand.json';

const APP_NAME = brand.appName;

// app.json holds the settings; this file only fills in the app's name from
// src/constants/brand.ts so it's never typed twice. Don't change `slug`,
// `owner` or `version`: they link the app to Expo (and the QR code).
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  name: APP_NAME,
  plugins: (config.plugins ?? []).map((plugin) =>
    Array.isArray(plugin) && plugin[0] === 'expo-image-picker'
      ? [plugin[0], { ...plugin[1], photosPermission: `${APP_NAME} uses your photos so you can add them to trips.` }]
      : plugin,
  ),
});
