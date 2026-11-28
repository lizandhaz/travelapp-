import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

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
 * The cleaner chart: the temperature line only (no shaded bands), each month's dot coloured by its verdict, crowds as
 * one to three small dots under the month, and one sentence for the month you tap.
 */
function BestTimeCleanChart({ detail }: { detail: BestTimeData }) {
  const verdicts = monthVerdicts(detail);
  const temps = detail.temps;
  const [w, setW] = useState(0);
  const [picked, setPicked] = useState(() => bestOf(detail)[0] ?? new Date().getMonth());
  const H = 110;
  const pad = 14;
  const min = temps ? Math.min(...temps) - 2 : 0;
  const max = temps ? Math.max(...temps) + 2 : 1;
  const x = (m: number) => ((m + 0.5) / 12) * w;
  const y = (t: number) => pad + (1 - (t - min) / Math.max(1, max - min)) * (H - pad * 2);
  const path = temps && w ? temps.map((t, m) => `${m ? 'L' : 'M'}${x(m).toFixed(1)},${y(t).toFixed(1)}`).join(' ') : '';
  return (
    <View style={card}>
      <Headline detail={detail} />
      {temps && (
        <View onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {w > 0 && (
            <Svg width={w} height={H}>
              <Path d={path} stroke={colors.accent} strokeWidth={2} fill="none" strokeLinejoin="round" />
              {temps.map((t, m) => {
                const v = verdicts[m];
                const on = m === picked;
                return (
                  <Circle key={m} cx={x(m)} cy={y(t)} r={on ? 6.5 : 4.5} fill={v === 'off' ? colors.cream : FILL[v]} stroke={v === 'off' ? colors.muted : on ? colors.ink : colors.cream} strokeWidth={on ? 2 : 1.5} />
                );
              })}
              <SvgText x={x(picked)} y={y(temps[picked]) - 12} fontSize={12} fontFamily={fonts.sansSemiBold} fill={colors.ink} textAnchor="middle">
                {`${temps[picked]}°`}
              </SvgText>
            </Svg>
          )}
        </View>
      )}
      {/* Months (tap one) with crowds as dots underneath. */}
      <View style={{ flexDirection: 'row', marginTop: -6 }}>
        {verdicts.map((v, m) => {
          const c = detail.crowds?.[m] ?? 0;
          return (
            <Pressable key={m} onPress={() => setPicked(m)} accessibilityRole="button" accessibilityState={{ selected: picked === m }} accessibilityLabel={monthLine(detail, m)} style={{ flex: 1, alignItems: 'center', gap: 5, paddingVertical: 4 }}>
              <Text style={{ fontFamily: v === 'off' ? fonts.sans : fonts.sansSemiBold, fontSize: 13, color: picked === m ? colors.accentText : v === 'off' ? colors.muted : colors.ink }}>{LETTERS[m]}</Text>
              <View style={{ flexDirection: 'row', gap: 2, height: 4 }}>
                {Array.from({ length: c }, (_, i) => (
                  <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: c === 3 ? colors.accent : colors.muted }} />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
      <Text variant="small" style={{ color: colors.ink }} accessibilityLiveRegion="polite">
        {monthLine(detail, picked)}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 16, rowGap: 6 }}>
        <Legend verdicts={verdicts} hollowOff />
        <Text variant="tiny">Small dots: {CROWD_WORD[1]}, {CROWD_WORD[2]}, {CROWD_WORD[3]} · line: daytime high</Text>
      </View>
    </View>
  );
}
