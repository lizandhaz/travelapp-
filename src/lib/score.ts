/** Scores are out of 10 with one decimal place (8.8). */

export const MIN_SCORE = 1;
export const MAX_SCORE = 10;

/** "8.8", "9.0" */
export function formatScore(n: number) {
  return (Math.round(n * 10) / 10).toFixed(1);
}

/** Round to one decimal place and keep within 1.0–10.0. */
export function clampScore(n: number) {
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, Math.round(n * 10) / 10));
}

/** A word for a score, as in the prototype: 8.8 → "Loved it". */
const WORDS = ['', 'Never again', 'Poor', 'Meh', 'Not for me', 'Fine', 'Good', 'Lovely', 'Loved it', 'Wonderful', 'Perfect'];
export function scoreWord(n: number) {
  return WORDS[Math.min(10, Math.max(1, Math.floor(n)))];
}
