export const MIN_AGE_TO_JOIN = 13;
export const MIN_AGE_FOR_PUBLIC_PROFILE = 18;

/**
 * Age in whole years for a "YYYY-MM-DD" date of birth, or null if it isn't a real date.
 * The database applies the same rules again (supabase/migrations), so this is the
 * friendly first check, not the only one.
 */
export function ageInYears(dob: string, today: Date = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
  if (y < 1900) return null;

  let age = today.getUTCFullYear() - y;
  const todayMD = (today.getUTCMonth() + 1) * 100 + today.getUTCDate();
  if (todayMD < mo * 100 + d) age--;
  return age;
}
