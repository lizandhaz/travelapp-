import { useRef } from 'react';
import { View, type GestureResponderEvent } from 'react-native';

import { Text } from '@/components/Text';
import { Card } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';
import { clampScore, formatScore, scoreWord } from '@/lib/score';

/**
 * "Slide to rate out of 10": drag (or tap) along the bar for a score with one
 * decimal place (8.8), with a word under it ("Loved it"). Screen readers can
 * swipe up/down to change it in steps of 0.5.
 */
export function ScorePicker({
  value,
  onChange,
  label,
  compact = false,
}: {
  value: number | null;
  onChange: (n: number) => void;
  label: string;
  compact?: boolean;
}) {
  const width = useRef(1);

  const fromTouch = (e: GestureResponderEvent) => {
    const x = Math.min(width.current, Math.max(0, e.nativeEvent.locationX));
    const n = clampScore(1 + (x / width.current) * 9);
    if (n !== value) onChange(n);
  };
  const pct = value == null ? 0 : ((value - 1) / 9) * 100;

  return (
    <Card style={{ padding: compact ? 14 : 18, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text variant="label" style={{ fontSize: 10 }}>
          {value == null ? 'Slide to rate out of 10' : compact ? label : 'Slide to rate out of 10'}
        </Text>
        <Text accessibilityLiveRegion="polite">
          <Text style={{ fontFamily: fonts.display, fontSize: compact ? 22 : 30, color: colors.ink, fontVariant: ['tabular-nums'] }}>
            {value == null ? '–' : formatScore(value)}
          </Text>
          <Text style={{ fontFamily: fonts.displayRegular, fontSize: compact ? 14 : 17, color: colors.muted }}> / 10</Text>
        </Text>
      </View>

      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`${label}, out of 10`}
        accessibilityValue={{ min: 1, max: 10, now: value ?? undefined, text: value == null ? 'Not set' : `${formatScore(value)}, ${scoreWord(value)}` }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          const v = value ?? 7.5;
          if (e.nativeEvent.actionName === 'increment') onChange(clampScore(v + 0.5));
          if (e.nativeEvent.actionName === 'decrement') onChange(clampScore(v - 0.5));
        }}
        onLayout={(e) => (width.current = e.nativeEvent.layout.width || 1)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        // Keep the drag once it starts, so sliding right isn't taken as a swipe back or a scroll.
        onResponderTerminationRequest={() => false}
        onResponderGrant={fromTouch}
        onResponderMove={fromTouch}
        style={{ height: 30, justifyContent: 'center' }}
      >
        <View pointerEvents="none" style={{ height: 6, borderRadius: 3, backgroundColor: value == null ? colors.line : colors.ink, overflow: 'hidden' }}>
          <View style={{ width: `${pct}%`, height: 6, backgroundColor: colors.accent }} />
        </View>
        {value != null && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: `${pct}%`,
              marginLeft: -11,
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.line,
              shadowColor: '#000',
              shadowOpacity: 0.18,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 },
              elevation: 2,
            }}
          />
        )}
      </View>

      <Text variant="small" style={{ color: value == null ? colors.muted : colors.ink }}>
        {value == null ? 'Tap or slide along the bar' : scoreWord(value)}
      </Text>
    </Card>
  );
}
