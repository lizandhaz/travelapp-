import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, View } from 'react-native';

import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import type { PlaceResult } from '@/lib/match';
import { placeDetails, type PlaceDetail } from '@/lib/placeDetails';
import { placeCentres, placeMaps } from '@/lib/placeMaps';
import { useTaste } from '@/lib/taste';
import { formatScore, scoreWord } from '@/lib/score';
import { getTrip, tripId } from '@/lib/friendTrips';
import { personHref } from '@/lib/samplePeople';
import { photoForActivity } from '@/lib/sample';
import { PhotoTile } from './Photo';
import { Avatar } from './Avatar';
import { Row } from './cards';
import { ScoreStamp } from './ScoreStamp';
import { Text } from './Text';
import { Card, Input, SectionHeader } from './ui';
import { AreaMap } from './AreaMap';
import { BedIcon, BookmarkIcon, ForkIcon } from './Icons';

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
/** A friend's face and name; taps through to their profile when they have one. */
export function FriendName({ who, face, size = 36, children }: { who: string; face: PlaceDetail['said'][number]['face']; size?: number; children?: React.ReactNode }) {
  const href = personHref(who);
  return (
    <Pressable
      disabled={!href}
      onPress={() => href && router.push(href as never)}
      accessibilityRole={href ? 'link' : undefined}
      accessibilityLabel={href ? `${who}. Open their profile` : who}
      hitSlop={6}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 }}
    >
      <Avatar face={face} name={who} size={size} />
      {children}
    </Pressable>
  );
}

/** "See Tom's trip →": opens a friend's trip to this place, when there is one. */
export function FriendTripLink({ who, slug }: { who: string; slug: string }) {
  if (!getTrip(who, slug)) return null;
  return (
    <Pressable onPress={() => router.push(`/friend-trip/${tripId(who, slug)}`)} accessibilityRole="link" hitSlop={6} style={{ alignSelf: 'flex-start' }}>
      <Text variant="small" style={{ color: colors.accentText, fontFamily: fonts.sansSemiBold }}>
        See {who}’s trip →
      </Text>
    </Pressable>
  );
}

export function SaidList({ items, slug }: { items: PlaceDetail['said']; slug: string }) {
  return (
    <View style={{ paddingHorizontal: GUTTER, gap: 14 }}>
      {items.map((s) => (
        <View key={s.who + s.month} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <FriendName who={s.who} face={s.face} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="small" style={{ color: colors.ink }}>
              <Text variant="strong" style={{ fontSize: 14 }} onPress={personHref(s.who) ? () => router.push(personHref(s.who) as never) : undefined}>
                {s.who}
              </Text>
              <Text variant="small"> · {s.month}</Text>
            </Text>
            {!!s.quote && (
              <Text variant="small" style={{ color: colors.ink }}>
                {s.quote}
              </Text>
            )}
            <FriendTripLink who={s.who} slug={slug} />
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
      <Pinboard
        items={stays.map((s, i) => (
          <WithSave key={s.name} at={at} name={s.name} kind="stay">
            <SpotCard
              tone={PIN_TONES[i % PIN_TONES.length]}
              icon={<BedIcon color={colors.olive} size={18} />}
              kind={s.type}
              name={s.name}
              lines={[s.sub, s.because]}
              score={s.score}
              scoreTone="olive"
              featured={s.featured}
              tall={i % 3 === 0}
              a11y={[s.name, s.type, s.sub, s.because, s.score != null ? `${formatScore(s.score)} out of 10` : null].filter(Boolean).join(', ')}
            />
          </WithSave>
        ))}
      />
    </View>
  );
}

/**
 * Hotels and restaurants on a place page (owner, Nov 2026): no photos until friends add their own, just
 * soft coloured cards in a row that scrolls sideways.
 */
const PIN_TONES = [colors.sageSoft, colors.blushSoft, colors.skySoft, colors.champagneSoft];

/** A row of spot cards that scrolls sideways (owner, Nov 2026: a scroll, not a long section). */
function Pinboard({ items }: { items: React.ReactNode[] }) {
  return <Row gap={12}>{items}</Row>;
}

function SpotCard({
  tone,
  icon,
  kind,
  name,
  lines,
  score,
  scoreTone,
  featured,
  tall,
  footer,
  a11y,
}: {
  tone: string;
  icon: React.ReactNode;
  kind: string | null;
  name: string;
  lines: (string | null | undefined)[];
  score: number | null;
  scoreTone: 'olive' | 'stamp';
  featured?: boolean;
  tall?: boolean;
  footer?: string | null;
  a11y: string;
}) {
  return (
    <View accessible accessibilityLabel={a11y} style={{ width: tall ? 200 : 180, height: 220, borderRadius: radius.lg, backgroundColor: tone, padding: 14, paddingTop: 16, borderWidth: featured ? 2 : 0, borderColor: colors.olive }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 30 }}>
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
        {!!kind && (
          <Text variant="label" numberOfLines={1} style={{ fontSize: 10, flexShrink: 1 }}>
            {kind}
          </Text>
        )}
      </View>
      <Text numberOfLines={2} style={{ fontFamily: fonts.display, fontSize: 19, lineHeight: 23, color: colors.ink, marginTop: 14 }}>
        {name}
      </Text>
      {lines.filter(Boolean).map((l, k) => (
        <Text key={k} variant="tiny" numberOfLines={2} style={{ marginTop: 4, color: k ? colors.olive : colors.muted }}>
          {l}
        </Text>
      ))}
      <View style={{ flex: 1 }} />
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12, gap: 8 }}>
        <Text variant="tiny" numberOfLines={2} style={{ flex: 1, color: colors.accentText }}>
          {featured ? '✦ We think you’d like it' : (footer ?? '')}
        </Text>
        {score != null && <ScoreStamp score={score} size="sm" tone={scoreTone} label={`${formatScore(score)} out of 10`} />}
      </View>
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

/** Where to eat: soft cards with what to order, price and your score (no photos until friends add them). */
export function EatRow({ eats, at }: { eats: PlaceDetail['eats']; at?: SpotPlace }) {
  return (
    <View style={{ marginTop: 28 }}>
      <SectionHeader>Where to eat</SectionHeader>
      <Pinboard
        items={eats.map((e, i) => (
          <WithSave key={e.name} at={at} name={e.name} kind="eat">
            <SpotCard
              tone={PIN_TONES[(i + 1) % PIN_TONES.length]}
              icon={<ForkIcon color={colors.accentDeep} size={17} />}
              kind={e.price}
              name={e.name}
              lines={[e.what]}
              score={e.score}
              scoreTone="stamp"
              tall={i % 3 === 1}
              footer={e.from ? `${e.from}’s pick` : null}
              a11y={[e.name, e.price ? `price ${e.price}` : null, e.what, e.score != null ? `${formatScore(e.score)} out of 10` : null, e.from ? `from ${e.from}` : null].filter(Boolean).join(', ')}
            />
          </WithSave>
        ))}
      />
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
            style={{ width: 220, flex: 1, borderRadius: radius.lg, overflow: 'hidden', padding: 16, paddingRight: 44, backgroundColor: d.gem ? colors.ink : colors.card, borderWidth: d.gem ? 0 : 1, borderColor: colors.line }}
          >
            {!!photoForActivity(d) && <PhotoTile photo={photoForActivity(d)} shade={false} style={{ height: 120, marginTop: -16, marginLeft: -16, marginRight: -44, marginBottom: 12, borderRadius: 0 }} />}
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
 * "On the map": a still preview of the real (Apple) map with numbered pins (stay, eat, do, hidden gem)
 * and a key underneath with your score for each spot (from friends and your taste). Tap the map for
 * the big one: zoom from the street to the world, "Where are you staying?", and what's nearby.
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
        {/* The real map, right here: pinch to zoom, drag to look around, tap a pin to see it in the list. */}
        {!open && (
          <AreaMap
            slug={slug}
            name={name}
            width={width - GUTTER * 2 - 2}
            height={Math.round(((width - GUTTER * 2) * 300) / 400)}
            pins={map.pins}
            picked={picked}
            stay={null}
            focus={focus}
            onPin={choosePin}
          />
        )}
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
          {open && !!centre && (
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
