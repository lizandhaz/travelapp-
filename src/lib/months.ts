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

/** "Sep", or "Sep 2025" when it's not this year. */
export function shortMonth(ym: string, now: Date = new Date()) {
  const label = SHORT[monthIndexOf(ym)];
  return yearOf(ym) === now.getFullYear() ? label : `${label} ${yearOf(ym)}`;
}

export const MONTH_NAMES_SHORT = SHORT;

/** "Jul 2025" */
export function monthYear(ym: string) {
  return `${SHORT[monthIndexOf(ym)]} ${yearOf(ym)}`;
}
