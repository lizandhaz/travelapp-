import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import type { PlaceResult } from '@/lib/match';
import type { PlaceDetail } from '@/lib/placeDetails';
import { formatScore, scoreWord } from '@/lib/score';
import { Avatar } from './Avatar';
import { PhotoBadge, Row } from './cards';
import { PhotoTile } from './Photo';
import { ScoreStamp } from './ScoreStamp';
import { Text } from './Text';
import { Card, SectionHeader } from './ui';

const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CROWD_WORDS = ['', 'quiet', 'busy', 'very busy'];

/** Soft tint of a theme colour (e.g. mint at 35%). */
const tint = (hex: string, alpha: number) =>
  hex +
  Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');

function Pill({ text, bg, color = colors.ink, style }: { text: string; bg: string; color?: string; style?: object }) {
  return (
    <View style={[{ alignSelf: 'flex-start', backgroundColor: bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }, style]}>
      <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 10, lineHeight: 13, letterSpacing: 1.2, textTransform: 'uppercase', color }}>{text}</Text>
    </View>
  );
}

/** Best time, typical stay price and who it's good for. */
export function PlaceFacts({ detail }: { detail: PlaceDetail }) {
  const facts = [
    ['Best time', detail.bestTime],
    ['Stays', detail.staysFrom],
  ].filter((f): f is [string, string] => !!f[1]);
  return (
    <View style={{ paddingHorizontal: GUTTER, gap: 10 }}>
      {facts.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {facts.map(([label, value]) => (
            <Card key={label} style={{ flex: 1, padding: 12, borderRadius: radius.md }}>
              <Text variant="label">{label}</Text>
              <Text variant="small" style={{ color: colors.ink, marginTop: 2 }}>
                {value}
              </Text>
            </Card>
          ))}
        </View>
      )}
      {detail.goodFor.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <Text variant="label">Good for</Text>
          {detail.goodFor.map((g) => (
            <View key={g} style={{ backgroundColor: tint(colors.mint, 0.35), borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
              <Text variant="small" style={{ color: colors.ink }}>
                {g}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/** Average temperature for each month as bars, best months in teal, and how busy it gets. */
export function BestTimeChart({ detail }: { detail: PlaceDetail }) {
  const temps = detail.temps;
  if (!temps) return null;
  const lo = Math.min(...temps);
  const hi = Math.max(...temps);
  const barHeight = (t: number) => 10 + ((t - lo) / Math.max(1, hi - lo)) * 62;
  const best = new Set(detail.bestMonths);
  const summary =
    `Average daytime highs: ${temps.map((t, i) => `${MONTH_NAMES[i]} ${t}°C`).join(', ')}.` +
    (best.size ? ` Best months: ${[...best].map((m) => MONTH_NAMES[m]).join(', ')}.` : '') +
    (detail.crowds ? ` Crowds: ${detail.crowds.map((c, i) => `${MONTH_NAMES[i]} ${CROWD_WORDS[c]}`).join(', ')}.` : '');
  return (
    <View style={{ marginTop: 28 }}>
      <SectionHeader>Best time to go</SectionHeader>
      <Card style={{ marginHorizontal: GUTTER, padding: 14 }}>
        <View accessible accessibilityRole="image" accessibilityLabel={summary}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 96 }}>
            {temps.map((t, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontFamily: best.has(i) ? fonts.sansSemiBold : fonts.sans, fontSize: 10, lineHeight: 13, color: best.has(i) ? colors.teal : colors.muted, marginBottom: 3 }}>
                  {t}°
                </Text>
                <View style={{ width: '100%', height: barHeight(t), borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: best.has(i) ? colors.teal : colors.sand }} />
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
            {MONTH_LETTERS.map((m, i) => (
              <Text key={i} style={{ flex: 1, textAlign: 'center', fontFamily: fonts.sansSemiBold, fontSize: 11, lineHeight: 14, color: best.has(i) ? colors.teal : colors.muted }}>
                {m}
              </Text>
            ))}
          </View>
          {detail.crowds && (
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
              {detail.crowds.map((c, i) => (
                <View key={i} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 2 }}>
                  {[1, 2, 3].map((d) => (
                    <View key={d} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: d <= c ? colors.terracotta : colors.line }} />
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 4, marginTop: 12 }}>
          {best.size > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: colors.teal }} />
              <Text variant="tiny">Best months</Text>
            </View>
          )}
          <Text variant="tiny">Bars: average daytime high, °C</Text>
          {detail.crowds && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                {[0, 1, 2].map((d) => (
                  <View key={d} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.terracotta }} />
                ))}
              </View>
              <Text variant="tiny">Crowds</Text>
            </View>
          )}
        </View>
      </Card>
    </View>
  );
}

/** Short "what friends said" rows (name, month, quote, score). */
export function SaidList({ items }: { items: PlaceDetail['said'] }) {
  return (
    <View style={{ paddingHorizontal: GUTTER, gap: 14 }}>
      {items.map((s) => (
        <View key={s.who + s.month} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <Avatar face={s.face} name={s.who} size={36} />
          <View style={{ flex: 1 }}>
            <Text variant="small" style={{ color: colors.ink }}>
              <Text variant="strong" style={{ fontSize: 14 }}>
                {s.who}
              </Text>
              <Text variant="small"> · {s.month}</Text>
            </Text>
            {!!s.quote && (
              <Text variant="small" style={{ color: colors.ink, marginTop: 2 }}>
                {s.quote}
              </Text>
            )}
          </View>
          {s.score != null && (
            <Text accessibilityLabel={`${formatScore(s.score)} out of 10`} style={{ fontFamily: fonts.display, fontSize: 20, color: colors.ink, fontVariant: ['tabular-nums'] }}>
              {formatScore(s.score)}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

/** Where to stay: photo cards with the type and your score out of 10. */
export function StayRow({ stays }: { stays: PlaceDetail['stays'] }) {
  return (
    <View style={{ marginTop: 28 }}>
      <SectionHeader>Where to stay</SectionHeader>
      <Row gap={12}>
        {stays.map((s) => {
          const w = s.featured ? 250 : 230;
          return (
            <View
              key={s.name}
              accessible
              accessibilityLabel={[s.name, s.type, s.sub, s.because, s.score != null ? `${formatScore(s.score)} out of 10` : null].filter(Boolean).join(', ')}
              style={{ width: w, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.card, borderWidth: s.featured ? 2 : 1, borderColor: s.featured ? colors.teal : colors.line }}
            >
              <PhotoTile photo={s.photo} shade={false} style={{ width: '100%', height: w * 0.72, borderRadius: 0 }}>
                <PhotoBadge text={s.type} style={{ position: 'absolute', top: 10, left: 10 }} />
                {s.featured && <PhotoBadge text="✦ We think you’d like" style={{ position: 'absolute', bottom: 10, left: 10 }} />}
              </PhotoTile>
              <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text variant="strong" numberOfLines={1}>
                    {s.name}
                  </Text>
                  {!!s.sub && (
                    <Text variant="tiny" style={{ marginTop: 2 }}>
                      {s.sub}
                    </Text>
                  )}
                  {!!s.because && (
                    <Text variant="tiny" style={{ color: colors.teal, marginTop: 6, fontSize: 12.5 }}>
                      {s.because}
                    </Text>
                  )}
                </View>
                {s.score != null && <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.teal, fontVariant: ['tabular-nums'] }}>{formatScore(s.score)}</Text>}
              </View>
            </View>
          );
        })}
      </Row>
    </View>
  );
}

/** Where to eat: a photo (or the first letter), price, what to order and your score out of 10. */
export function EatRow({ eats }: { eats: PlaceDetail['eats'] }) {
  return (
    <View style={{ marginTop: 28 }}>
      <SectionHeader>Where to eat</SectionHeader>
      <Row gap={12}>
        {eats.map((e) => (
          <View
            key={e.name}
            accessible
            accessibilityLabel={[e.name, e.price ? `price ${e.price}` : null, e.what, e.score != null ? `${formatScore(e.score)} out of 10` : null, e.from ? `from ${e.from}` : null].filter(Boolean).join(', ')}
            style={{ width: 200, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line }}
          >
            {e.photo ? (
              <PhotoTile photo={e.photo} shade={false} style={{ width: '100%', height: 144, borderRadius: 0 }} />
            ) : (
              <View style={{ height: 144, backgroundColor: tint(colors.peach, 0.4), alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: fonts.display, fontSize: 32, color: colors.terracotta }}>{e.name[0]}</Text>
              </View>
            )}
            <View style={{ padding: 12, flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text variant="strong" numberOfLines={1} style={{ flex: 1 }}>
                  {e.name}
                </Text>
                {!!e.price && <Text variant="tiny">{e.price}</Text>}
              </View>
              {!!e.what && (
                <Text variant="tiny" style={{ marginTop: 3 }}>
                  {e.what}
                </Text>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                {e.score != null && <Text style={{ fontFamily: fonts.display, fontSize: 17, color: colors.terracottaText, fontVariant: ['tabular-nums'] }}>{formatScore(e.score)}</Text>}
                {!!e.from && <Text variant="tiny">· {e.from}’s pick</Text>}
              </View>
            </View>
          </View>
        ))}
      </Row>
    </View>
  );
}

/** Things to do. A hidden gem gets the navy card. */
export function DoRow({ dos }: { dos: PlaceDetail['dos'] }) {
  return (
    <View style={{ marginTop: 28 }}>
      <SectionHeader>Things to do</SectionHeader>
      <Row gap={12}>
        {dos.map((d) => (
          <View
            key={d.name}
            accessible
            accessibilityLabel={[d.tag, d.name, d.what, d.from ? `${d.gem ? 'found by' : 'from'} ${d.from}` : null].filter(Boolean).join(', ')}
            style={{ width: 220, borderRadius: radius.lg, padding: 16, backgroundColor: d.gem ? colors.ink : colors.card, borderWidth: d.gem ? 0 : 1, borderColor: colors.line }}
          >
            <Pill text={d.tag} bg={d.gem ? colors.peach : tint(colors.peach, 0.4)} />
            <Text variant="subheading" style={{ marginTop: 10, color: d.gem ? colors.onDark : colors.ink }}>
              {d.name}
            </Text>
            {!!d.what && (
              <Text variant="small" style={{ marginTop: 4, flex: 1, color: d.gem ? colors.onDark : colors.muted }}>
                {d.what}
              </Text>
            )}
            {!!d.from && (
              <Text variant="tiny" style={{ marginTop: 12, color: d.gem ? colors.onDark : colors.muted, opacity: d.gem ? 0.8 : 1 }}>
                {d.gem ? 'found by' : 'from'} {d.from}
              </Text>
            )}
          </View>
        ))}
      </Row>
    </View>
  );
}

/** "More about …": culture and top tips, folded away until tapped. */
export function MoreAbout({ name, detail }: { name: string; detail: PlaceDetail }) {
  const [open, setOpen] = useState(false);
  if (!detail.culture.length && !detail.tips.length) return null;
  return (
    <View style={{ marginTop: 28 }}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`More about ${name}: culture and top tips`}
        style={{ marginHorizontal: GUTTER, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}
      >
        <View style={{ flex: 1 }}>
          <Text variant="subheading">More about {name}</Text>
          <Text variant="small">Culture and top tips</Text>
        </View>
        <Text style={{ fontFamily: fonts.sans, fontSize: 26, color: colors.terracotta, transform: [{ rotate: open ? '45deg' : '0deg' }] }}>+</Text>
      </Pressable>
      {open && (
        <View>
          {detail.culture.length > 0 && (
            <View style={{ marginTop: 22 }}>
              <SectionHeader>Culture</SectionHeader>
              <Row gap={12}>
                {detail.culture.map((c) => (
                  <View
                    key={c.name}
                    accessible
                    accessibilityLabel={[c.tag, c.when, c.name, c.what, c.from ? `from ${c.from}` : null].filter(Boolean).join(', ')}
                    style={{ width: 240, borderRadius: radius.lg, padding: 16, backgroundColor: tint(colors.sand, 0.6), borderWidth: 1, borderColor: colors.line }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <Pill text={c.tag} bg={colors.card} color={colors.teal} />
                      {!!c.when && <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 11, color: colors.terracottaText }}>{c.when}</Text>}
                    </View>
                    <Text variant="subheading" style={{ marginTop: 10 }}>
                      {c.name}
                    </Text>
                    {!!c.what && (
                      <Text variant="small" style={{ marginTop: 4, flex: 1 }}>
                        {c.what}
                      </Text>
                    )}
                    {!!c.from && (
                      <Text variant="tiny" style={{ marginTop: 12 }}>
                        from {c.from}
                      </Text>
                    )}
                  </View>
                ))}
              </Row>
            </View>
          )}
          {detail.tips.length > 0 && (
            <View style={{ marginTop: 22 }}>
              <SectionHeader>Top tips</SectionHeader>
              <View style={{ paddingHorizontal: GUTTER, gap: 10 }}>
                {detail.tips.map((t, i) => (
                  <View key={t.tip} style={{ flexDirection: 'row', gap: 12, borderRadius: radius.lg, padding: 16, backgroundColor: tint(colors.mint, 0.25), borderWidth: 1, borderColor: colors.line }}>
                    <Text style={{ fontFamily: fonts.display, fontSize: 20, lineHeight: 22, color: colors.teal }}>{i + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text variant="small" style={{ color: colors.ink }}>
                        {t.tip}
                      </Text>
                      {!!t.from && (
                        <Text variant="tiny" style={{ marginTop: 6 }}>
                          from {t.from}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

/**
 * Your score card on a place page: the score, a word, why, and a
 * "How we worked this out" breakdown (lib/match.ts).
 */
export function YourScore({ result, note }: { result: PlaceResult; note: string }) {
  const [open, setOpen] = useState(false);
  const b = result.breakdown;
  const from =
    b.baseFrom === 'nobody yet'
      ? 'No ratings yet, so we start from 7.0'
      : `Rated ${b.base.toFixed(1)} by ${b.baseFrom === 'everyone' ? 'everyone' : b.baseFrom === 'friends' ? `${b.friendsCount} ${b.friendsCount === 1 ? 'friend' : 'friends'}` : `everyone and ${b.friendsCount} ${b.friendsCount === 1 ? 'friend' : 'friends'}`}`;
  return (
    <Card style={{ marginHorizontal: GUTTER, marginTop: -30, padding: 14, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <ScoreStamp score={result.score} size="md" label={result.yours != null ? 'Your rating' : 'Your score'} />
        <View style={{ flex: 1 }}>
          <Text variant="subheading">
            {result.yours != null ? 'Your rating' : 'Your score'} · <Text variant="subheading" style={{ fontFamily: fonts.displayItalic }}>{scoreWord(result.score)}</Text>
          </Text>
          <Text variant="small">{result.yours != null ? 'You’ve been. This is the score you gave it.' : 'Worked out for you'}</Text>
        </View>
      </View>
      {result.reasons.filter((r) => !r.startsWith('You gave')).length > 0 && (
        <View style={{ gap: 4 }}>
          {result.reasons
            .filter((r) => !r.startsWith('You gave'))
            .map((r) => (
              <Text key={r} variant="small" style={{ color: colors.ink }}>
                ✦ {r}
              </Text>
            ))}
        </View>
      )}
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }} hitSlop={6}>
        <Text variant="link">{open ? 'Hide how we worked this out' : 'How we worked this out'}</Text>
      </Pressable>
      {open && (
        <View style={{ gap: 10 }}>
          <Text variant="small" style={{ color: colors.ink }}>
            {from}. {result.yours == null && b.tasteNudge !== 0 ? `Your taste moves it ${b.tasteNudge > 0 ? 'up' : 'down'} ${Math.abs(b.tasteNudge).toFixed(1)}.` : ''}
          </Text>
          {b.parts.map((p) => (
            <View key={p.label} style={{ gap: 4 }}>
              <Text variant="tiny" style={{ color: colors.ink }}>
                {p.label}
              </Text>
              <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.line, overflow: 'hidden' }}>
                <View style={{ width: `${Math.round(p.value * 100)}%`, height: 5, backgroundColor: colors.teal }} />
              </View>
            </View>
          ))}
          <Text variant="tiny">{note}</Text>
        </View>
      )}
    </Card>
  );
}
