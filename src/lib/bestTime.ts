/**
 * "Best time to go" in plain words (owner, Nov 2026: "a user should understand the best time to go within 2 seconds").
 * One verdict per month, so a month is never both "Best" and "Busy" at once:
 *   best: one of the place's best months, and not very busy
 *   good: a best month that's very busy (great weather, lots of people)
 *   off:  outside the best months
 * If every best month is very busy, those count as best. Pure functions (tested in tests/bestTime.test.mjs).
 */

export type Verdict = 'best' | 'good' | 'off';
export type BestTimeData = { temps: number[] | null; bestMonths: number[]; crowds: number[] | null };

export const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const CROWD_WORD = ['', 'quiet', 'busy', 'very busy'];
export const VERDICT_LABEL: Record<Verdict, string> = { best: 'Best', good: 'Good', off: 'Not ideal' };

export function monthVerdicts({ bestMonths, crowds }: BestTimeData): Verdict[] {
  const best = new Set(bestMonths);
  const crowd = (m: number) => crowds?.[m] ?? 2;
  const anyQuieter = bestMonths.some((m) => crowd(m) < 3);
  return Array.from({ length: 12 }, (_, m) => (!best.has(m) ? 'off' : crowd(m) < 3 || !anyQuieter ? 'best' : 'good'));
}

/** Months as runs, going round the year (Nov, Dec, Jan → one run): [[10, 0]]. */
export function monthRuns(months: number[]): [number, number][] {
  const set = new Set(months);
  if (set.size === 12) return [[0, 11]];
  const runs: [number, number][] = [];
  // Start just after a month that isn't in the set, so a run over New Year stays whole.
  const start = [...Array(12).keys()].find((m) => !set.has(m))!;
  let run: [number, number] | null = null;
  for (let i = 1; i <= 12; i++) {
    const m = (start + i) % 12;
    if (set.has(m)) {
      if (run) run[1] = m;
      else run = [m, m];
    } else if (run) {
      runs.push(run);
      run = null;
    }
  }
  if (run) runs.push(run);
  return runs;
}

/**
 * "May to December", "November to March", "May, June and September" (short: "May–Dec", "May, Jun, Sep"). Runs of three
 * or more months read as a range; shorter ones as the months themselves. In calendar order.
 */
export function rangeText(months: number[], short = false): string {
  const names = short ? MONTHS_SHORT : MONTHS_LONG;
  if (new Set(months).size === 12) return short ? 'All year' : 'all year round';
  const runs = [...monthRuns(months)].sort((x, y) => x[0] - y[0]);
  const parts = runs.flatMap(([a, b]) => {
    const len = ((b - a + 12) % 12) + 1;
    if (len >= 3) return [short ? `${names[a]}–${names[b]}` : `${names[a]} to ${names[b]}`];
    return Array.from({ length: len }, (_, i) => names[(a + i) % 12]);
  });
  if (short) return parts.join(', ');
  return parts.length <= 1 ? (parts[0] ?? '') : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

const listMonths = (months: number[]) => {
  const names = months.map((m) => MONTHS_LONG[m]);
  return names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
};

function tempRange(temps: number[] | null, months: number[]): string | null {
  if (!temps || !months.length) return null;
  const t = months.map((m) => temps[m]);
  const lo = Math.min(...t);
  const hi = Math.max(...t);
  // Below freezing reads as words ("−1 to 4°"), so a minus sign never sits next to a dash.
  return lo === hi ? `${lo}°` : lo < 0 ? `${String(lo).replace('-', '−')} to ${hi}°` : `${lo}–${hi}°`;
}

/** Months that are the place's best (verdict best, or good when there's no best). */
export function bestOf(data: BestTimeData): number[] {
  const v = monthVerdicts(data);
  const best = v.flatMap((x, m) => (x === 'best' ? [m] : []));
  return best.length ? best : v.flatMap((x, m) => (x === 'good' ? [m] : []));
}

/**
 * One short line: when, how warm, and when it's quietest within the best months.
 * "Best May to December · 24–28° by day · quietest in June and July"
 */
export function bestSummary(data: BestTimeData): string {
  const best = bestOf(data);
  if (!best.length) return '';
  const parts = [`Best ${rangeText(best)}`];
  const t = tempRange(data.temps, best);
  if (t) parts.push(`${t} by day`);
  const quiet = best.filter((m) => (data.crowds?.[m] ?? 2) === 1);
  if (quiet.length && quiet.length < best.length) parts.push(`quietest in ${listMonths(quiet.slice(0, 2))}`);
  return parts.join(' · ');
}

/** How busy a group of months mostly is: "quiet", "busy", "very busy" or "busy to very busy". */
function crowdText(crowds: number[] | null, months: number[]): string | null {
  if (!crowds || !months.length) return null;
  const c = months.map((m) => crowds[m]);
  const lo = Math.min(...c);
  const hi = Math.max(...c);
  return lo === hi ? CROWD_WORD[lo] : `${CROWD_WORD[lo]} to ${CROWD_WORD[hi]}`;
}

export type Season = { verdict: Verdict; title: string; months: string; temps: string | null; crowds: string | null; note: string | null };

/** The year as two or three seasons: Best time / Also good / Not ideal, each with months, temperatures and crowds. */
export function seasons(data: BestTimeData): Season[] {
  const v = monthVerdicts(data);
  const groups: Verdict[] = ['best', 'good', 'off'];
  const avg = (ms: number[]) => (data.temps && ms.length ? ms.reduce((s, m) => s + data.temps![m], 0) / ms.length : null);
  const bestAvg = avg(v.flatMap((x, m) => (x !== 'off' ? [m] : [])));
  return groups.flatMap((g) => {
    const ms = v.flatMap((x, m) => (x === g ? [m] : []));
    if (!ms.length) return [];
    let note: string | null = null;
    if (g === 'good') note = 'Great weather, but very busy';
    if (g === 'off') {
      const a = avg(ms);
      note = a != null && bestAvg != null && bestAvg - a >= 3 ? 'Cooler' : a != null && bestAvg != null && a - bestAvg >= 3 ? 'Warmer' : 'Outside the best season';
    }
    return [{ verdict: g, title: g === 'best' ? 'Best time' : g === 'good' ? 'Also good' : 'Not ideal', months: rangeText(ms, true), temps: tempRange(data.temps, ms), crowds: crowdText(data.crowds, ms), note }];
  });
}

/** One plain sentence for a month: "June · 24° · quiet · one of the best months". */
export function monthLine(data: BestTimeData, m: number): string {
  const v = monthVerdicts(data)[m];
  const bits = [MONTHS_LONG[m]];
  if (data.temps) bits.push(`${String(data.temps[m]).replace('-', '−')}°`);
  // A "good" month is always very busy, so its own words say so once.
  if (data.crowds && v !== 'good') bits.push(CROWD_WORD[data.crowds[m]]);
  bits.push(v === 'best' ? 'one of the best months' : v === 'good' ? 'great weather, but very busy' : 'not the best time');
  return bits.join(' · ');
}
