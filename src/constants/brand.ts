import brand from './brand.json';

/**
 * The app's name. It's a placeholder for now.
 * To rename the app, change "appName" in src/constants/brand.json: that's the
 * only place. Code uses APP_NAME, and app.config.ts reads the same file so the
 * name under the app icon follows it. Never type the name anywhere else.
 */
export const APP_NAME: string = brand.appName;
