/**
 * A font size (for the Fraunces serif) that keeps the longest word of a name on one line,
 * so a long single word like "Marrakech" shrinks a little instead of breaking ("Marrakec / h").
 * Fraunces is wide, and wider still on iPhone, so this allows about 0.74 of the font size per letter.
 */
export function fitWordSize(name: string, room: number, max: number, min = 14): number {
  const longest = Math.max(1, ...name.split(/\s+/).map((w) => w.length));
  return Math.max(min, Math.min(max, Math.floor(room / (longest * 0.74))));
}

/**
 * Safety net for a place name in big type: one line per word (at most 3), and on iPhone the text
 * shrinks a little rather than breaking a word in two. Spread onto <Text>: {...fitLines(name)}.
 */
export function fitLines(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean).length;
  return { numberOfLines: Math.max(1, Math.min(3, words)), adjustsFontSizeToFit: true, minimumFontScale: 0.7 } as const;
}
