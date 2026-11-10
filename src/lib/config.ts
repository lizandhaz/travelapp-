/**
 * Supabase connection settings.
 *
 * These two values are PUBLIC by design: every copy of the app contains them,
 * and anyone could read them out of an installed app. The data is protected by
 * the database rules (Row Level Security) in supabase/migrations, not by hiding
 * these. NEVER put the Supabase *secret* / service_role key anywhere in this app.
 *
 * You can override them with EXPO_PUBLIC_SUPABASE_URL and
 * EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in a local .env file.
 */
export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://adeichqdunpxuxumxthz.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_QNW-h8skKmwjlq3RUEWFsQ_c1_MUwwi';
