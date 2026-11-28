import { useState } from 'react';
import { View } from 'react-native';
import { GestureDetector, usePanGesture, useSimultaneousGestures, useTapGesture } from 'react-native-gesture-handler';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import { bestOf, bestSummary, CROWD_WORD, monthLine, monthVerdicts, VERDICT_LABEL, type BestTimeData, type Verdict } from '@/lib/bestTime';
import { Text } from './Text';

const LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

/** One colour per verdict, used by all three designs. */
const FILL: Record<Verdict, string> = { best: colors.action, good: colors.sage, off: colors.sand };

/**
 * "Best time to go" (owner, Nov 2026: "understand the best time to go within 2 seconds"; chose the cleaner chart from three
 * designs): a headline ("Best May, June and September"), the temperature line with each month's dot coloured by its
 * verdict (lib/bestTime.ts), crowds as small dots under each month, and one sentence for the month you tap.
 */
export function BestTimeSection({ detail }: { detail: BestTimeData }) {
  if (!detail.bestMonths.length) return null;
  return (
    <View style={{ paddingHorizontal: GUTTER }}>
      <BestTimeCleanChart detail={detail} />
    </View>
  );
}

/** The summary as a headline ("Best May, June and September") and the rest underneath ("25–26° by day · quietest in June"). */
function Headline({ detail }: { detail: BestTimeData }) {
  const [first, ...rest] = bestSummary(detail).split(' · ');
  return (
    <View style={{ gap: 3 }}>
      <Text variant="subheading" accessibilityRole="header">
        {first}
      </Text>
      {rest.length > 0 && <Text variant="small">{rest.join(' · ')}</Text>}
    </View>
  );
}

function Legend({ verdicts, hollowOff = false }: { verdicts: Verdict[]; /** Not ideal as an empty dot (the chart). */ hollowOff?: boolean }) {
  const shown = (['best', 'good', 'off'] as const).filter((v) => verdicts.includes(v));
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 6 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {shown.map((v) => (
        <View key={v} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={hollowOff ? { width: 10, height: 10, borderRadius: 5, backgroundColor: v === 'off' ? colors.cream : FILL[v], borderWidth: v === 'off' ? 1.5 : 0, borderColor: colors.muted } : { width: 12, height: 12, borderRadius: 3, backgroundColor: FILL[v] }} />
          <Text variant="tiny" style={{ color: colors.ink }}>
            {VERDICT_LABEL[v]}
          </Text>
        </View>
      ))}
    </View>
  );
}

const card = { backgroundColor: colors.cream, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 20, gap: 16 } as const;

/**
 * The cleaner chart: the temperature line only (no shaded bands), each month's dot coloured by its verdict, crowds as one
 * to three small dots under the month, and one sentence for the picked month. Slide a finger along the chart or the
 * months (or tap) and it follows you month by month (owner, Nov 2026: "interactive like before, the graph able to move"):
 * the phone's own gestures, so a sideways drag takes over and an up-or-down drag still scrolls the page.
 */
function BestTimeCleanChart({ detail }: { detail: BestTimeData }) {
  const verdicts = monthVerdicts(detail);
  const temps = detail.temps;
  const [w, setW] = useState(0);
  const [picked, setPicked] = useState(() => bestOf(detail)[0] ?? new Date().getMonth());
  const [sliding, setSliding] = useState(false);
  const pickAt = (px: number) => setPicked(Math.min(11, Math.max(0, Math.floor((px / Math.max(1, w)) * 12))));
  const pan = usePanGesture({
    runOnJS: true,
    activeOffsetX: [-6, 6],
    failOffsetY: [-12, 12],
    onActivate: (e) => {
      setSliding(true);
      pickAt(e.x);
    },
    onUpdate: (e) => pickAt(e.x),
    onFinalize: () => setSliding(false),
  });
  const tap = useTapGesture({ runOnJS: true, onActivate: (e) => pickAt(e.x) });
  const touch = useSimultaneousGestures(pan, tap);

  const H = 116;
  const top = 24; // room above the line for the picked month's temperature
  const min = temps ? Math.min(...temps) - 1 : 0;
  const max = temps ? Math.max(...temps) + 1 : 1;
  const x = (m: number) => ((m + 0.5) / 12) * w;
  const y = (t: number) => top + (1 - (t - min) / Math.max(1, max - min)) * (H - top - 10);
  // A smooth curve through the monthly highs (Catmull-Rom as cubic Béziers).
  let path = '';
  if (temps && w) {
    const pts = temps.map((t, m) => [x(m), y(t)] as const);
    path = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < 11; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(11, i + 2)];
      path += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
    }
  }
  const step = (by: number) => setPicked((m) => Math.min(11, Math.max(0, m + by)));

  return (
    <View style={card}>
      <Headline detail={detail} />
      {/* The chart and the months are one area to slide across; screen readers swipe up or down to change month. */}
      <GestureDetector gesture={touch}>
        <View
          collapsable={false}
          onLayout={(e) => setW(e.nativeEvent.layout.width)}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Month"
          accessibilityValue={{ text: monthLine(detail, picked) }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
        >
          {temps && w > 0 && (
            <Svg width={w} height={H}>
              {/* A dashed guide down from the picked month. */}
              <Line x1={x(picked)} x2={x(picked)} y1={y(temps[picked]) + 8} y2={H} stroke={sliding ? colors.ink : colors.line} strokeWidth={1} strokeDasharray="3 3" />
              <Path d={path} stroke={colors.accent} strokeWidth={2.2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
              {temps.map((tc, m) => {
                const v = verdicts[m];
                const on = m === picked;
                return (
                  <Circle key={m} cx={x(m)} cy={y(tc)} r={on ? 7 : 4.5} fill={v === 'off' ? colors.cream : FILL[v]} stroke={v === 'off' ? colors.muted : on ? colors.ink : colors.cream} strokeWidth={on ? 2 : 1.5} />
                );
              })}
              <SvgText x={x(picked)} y={y(temps[picked]) - 13} fontSize={13} fontFamily={fonts.sansSemiBold} fill={colors.ink} textAnchor="middle">
                {`${String(temps[picked]).replace('-', '−')}°`}
              </SvgText>
            </Svg>
          )}
          {/* Months with crowds as dots underneath. */}
          <View style={{ flexDirection: 'row', marginTop: 2 }}>
            {verdicts.map((v, m) => {
              const c = detail.crowds?.[m] ?? 0;
              return (
                <View key={m} style={{ flex: 1, alignItems: 'center', gap: 5, paddingVertical: 4 }}>
                  <Text style={{ fontFamily: v === 'off' && picked !== m ? fonts.sans : fonts.sansSemiBold, fontSize: 13, color: picked === m ? colors.accentText : v === 'off' ? colors.muted : colors.ink }}>{LETTERS[m]}</Text>
                  <View style={{ flexDirection: 'row', gap: 2, height: 4 }}>
                    {Array.from({ length: c }, (_, i) => (
                      <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: c === 3 ? colors.accent : colors.muted }} />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </GestureDetector>
      <Text variant="small" style={{ color: colors.ink }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {monthLine(detail, picked)}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 16, rowGap: 6 }}>
        <Legend verdicts={verdicts} hollowOff />
        <Text variant="tiny">Small dots: {CROWD_WORD[1]}, {CROWD_WORD[2]}, {CROWD_WORD[3]} · line: daytime high</Text>
      </View>
      <Text variant="link" style={{ alignSelf: 'flex-end', fontSize: 13 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        Slide to explore ↔
      </Text>
    </View>
  );
}
