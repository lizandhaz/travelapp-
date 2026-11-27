import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { colors, fonts, GUTTER, radius, MAX_WIDTH } from '@/constants/theme';
import type { PlaceResult } from '@/lib/match';
import { placeDetails, type PlaceDetail } from '@/lib/placeDetails';
import { placeCentres, placeMaps, pinPosition, mapDistance } from '@/lib/placeMaps';
import { useTaste } from '@/lib/taste';
import { formatScore } from '@/lib/score';
import { getTrip, tripId } from '@/lib/friendTrips';
import { personHref } from '@/lib/samplePeople';
import { photoForActivity } from '@/lib/sample';
import { parseStaySub } from '@/lib/placeFeatures';
import { PhotoTile } from './Photo';
import { Avatar } from './Avatar';
import { Row } from './cards';
import { ScoreStamp } from './ScoreStamp';
import { Text } from './Text';
import { Card, Input, SectionHeader, useScrollLock } from './ui';
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
  const best = new Set(detail.bestMonths);
  const [chosen, setChosen] = useState<number>(detail.bestMonths[0] ?? 6);
  const [w, setW] = useState(0);
  const [sliding, setSliding] = useState(false);
  const lock = useScrollLock();
  if (!temps) return null;
  // Slide a finger across the chart (or tap it) and it follows you month by month (owner, Nov 2026: "I don't want it static").
  const monthAt = (x: number) => Math.min(11, Math.max(0, Math.floor((x / Math.max(1, w)) * 12)));
  const follow = (e: GestureResponderEvent) => {
    const m = monthAt(e.nativeEvent.locationX);
    if (m !== chosen) setChosen(m);
  };

  // A soft curve through the monthly highs (owner, Nov 2026: "as aesthetic as possible"): best months shaded behind it,
  // one dot per month, and the month you tap picked out with its temperature, crowds and whether it's a best month.
  const H = 92;
  const PAD = 18; // room above the curve for the picked month's temperature
  const lo = Math.min(...temps) - 2;
  const hi = Math.max(...temps) + 1;
  const col = w / 12;
  const x = (i: number) => col * i + col / 2;
  const y = (t: number) => PAD + (1 - (t - lo) / Math.max(1, hi - lo)) * (H - PAD - 8);
  const pts = temps.map((t, i) => [x(i), y(t)] as const);
  // Catmull-Rom → cubic Bézier for a smooth line.
  let line = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    line += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
  }
  const area = `${line} L ${pts[11][0]} ${H} L ${pts[0][0]} ${H} Z`;
  const crowd = detail.crowds;
  const summary =
    `Average daytime highs: ${temps.map((t, i) => `${MONTH_NAMES[i]} ${t}°C`).join(', ')}.` +
    (best.size ? ` Best months: ${[...best].map((m) => MONTH_NAMES[m]).join(', ')}.` : '') +
    (crowd ? ` Crowds: ${crowd.map((c, i) => `${MONTH_NAMES[i]} ${CROWD_WORDS[c]}`).join(', ')}.` : '');

  return (
    <View style={{ marginTop: 28 }}>
      <SectionHeader>Best time to go</SectionHeader>
      <Card tone="cream" style={{ marginHorizontal: GUTTER, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, gap: 12 }}>
        {/* The month you've picked. */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }} accessibilityLiveRegion="polite">
          <View>
            <Text style={{ fontFamily: fonts.displayItalic, fontSize: 24, lineHeight: 30, color: colors.ink }}>{LONG_MONTHS[chosen]}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              {crowd && <MiniPill text={CROWD_LABELS[crowd[chosen]]} bg={[colors.card, colors.sageSoft, colors.blushSoft, colors.blushSoft][crowd[chosen]]} color={crowd[chosen] === 3 ? colors.accentText : colors.ink} />}
              {best.has(chosen) && <MiniPill text="✦ Best month" bg={colors.sageSoft} color={colors.olive} />}
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 34, lineHeight: 40, color: colors.ink }}>
              {temps[chosen]}
              <Text style={{ fontFamily: fonts.displayRegular, fontSize: 18, color: colors.muted }}>°C</Text>
            </Text>
            <Text variant="tiny">Average daytime high</Text>
          </View>
        </View>

        {/* The chart and the months are one area you slide across (or tap). Its children don't take touches, so the
            finger's position is always measured across the whole width. */}
        <View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={`Best time to go. ${summary}`}
          accessibilityValue={{ text: `${LONG_MONTHS[chosen]}, ${temps[chosen]} degrees${crowd ? `, ${CROWD_WORDS[crowd[chosen]]}` : ''}${best.has(chosen) ? ', a best month' : ''}` }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(ev) => setChosen((c) => Math.min(11, Math.max(0, c + (ev.nativeEvent.actionName === 'increment' ? 1 : -1))))}
          onLayout={(ev) => setW(ev.nativeEvent.layout.width)}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderGrant={(ev) => {
            lock(true); // the page holds still while you slide
            setSliding(true);
            follow(ev);
          }}
          onResponderMove={follow}
          onResponderRelease={() => {
            lock(false);
            setSliding(false);
          }}
          onResponderTerminate={() => {
            lock(false);
            setSliding(false);
          }}
          style={{ gap: 10 }}
        >
          <View pointerEvents="none" style={{ height: H }}>
            {w > 0 && (
              <Svg width={w} height={H}>
                <Defs>
                  <LinearGradient id="warm" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={colors.accent} stopOpacity={0.28} />
                    <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
                  </LinearGradient>
                </Defs>
                {bestRuns(detail.bestMonths).map(([a, b]) => (
                  <Rect key={a} x={col * a + 2} y={0} width={col * (b - a + 1) - 4} height={H} rx={10} fill={colors.sageSoft} />
                ))}
                <Path d={area} fill="url(#warm)" />
                <Path d={line} stroke={colors.accent} strokeWidth={2} fill="none" strokeLinecap="round" />
                {/* A guide line down from the month you're on, and its temperature above the dot. */}
                <Line x1={x(chosen)} y1={pts[chosen][1] + 6} x2={x(chosen)} y2={H} stroke={colors.ink} strokeOpacity={sliding ? 0.35 : 0.18} strokeWidth={1} strokeDasharray="3 3" />
                {pts.map(([px, py], i) => (
                  <Circle key={i} cx={px} cy={py} r={i === chosen ? (sliding ? 7 : 5.5) : 2.5} fill={i === chosen ? colors.card : colors.accent} stroke={colors.accent} strokeWidth={i === chosen ? 2.5 : 0} />
                ))}
                <SvgText x={Math.min(w - 14, Math.max(14, x(chosen)))} y={Math.max(11, pts[chosen][1] - 11)} fontSize={11} fontFamily={fonts.sansSemiBold} fill={colors.ink} textAnchor="middle">
                  {`${temps[chosen]}°`}
                </SvgText>
              </Svg>
            )}
          </View>

          <View pointerEvents="none" style={{ flexDirection: 'row' }}>
            {MONTH_LETTERS.map((m, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', gap: 5 }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: chosen === i ? colors.ink : 'transparent' }}>
                  <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 11, lineHeight: 14, color: chosen === i ? colors.onDark : best.has(i) ? colors.olive : colors.muted }}>{m}</Text>
                </View>
                {crowd && <View style={{ width: '70%', height: chosen === i ? 6 : 4, borderRadius: 3, backgroundColor: CROWD_FILL[crowd[i]] }} />}
              </View>
            ))}
          </View>
        </View>
        {crowd && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text variant="tiny">Crowds</Text>
            {[1, 2, 3].map((c) => (
              <View key={c} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 12, height: 4, borderRadius: 2, backgroundColor: CROWD_FILL[c] }} />
                <Text variant="tiny">{CROWD_LABELS[c]}</Text>
              </View>
            ))}
            <Text variant="tiny" style={{ marginLeft: 'auto', color: colors.accentText }}>
              Slide to explore ↔
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
}

const LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CROWD_LABELS = ['', 'Quiet', 'Busy', 'Very busy'];
const CROWD_FILL = ['transparent', colors.sage, colors.stamp, colors.accent];

/** Best months as runs of neighbouring months ([5, 6, 8] → [[5, 6], [8, 8]]), so they shade as one band each. */
function bestRuns(months: number[]): [number, number][] {
  const runs: [number, number][] = [];
  for (const m of [...months].sort((a, b) => a - b)) {
    const last = runs[runs.length - 1];
    if (last && m === last[1] + 1) last[1] = m;
    else runs.push([m, m]);
  }
  return runs;
}

function MiniPill({ text, bg, color = colors.ink }: { text: string; bg: string; color?: string }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 }}>
      <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 11, lineHeight: 14, color }}>{text}</Text>
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
/** Price bands for "Where to stay" (owner, Nov 2026: filter stays by budget). */
/**
 * "Up to £X a night": drag (or tap) along the bar to set the most you'd pay (owner, Nov 2026: no broad buckets). It runs
 * from this place's cheapest stay to its dearest in £10 steps, with a small dot for each stay's price; all the way to
 * the right is any price. Screen readers swipe up/down to change it by £10.
 */
export function PriceSlider({ prices, value, onChange, shown }: { prices: number[]; value: number | null; onChange: (v: number | null) => void; shown: number }) {
  const width = useRef(1);
  const lock = useScrollLock();
  const lo = Math.floor(Math.min(...prices) / 10) * 10;
  const hi = Math.ceil(Math.max(...prices) / 10) * 10;
  const at = value ?? hi;
  const pct = (v: number) => ((v - lo) / Math.max(1, hi - lo)) * 100;
  const set = (v: number) => {
    const snapped = Math.round(Math.min(hi, Math.max(lo, v)) / 10) * 10;
    const next = snapped >= hi ? null : snapped;
    if (next !== value) onChange(next);
  };
  const fromTouch = (e: GestureResponderEvent) => set(lo + (Math.min(width.current, Math.max(0, e.nativeEvent.locationX)) / width.current) * (hi - lo));
  const label = value == null ? 'Any price' : `Up to £${value} a night`;
  return (
    <View style={{ paddingHorizontal: GUTTER, marginBottom: 16, gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 18, lineHeight: 24, color: colors.ink }} accessibilityLiveRegion="polite">
          {label}
        </Text>
        <Text variant="tiny">
          {shown} of {prices.length} {prices.length === 1 ? 'stay' : 'stays'}
        </Text>
      </View>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Most you'd pay a night"
        accessibilityValue={{ min: lo, max: hi, now: at, text: label }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => set(at + (e.nativeEvent.actionName === 'increment' ? 10 : -10))}
        onLayout={(e) => (width.current = e.nativeEvent.layout.width || 1)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(e) => {
          lock(true); // the page holds still while you drag
          fromTouch(e);
        }}
        onResponderMove={fromTouch}
        onResponderRelease={() => lock(false)}
        onResponderTerminate={() => lock(false)}
        style={{ height: 36, justifyContent: 'center' }}
      >
        <View pointerEvents="none" style={{ height: 6, borderRadius: 3, backgroundColor: colors.line, overflow: 'hidden' }}>
          <View style={{ width: `${pct(at)}%`, height: 6, backgroundColor: colors.olive }} />
        </View>
        {prices.map((p, i) => (
          <View key={i} pointerEvents="none" style={{ position: 'absolute', left: `${pct(p)}%`, marginLeft: -3, width: 6, height: 6, borderRadius: 3, backgroundColor: p <= at ? colors.card : colors.muted, opacity: p <= at ? 1 : 0.5 }} />
        ))}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: `${pct(at)}%`,
            marginLeft: -12,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.card,
            borderWidth: 2,
            borderColor: colors.olive,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 3,
            shadowOffset: { width: 0, height: 1 },
            elevation: 2,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="tiny">£{lo}</Text>
        <Text variant="tiny">£{hi}+</Text>
      </View>
    </View>
  );
}

/**
 * Where to stay: a price slider (when the stays' prices differ), then the stays as cards that scroll sideways.
 * Tap a card for its own page (app/stay/[slug].tsx) with prices and links out.
 */
export function StayRow({ stays, at }: { stays: PlaceDetail['stays']; at?: SpotPlace }) {
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const prices = stays.map((s) => parseStaySub(s.sub).priceFrom);
  const known = prices.filter((p): p is number => p != null);
  const shown = stays.filter((s, i) => maxPrice == null || (prices[i] != null && prices[i]! <= maxPrice));
  return (
    <View style={{ marginTop: 28 }}>
      <SectionHeader>Where to stay</SectionHeader>
      {new Set(known).size >= 2 && <PriceSlider prices={known} value={maxPrice} onChange={setMaxPrice} shown={shown.length} />}
      {shown.length === 0 ? (
        <Text variant="small" style={{ paddingHorizontal: GUTTER }}>
          No stays that low here. Slide right to see more.
        </Text>
      ) : (
        <Pinboard
          items={shown.map((s, i) => (
            <WithSave key={s.name} at={at} name={s.name} kind="stay">
              <Pressable
                disabled={!at}
                onPress={() => at && router.push({ pathname: '/stay/[slug]', params: { slug: at.slug, name: s.name } })}
                accessibilityRole="link"
                accessibilityHint="Opens its page with prices and a link to book"
                style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
              >
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
                  footer="Prices & details →"
                  a11y={[s.name, s.type, s.sub, s.because, s.score != null ? `${formatScore(s.score)} out of 10` : null].filter(Boolean).join(', ')}
                />
              </Pressable>
            </WithSave>
          ))}
        />
      )}
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
    <View accessible accessibilityLabel={a11y} style={{ width: tall ? 200 : 180, minHeight: 230, borderRadius: radius.lg, backgroundColor: tone, padding: 14, paddingTop: 16, borderWidth: featured ? 2 : 0, borderColor: colors.olive }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 30 }}>
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
        {!!kind && (
          <Text variant="label" numberOfLines={1} style={{ fontSize: 10, flexShrink: 1 }}>
            {kind}
          </Text>
        )}
      </View>
      {featured && (
        // Its own line near the top, so it never wraps beside the score stamp (owner, Nov 2026).
        <View style={{ alignSelf: 'flex-start', marginTop: 10, backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 }}>
          <Text variant="tiny" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ color: colors.olive, fontFamily: fonts.sansSemiBold }}>
            ✦ We think you’d like it
          </Text>
        </View>
      )}
      <Text numberOfLines={2} style={{ fontFamily: fonts.display, fontSize: 19, lineHeight: 23, color: colors.ink, marginTop: featured ? 8 : 14 }}>
        {name}
      </Text>
      {lines.filter(Boolean).map((l, k) => (
        <Text key={k} variant="tiny" numberOfLines={2} style={{ marginTop: 4, color: k ? colors.olive : colors.muted }}>
          {l}
        </Text>
      ))}
      <View style={{ flex: 1 }} />
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12, gap: 8 }}>
        <Text variant="tiny" numberOfLines={1} style={{ flex: 1, color: colors.accentText }}>
          {footer ?? ''}
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
export function MoreAbout({ name, detail, eat, todo }: { name: string; detail: PlaceDetail; eat?: React.ReactNode; todo?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  // Where to eat and things to do live in here too (owner, Nov 2026: keep the place page short). The culture
  // section was taken out to keep things simple (owner, Nov 2026); the data stays in placeDetails for matching.
  const parts = [eat ? 'Where to eat' : null, todo ? 'things to do' : null, detail.tips.length ? 'top tips' : null].filter(Boolean) as string[];
  if (!parts.length) return null;
  const summary = parts.join(', ').replace(/, ([^,]*)$/, ' and $1');
  const label = summary[0].toUpperCase() + summary.slice(1);
  return (
    <View style={{ marginTop: 28 }}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`More about ${name}: ${summary}`}
        style={{ marginHorizontal: GUTTER, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}
      >
        <View style={{ flex: 1 }}>
          <Text variant="subheading">More about {name}</Text>
          <Text variant="small">{label}</Text>
        </View>
        <Text style={{ fontFamily: fonts.sans, fontSize: 26, color: colors.accent, transform: [{ rotate: open ? '45deg' : '0deg' }] }}>+</Text>
      </Pressable>
      {open && (
        <View>
          {eat}
          {todo}
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
export function YourScore({ result, note, known = true }: { result: PlaceResult; note: string; /** False until we know anything about your taste. */ known?: boolean }) {
  const [open, setOpen] = useState(false);
  const b = result.breakdown;
  const from =
    b.baseFrom === 'nobody yet'
      ? 'No ratings yet, so we start from 7.0'
      : `Rated ${b.base.toFixed(1)} by ${b.baseFrom === 'everyone' ? 'everyone' : b.baseFrom === 'friends' ? `${b.friendsCount} ${b.friendsCount === 1 ? 'friend' : 'friends'}` : `everyone and ${b.friendsCount} ${b.friendsCount === 1 ? 'friend' : 'friends'}`}`;
  return (
    <Card tone="cream" style={{ marginHorizontal: GUTTER, marginTop: -30, padding: 14, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <ScoreStamp score={result.score} size="md" label={result.yours != null ? 'Your rating' : 'Your score'} />
        <View style={{ flex: 1 }}>
          <Text variant="subheading">
            {result.yours != null ? 'Your rating' : known ? 'Your score' : 'Traveller score'}
          </Text>
          <Text variant="small">{result.yours != null ? 'You’ve been. This is the score you gave it.' : known ? 'Worked out for you' : 'Popular with travellers. Add a trip or save places and it becomes yours.'}</Text>
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
/** The map key's sections, in order (hidden gems sit with things to do). */
const MAP_SECTIONS = [
  { kind: 'Stay', label: 'Where to stay' },
  { kind: 'Eat', label: 'Where to eat' },
  { kind: 'Do', label: 'Things to do' },
] as const;

/**
 * "On the map": a still preview of the real (Apple) map with numbered pins (stay, eat, do, hidden gem)
 * and a key underneath with your score for each spot (from friends and your taste). Tap the map for
 * the big one: zoom from the street to the world, "Where are you staying?", and what's nearby.
 */
export function PlaceMapSection({ slug, name }: { slug: string; name: string }) {
  const taste = useTaste();
  const screen = Dimensions.get('window');
  const width = Math.min(screen.width, MAX_WIDTH);
  // The big map: as wide as the screen and a bit over half its height; it starts filling that window,
  // and zooms out until the whole map shows (and in, a long way).
  const bigHeight = Math.round(Math.max(width * 0.75, screen.height * 0.55));
  const fill = bigHeight / ((width * 250) / 400);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  // Tapped on the map (details open under the map) or in the list (details open in the list).
  const [fromMap, setFromMap] = useState(false);
  const [typed, setTyped] = useState('');
  const [focus, setFocus] = useState<{ n: number | null; zoom: number; key: number }>({ n: null, zoom: fill, key: 0 });
  const [lastStay, setLastStay] = useState<number | null>(null);
  const map = placeMaps[slug];
  const centre = placeCentres[slug];
  const d = placeDetails[slug];

  // Ranked (owner, Nov 2026): the key is in sections (stay, eat, do), each best for you first, and the pins are numbered
  // in that order, so 1 is your best stay and the numbers read top to bottom.
  const scored = (map?.pins ?? []).map((p) => {
    const kind = p.kind === 'Stay' ? 'Stay' : p.kind === 'Eat' ? 'Eat' : 'Do';
    const { score, note } = taste.forItem({ slug, kind, name: p.name, friends: '' });
    const what =
      d?.stays.find((x) => x.name === p.name)?.sub ?? d?.eats.find((x) => x.name === p.name)?.what ?? d?.dos.find((x) => x.name === p.name)?.what ?? null;
    return { ...p, section: kind, score, note, what };
  });
  const spots = MAP_SECTIONS.flatMap((sec) => scored.filter((s) => s.section === sec.kind).sort((a, b) => b.score - a.score)).map((s, i) => ({ ...s, n: i + 1 }));
  const pins = spots.map(({ n, name, kind, at, ll }) => ({ n, name, kind, at, ll }));

  // "Where are you staying?": typing picks the stay on the map once only one matches.
  const stays = spots.filter((p) => p.kind === 'Stay');
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

  const top = [...spots].sort((a, b) => b.score - a.score)[0]?.n;

  // Everything else on the map, nearest your stay first.
  const stayPos = stayPin ? pinPosition(slug, stayPin) : null;
  const nearby = stayPos
    ? spots
        .map((s) => ({ ...s, pos: pinPosition(slug, s) }))
        .filter((s) => s.kind !== 'Stay' && s.pos)
        .map((s) => ({ ...s, dist: mapDistance(slug, s.pos!, stayPos) }))
        .sort((a, b) => a.dist - b.dist)
    : [];
  const howFar = (dist: number) => (dist < 50 ? 'Right nearby' : dist < 110 ? 'A short way' : 'Further out');

  const choosePin = (n: number, onMap = false) => {
    setFromMap(onMap);
    const next = picked === n && fromMap === onMap ? null : n;
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
        {on && !fromMap && (
          <View style={{ marginLeft: 32, gap: 2 }}>
            {!!s.what && <Text variant="small">{s.what}</Text>}
            {!!s.note && (
              <Text variant="small" style={{ color: colors.ink }}>
                ✦ {s.note}
              </Text>
            )}
            {s.kind === 'Stay' && !!d?.stays.some((x) => x.name === s.name) && (
              <Pressable
                onPress={() => {
                  setOpen(false);
                  router.push({ pathname: '/stay/[slug]', params: { slug, name: s.name } });
                }}
                accessibilityRole="link"
                accessibilityLabel={`See ${s.name}: prices and details`}
                hitSlop={8}
                style={{ marginTop: 2 }}
              >
                <Text variant="link">See the stay →</Text>
              </Pressable>
            )}
          </View>
        )}
      </Pressable>
    );
  };
  // Tap a number (on the map or in the list) and its details open right under the map (owner, Nov 2026): what it is,
  // why it suits you and its score, with a way into a stay's own page.
  const chosenSpot = spots.find((s) => s.n === picked) ?? null;
  const hasPage = !!chosenSpot && chosenSpot.kind === 'Stay' && !!d?.stays.some((x) => x.name === chosenSpot.name);
  const panel = chosenSpot && fromMap && (
    <View style={{ backgroundColor: colors.sageSoft, paddingHorizontal: 14, paddingVertical: 12, gap: 8 }} accessibilityLiveRegion="polite">
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ width: 26, height: 26, borderRadius: 13, marginTop: 2, backgroundColor: PIN_COLOURS[chosenSpot.kind] ?? colors.ink, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.sansBold, fontSize: 12, lineHeight: 14, color: colors.onDark }}>{chosenSpot.n}</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="label" style={{ fontSize: 10 }}>
            {chosenSpot.kind}
            {chosenSpot.n === top ? ' · ✦ Top pick for you' : ''}
          </Text>
          <Text variant="subheading">{chosenSpot.name}</Text>
          {!!chosenSpot.what && <Text variant="small">{chosenSpot.what}</Text>}
          {!!chosenSpot.note && (
            <Text variant="small" style={{ color: colors.ink }}>
              ✦ {chosenSpot.note}
            </Text>
          )}
        </View>
        <ScoreStamp score={chosenSpot.score} size="sm" label={`Your score for ${chosenSpot.name}`} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 36 }}>
        {hasPage ? (
          <Pressable
            onPress={() => {
              setOpen(false);
              router.push({ pathname: '/stay/[slug]', params: { slug, name: chosenSpot.name } });
            }}
            accessibilityRole="link"
            accessibilityLabel={`See ${chosenSpot.name}: prices and details`}
            hitSlop={8}
          >
            <Text variant="link">See the stay →</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Pressable onPress={() => setPicked(null)} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
          <Text variant="small" style={{ color: colors.muted }}>
            Close
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const key = (
    <View style={{ gap: 2 }}>
      {MAP_SECTIONS.map((sec) => {
        const inSection = spots.filter((s) => s.section === sec.kind);
        if (!inSection.length) return null;
        return (
          <View key={sec.kind} style={{ paddingTop: 8 }}>
            <Text variant="label" style={{ fontSize: 10 }}>
              {sec.label}
            </Text>
            {inSection.map((s) => row(s))}
          </View>
        );
      })}
    </View>
  );

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
            pins={pins}
            picked={picked}
            stay={null}
            focus={focus}
            onPin={(n) => choosePin(n, true)}
          />
        )}
        {!open && panel}
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
            <AreaMap slug={slug} name={name} width={width} height={bigHeight} pins={pins} picked={picked} stay={stay} focus={focus} onPin={(n) => choosePin(n, true)} />
          )}
          {open && panel}
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
