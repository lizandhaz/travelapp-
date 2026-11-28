/** Month helpers. Months are "YYYY-MM" strings. */

const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function currentMonth(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function addMonths(ym: string, n: number): string {
  const [y, m] = ym.split('-').map(Number);
  const total = y * 12 + (m - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

export function makeMonth(year: number, monthIndex0: number) {
  return `${year}-${String(monthIndex0 + 1).padStart(2, '0')}`;
}

export const yearOf = (ym: string) => Number(ym.slice(0, 4));
export const monthIndexOf = (ym: string) => Number(ym.slice(5, 7)) - 1;

/** "September 2026" */
export function longMonth(ym: string) {
  return `${LONG[monthIndexOf(ym)]} ${yearOf(ym)}`;
}

export const MONTH_NAMES_SHORT = SHORT;

/** "Jul 2025" */
export function monthYear(ym: string) {
  return `${SHORT[monthIndexOf(ym)]} ${yearOf(ym)}`;
}

// ---------------------------------------------------------------------------
// Days ("YYYY-MM-DD"), for a trip's optional exact dates (owner, Nov 2026)
// ---------------------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, '0');

/** Today on this phone, "YYYY-MM-DD". */
export function today(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const makeDay = (ym: string, day: number) => `${ym}-${pad(day)}`;
export const monthOfDay = (d: string) => d.slice(0, 7);
export const dayOf = (d: string) => Number(d.slice(8, 10));

/** How many days in a month ("2024-02" → 29). */
export function daysInMonth(ym: string): number {
  return new Date(Date.UTC(yearOf(ym), monthIndexOf(ym) + 1, 0)).getUTCDate();
}

/** Which column the 1st falls in, with weeks starting on Monday (0 = Monday … 6 = Sunday). */
export function firstWeekday(ym: string): number {
  return (new Date(Date.UTC(yearOf(ym), monthIndexOf(ym), 1)).getUTCDay() + 6) % 7;
}

/** Nights between arriving and leaving ("2026-08-10" → "2026-08-17" = 7). */
export function nightsBetween(start: string, end: string): number {
  const t = (d: string) => Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)));
  return Math.round((t(end) - t(start)) / 86_400_000);
}

/** "10–17 Aug 2026", "28 Aug – 3 Sep 2026", "28 Dec 2025 – 3 Jan 2026". */
export function dayRange(start: string, end: string): string {
  const [sy, sm, sd] = [start.slice(0, 4), monthIndexOf(start), dayOf(start)];
  const [ey, em, ed] = [end.slice(0, 4), monthIndexOf(end), dayOf(end)];
  if (sy === ey && sm === em) return `${sd}–${ed} ${SHORT[em]} ${ey}`;
  if (sy === ey) return `${sd} ${SHORT[sm]} – ${ed} ${SHORT[em]} ${ey}`;
  return `${sd} ${SHORT[sm]} ${sy} – ${ed} ${SHORT[em]} ${ey}`;
}

export const MONTH_NAMES_LONG = LONG;
