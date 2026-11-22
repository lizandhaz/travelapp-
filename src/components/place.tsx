import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Dimensions, Modal, Platform, Pressable, ScrollView, View } from 'react-native';

import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import type { PlaceResult } from '@/lib/match';
import { placeDetails, type PlaceDetail } from '@/lib/placeDetails';
import { placeCentres, placeMaps } from '@/lib/placeMaps';
import { useTaste } from '@/lib/taste';
import { formatScore, scoreWord } from '@/lib/score';
import { Avatar } from './Avatar';
import { PhotoBadge, Row } from './cards';
import { PhotoTile } from './Photo';
import { ScoreStamp } from './ScoreStamp';
import { Text } from './Text';
import { Card, Input, SectionHeader, Segmented } from './ui';
import { AreaMap } from './AreaMap';
import { ZoomMap } from './ZoomMap';
import { BookmarkIcon } from './Icons';

const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CROWD_WORDS = ['', 'quiet', 'busy', 'very busy'];

/** Soft tint of a theme colour (e.g. sage at 35%). */
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
          {facts.map(([label, value], i) => (
            // Plain text, no boxes (owner, Nov 2026); a thin line between the two.
            <View key={label} style={{ flex: 1, paddingVertical: 4, paddingLeft: i ? 12 : 0, borderLeftWidth: i ? 1 : 0, borderLeftColor: colors.line }}>
              <Text variant="label">{label}</Text>
              <Text variant="small" style={{ color: colors.ink, marginTop: 2 }}>
                {value}
              </Text>
            </View>
          ))}
        </View>
      )}
      {detail.goodFor.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <Text variant="label">Good for</Text>
          {detail.goodFor.map((g) => (
            <View key={g} style={{ backgroundColor: tint(colors.sage, 0.35), borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
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

/** Average temperature for each month as bars, best months in olive, the rest misty sky, and how busy it gets. */
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
                <Text style={{ fontFamily: best.has(i) ? fonts.sansSemiBold : fonts.sans, fontSize: 10, lineHeight: 13, color: best.has(i) ? colors.olive : colors.muted, marginBottom: 3 }}>
                  {t}°
                </Text>
                <View style={{ width: '100%', height: barHeight(t), borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: best.has(i) ? colors.olive : colors.sky }} />
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
            {MONTH_LETTERS.map((m, i) => (
              <Text key={i} style={{ flex: 1, textAlign: 'center', fontFamily: fonts.sansSemiBold, fontSize: 11, lineHeight: 14, color: best.has(i) ? colors.olive : colors.muted }}>
                {m}
              </Text>
            ))}
          </View>
          {detail.crowds && (
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
              {detail.crowds.map((c, i) => (
                <View key={i} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 2 }}>
                  {[1, 2, 3].map((d) => (
                    <View key={d} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: d <= c ? colors.accent : colors.line }} />
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 4, marginTop: 12 }}>
          {best.size > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: colors.olive }} />
              <Text variant="tiny">Best months</Text>
            </View>
          )}
          <Text variant="tiny">Bars: average daytime high, °C</Text>
          {detail.crowds && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                {[0, 1, 2].map((d) => (
                  <View key={d} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent }} />
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
export function StayRow({ stays, at }: { stays: PlaceDetail['stays']; at?: SpotPlace }) {
  return (
    <View style={{ marginTop: 28 }}>
      <SectionHeader>Where to stay</SectionHeader>
      <Row gap={12}>
        {stays.map((s) => {
          const w = s.featured ? 250 : 230;
          return (
            <WithSave key={s.name} at={at} name={s.name} kind="stay">
            <View
              accessible
              accessibilityLabel={[s.name, s.type, s.sub, s.because, s.score != null ? `${formatScore(s.score)} out of 10` : null].filter(Boolean).join(', ')}
              style={{ width: w, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.card, borderWidth: s.featured ? 2 : 1, borderColor: s.featured ? colors.olive : colors.line }}
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
                    <Text variant="tiny" style={{ color: colors.olive, marginTop: 6, fontSize: 12.5 }}>
                      {s.because}
                    </Text>
                  )}
                </View>
                {s.score != null && <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.olive, fontVariant: ['tabular-nums'] }}>{formatScore(s.score)}</Text>}
              </View>
            </View>
            </WithSave>
          );
        })}
      </Row>
    </View>
  );
}

/** The place a hotel, restaurant or thing to do is in, so it can be saved to a board under that place. */
export type SpotPlace = { name: string; country: string; slug: string };

/** A card with a small bookmark in its corner: save this spot to a board (under its place). */
function WithSave({ at, name, kind, onDark = false, children }: { at?: SpotPlace; name: string; kind: 'stay' | 'eat' | 'do' | 'gem'; onDark?: boolean; children: React.ReactNode }) {
  return (
    <View>
      {children}
      {!!at && (
        <Pressable
          onPress={() => router.push({ pathname: '/save', params: { place: name, country: at.country, slug: at.slug, kind, parent: at.name, parentSlug: at.slug } })}
          accessibilityRole="button"
          accessibilityLabel={`Save ${name} to a board`}
          hitSlop={6}
          style={({ pressed }) => ({
            position: 'absolute',
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: onDark ? 'rgba(255,255,255,0.15)' : colors.card,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <BookmarkIcon color={onDark ? colors.onDark : colors.ink} size={17} />
        </Pressable>
      )}
    </View>
  );
}

/** Where to eat: a photo (or the first letter), price, what to order and your score out of 10. */
export function EatRow({ eats, at }: { eats: PlaceDetail['eats']; at?: SpotPlace }) {
  return (
    <View style={{ marginTop: 28 }}>
      <SectionHeader>Where to eat</SectionHeader>
      <Row gap={12}>
        {eats.map((e) => (
          <WithSave key={e.name} at={at} name={e.name} kind="eat">
          <View
            accessible
            accessibilityLabel={[e.name, e.price ? `price ${e.price}` : null, e.what, e.score != null ? `${formatScore(e.score)} out of 10` : null, e.from ? `from ${e.from}` : null].filter(Boolean).join(', ')}
            style={{ width: 200, flex: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line }}
          >
            {e.photo ? (
              <PhotoTile photo={e.photo} shade={false} style={{ width: '100%', height: 144, borderRadius: 0 }} />
            ) : (
              <View style={{ height: 144, backgroundColor: tint(colors.stamp, 0.4), alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: fonts.display, fontSize: 32, color: colors.accent }}>{e.name[0]}</Text>
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
                {e.score != null && <Text style={{ fontFamily: fonts.display, fontSize: 17, color: colors.accentText, fontVariant: ['tabular-nums'] }}>{formatScore(e.score)}</Text>}
                {!!e.from && <Text variant="tiny">· {e.from}’s pick</Text>}
              </View>
            </View>
          </View>
          </WithSave>
        ))}
      </Row>
    </View>
  );
}

/** Things to do. A hidden gem gets the navy card. */
export function DoRow({ dos, at }: { dos: PlaceDetail['dos']; at?: SpotPlace }) {
  return (
    <View style={{ marginTop: 28 }}>
      <SectionHeader>Things to do</SectionHeader>
      <Row gap={12}>
        {dos.map((d) => (
          <WithSave key={d.name} at={at} name={d.name} kind={d.gem ? 'gem' : 'do'} onDark={d.gem}>
          <View
            accessible
            accessibilityLabel={[d.tag, d.name, d.what, d.from ? `${d.gem ? 'found by' : 'from'} ${d.from}` : null].filter(Boolean).join(', ')}
            style={{ width: 220, flex: 1, borderRadius: radius.lg, padding: 16, paddingRight: 44, backgroundColor: d.gem ? colors.ink : colors.card, borderWidth: d.gem ? 0 : 1, borderColor: colors.line }}
          >
            <Pill text={d.tag} bg={d.gem ? colors.stamp : tint(colors.stamp, 0.4)} />
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
          </WithSave>
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
        <Text style={{ fontFamily: fonts.sans, fontSize: 26, color: colors.accent, transform: [{ rotate: open ? '45deg' : '0deg' }] }}>+</Text>
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
                      <Pill text={c.tag} bg={colors.card} color={colors.olive} />
                      {!!c.when && <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 11, color: colors.accentText }}>{c.when}</Text>}
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
                  <View key={t.tip} style={{ flexDirection: 'row', gap: 12, borderRadius: radius.lg, padding: 16, backgroundColor: tint(colors.sage, 0.25), borderWidth: 1, borderColor: colors.line }}>
                    <Text style={{ fontFamily: fonts.display, fontSize: 20, lineHeight: 22, color: colors.olive }}>{i + 1}</Text>
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
    <Card tone="blush" style={{ marginHorizontal: GUTTER, marginTop: -30, padding: 14, gap: 12 }}>
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
                <View style={{ width: `${Math.round(p.value * 100)}%`, height: 5, backgroundColor: colors.olive }} />
              </View>
            </View>
          ))}
          <Text variant="tiny">{note}</Text>
        </View>
      )}
    </Card>
  );
}

const PIN_COLOURS: Record<string, string> = { Stay: colors.olive, Eat: colors.accent, Do: colors.ink, 'Hidden gem': colors.gold };

/**
 * "On the map": the place's illustrated map with numbered pins (stay, eat, do, hidden gem)
 * and a key underneath with your score for each spot (from friends and your taste).
 * Tap the map to open it full screen and pinch to zoom; tap a spot for why it's there.
 */
export function PlaceMapSection({ slug, name }: { slug: string; name: string }) {
  const taste = useTaste();
  const screen = Dimensions.get('window');
  const width = Math.min(screen.width, 480);
  // The big map: as wide as the screen and a bit over half its height; it starts filling that window,
  // and zooms out until the whole map shows (and in, a long way).
  const bigHeight = Math.round(Math.max(width * 0.75, screen.height * 0.55));
  const fill = bigHeight / ((width * 250) / 400);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [focus, setFocus] = useState<{ n: number | null; zoom: number; key: number }>({ n: null, zoom: fill, key: 0 });
  const [lastStay, setLastStay] = useState<number | null>(null);
  // The real map (dressed like the drawing) first on phones; the drawing on the web, where real maps don't run.
  const firstMode = Platform.OS === 'web' ? 'close' : 'area';
  const [mode, setMode] = useState<'close' | 'area'>(firstMode);
  const map = placeMaps[slug];
  const centre = placeCentres[slug];

  // "Where are you staying?": typing picks the stay on the map once only one matches.
  const stays = map ? map.pins.filter((p) => p.kind === 'Stay') : [];
  const q = plainName(typed);
  const matches = q.length >= 2 ? stays.filter((s) => plainName(s.name).includes(q)) : [];
  const stayPin = matches.length === 1 ? matches[0] : (stays.find((s) => plainName(s.name) === q) ?? null);
  const stay = stayPin?.n ?? null;
  if (stay !== lastStay) {
    setLastStay(stay);
    setPicked(null);
    setFocus((f) => ({ n: stay, zoom: stay == null ? fill : Math.max(2.5, fill), key: f.key + 1 }));
  }
  if (!map) return null;

  const d = placeDetails[slug];
  const spots = map.pins.map((p) => {
    const kind = p.kind === 'Stay' ? 'Stay' : p.kind === 'Eat' ? 'Eat' : 'Do';
    const { score, note } = taste.forItem({ slug, kind, name: p.name, friends: '' });
    const what =
      d?.stays.find((x) => x.name === p.name)?.sub ?? d?.eats.find((x) => x.name === p.name)?.what ?? d?.dos.find((x) => x.name === p.name)?.what ?? null;
    return { ...p, score, note, what };
  });
  const top = [...spots].sort((a, b) => b.score - a.score)[0]?.n;

  // Everything else on the map, nearest your stay first.
  const nearby = stayPin?.at
    ? spots
        .filter((s) => s.kind !== 'Stay' && s.at)
        .map((s) => ({ ...s, dist: Math.hypot(s.at![0] - stayPin.at![0], s.at![1] - stayPin.at![1]) }))
        .sort((a, b) => a.dist - b.dist)
    : [];
  const howFar = (dist: number) => (dist < 50 ? 'Right nearby' : dist < 110 ? 'A short way' : 'Further out');

  const choosePin = (n: number) => {
    const next = picked === n ? null : n;
    setPicked(next);
    if (next != null) setFocus((f) => ({ n: next, zoom: Math.max(2.5, fill), key: f.key + 1 }));
  };

  const row = (s: (typeof spots)[number], extra?: string) => {
    const on = picked === s.n;
    return (
      <Pressable
        key={s.n}
        onPress={() => choosePin(s.n)}
        accessibilityRole="button"
        accessibilityState={{ expanded: on }}
        accessibilityLabel={`${s.n}. ${s.name}, ${s.kind}${extra ? `, ${extra}` : ''}, ${formatScore(s.score)} out of 10${s.n === top ? ', top pick for you' : ''}`}
        style={{ paddingVertical: 8, gap: 6 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: PIN_COLOURS[s.kind] ?? colors.ink, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: fonts.sansBold, fontSize: 11, lineHeight: 13, color: colors.onDark }}>{s.n}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="strong" numberOfLines={1} style={{ fontSize: 14 }}>
              {s.name}
            </Text>
            <Text variant="tiny">
              {extra ? `${extra} · ` : ''}
              {s.kind}
              {s.n === top ? ' · ✦ Top pick for you' : ''}
            </Text>
          </View>
          <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.ink, fontVariant: ['tabular-nums'] }}>{formatScore(s.score)}</Text>
        </View>
        {on && (
          <View style={{ marginLeft: 32, gap: 2 }}>
            {!!s.what && <Text variant="small">{s.what}</Text>}
            {!!s.note && (
              <Text variant="small" style={{ color: colors.ink }}>
                ✦ {s.note}
              </Text>
            )}
          </View>
        )}
      </Pressable>
    );
  };
  const key = <View style={{ gap: 2 }}>{spots.map((s) => row(s))}</View>;

  return (
    <View style={{ marginTop: 28 }}>
      <SectionHeader action="Full screen" onAction={() => setOpen(true)}>
        On the map
      </SectionHeader>
      <Card style={{ marginHorizontal: GUTTER, overflow: 'hidden' }}>
        <Pressable
          onPress={() => {
            setMode(firstMode);
            setOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Map of ${name} with ${spots.length} spots. Opens the full map.`}
        >
          <Image source={map.image} style={{ width: '100%', aspectRatio: 400 / 250 }} contentFit="cover" />
        </Pressable>
        <View style={{ paddingHorizontal: 14, paddingVertical: 6 }}>{key}</View>
      </Card>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: GUTTER, paddingTop: 18, paddingBottom: 10 }}>
            <Text variant="heading">{name}</Text>
            <Pressable onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Close the map" hitSlop={10}>
              <Text variant="link">Done</Text>
            </Pressable>
          </View>
          {!!centre && (
            <View style={{ paddingHorizontal: GUTTER, paddingBottom: 10 }}>
              <Segmented
                label="Map"
                value={mode}
                onChange={setMode}
                options={[
                  ['area', 'Map'],
                  ['close', 'Drawing'],
                ]}
              />
            </View>
          )}
          {open && mode === 'close' && (
            <ZoomMap
              image={map.image}
              pins={map.pins}
              width={width}
              height={bigHeight}
              label={`Map of ${name}`}
              picked={picked}
              stay={stay}
              focus={focus}
              onPin={choosePin}
              onZoomOutPast={centre ? () => setMode('area') : undefined}
            />
          )}
          {open && mode === 'area' && !!centre && (
            <AreaMap slug={slug} name={name} width={width} height={bigHeight} pins={map.pins} picked={picked} stay={stay} focus={focus} onPin={choosePin} />
          )}
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 14, paddingBottom: 40, gap: 12 }}>
            {stays.length > 0 && (
              <View style={{ gap: 8 }}>
                <Text variant="label">Where are you staying?</Text>
                <Input value={typed} onChangeText={setTyped} placeholder="Type the name of your stay" accessibilityLabel="Where are you staying?" autoCorrect={false} />
                {q.length >= 2 && matches.length === 0 && !stayPin && <Text variant="small">We can’t find that on this map yet. Try another name.</Text>}
                {matches.length > 1 && !stayPin && <Text variant="small">Keep typing to narrow it down.</Text>}
              </View>
            )}
            {stayPin ? (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text variant="strong">Near {stayPin.name}</Text>
                  <Pressable onPress={() => setTyped('')} accessibilityRole="button" hitSlop={8}>
                    <Text variant="link">Show everything</Text>
                  </Pressable>
                </View>
                {nearby.map((s) => row(s, howFar(s.dist)))}
              </View>
            ) : (
              key
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

/** Lower case without accents or extra spaces, for matching typed names. */
function plainName(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
