import { useRef, useState } from 'react';
import { View, type GestureResponderEvent } from 'react-native';

import { Stamp } from '@/components/Stamp';
import { Text } from '@/components/Text';
import { colors, fonts } from '@/constants/theme';
import { SCORE_WORDS } from '@/lib/trips';

/**
 * Tap or slide across 1–10. Shows a stamp and a word ("Loved it").
 * Screen readers can swipe up/down to change it.
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
  const [dragging, setDragging] = useState(false);

  const fromTouch = (e: GestureResponderEvent) => {
    const x = e.nativeEvent.locationX;
    const n = Math.min(10, Math.max(1, Math.ceil((x / width.current) * 10)));
    if (n !== value) onChange(n);
  };

  const tone = value == null ? colors.inkSoft : value >= 8 ? colors.sea : value >= 6 ? colors.airmail : colors.postbox;

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: compact ? 0 : 84 }}>
        {!compact && (value ? <Stamp score={value} size="md" tilt={-3} /> : <EmptyStamp />)}
        <Text
          accessibilityLiveRegion="polite"
          style={{ fontFamily: fonts.displayItalic, fontSize: compact ? 17 : 24, color: tone, flexShrink: 1 }}
        >
          {value ? `${value}/10 · ${SCORE_WORDS[value]}` : compact ? 'Tap a score' : 'Tap or slide to score'}
        </Text>
      </View>

      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`${label}, out of 10`}
        accessibilityValue={{ min: 1, max: 10, now: value ?? undefined, text: value ? `${value}, ${SCORE_WORDS[value]}` : 'Not set' }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          const v = value ?? 5;
          if (e.nativeEvent.actionName === 'increment') onChange(Math.min(10, v + 1));
          if (e.nativeEvent.actionName === 'decrement') onChange(Math.max(1, v - 1));
        }}
        onLayout={(e) => (width.current = e.nativeEvent.layout.width || 1)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => !dragging}
        onResponderGrant={(e) => {
          setDragging(true);
          fromTouch(e);
        }}
        onResponderMove={fromTouch}
        onResponderRelease={() => setDragging(false)}
        onResponderTerminate={() => setDragging(false)}
        style={{ flexDirection: 'row', gap: 4, paddingVertical: 4 }}
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const on = value != null && n <= value;
          return (
            <View
              key={n}
              pointerEvents="none"
              style={{
                flex: 1,
                height: compact ? 36 : 44,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: on ? tone : colors.sand,
                backgroundColor: on ? tone : colors.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: fonts.display, fontSize: 15, color: on ? colors.card : colors.inkSoft }}>{n}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function EmptyStamp() {
  return (
    <View
      style={{
        width: 66,
        height: 76,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: colors.sand,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-3deg' }],
      }}
    >
      <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.sand }}>?</Text>
    </View>
  );
}
