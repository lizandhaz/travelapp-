import { useState } from 'react';
import { Animated, Pressable, View } from 'react-native';

import { Text } from '@/components/Text';
import { colors, fonts, radius } from '@/constants/theme';
import { COMPANIONS, type Companions } from '@/lib/trips';

/** A friendly face and a few words for each (owner, Nov 2026: "not plain buttons"). */
const LOOK: Record<Companions, { emoji: string; line: string }> = {
  solo: { emoji: '🎒', line: 'Just me' },
  partner: { emoji: '💛', line: 'The two of us' },
  friends: { emoji: '🥂', line: 'A group of friends' },
  family: { emoji: '🏡', line: 'With family' },
};

/**
 * "Who did you go with?": a 2 × 2 of soft cards, each with an emoji, its name and a few words. The chosen one fills
 * sage with an olive border and a ✓; cards give a little when pressed. Tap the chosen one again to clear it.
 */
export function CompanionPicker({ value, onChange }: { value: Companions | null; onChange: (c: Companions | null) => void }) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Who did you go with?" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {COMPANIONS.map(([id, label]) => (
        <CompanionCard key={id} label={label} {...LOOK[id]} selected={value === id} onPress={() => onChange(value === id ? null : id)} />
      ))}
    </View>
  );
}

function CompanionCard({ label, emoji, line, selected, onPress }: { label: string; emoji: string; line: string; selected: boolean; onPress: () => void }) {
  const [scale] = useState(() => new Animated.Value(1));
  const spring = (to: number) => Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: to === 1 ? 8 : 0 }).start();
  return (
    <Animated.View style={{ width: '47.5%', flexGrow: 1, transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => spring(0.96)}
        onPressOut={() => spring(1)}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`${label}, ${line}`}
        style={{
          minHeight: 112,
          padding: 14,
          gap: 8,
          borderRadius: radius.lg,
          borderWidth: selected ? 1.5 : 1,
          borderColor: selected ? colors.action : colors.line,
          backgroundColor: selected ? colors.sageSoft : colors.card,
        }}
      >
        <View style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
          <Text style={{ fontSize: 22, lineHeight: 28 }} accessibilityElementsHidden importantForAccessibility="no">
            {emoji}
          </Text>
        </View>
        <View>
          <Text style={{ fontFamily: fonts.display, fontSize: 18, lineHeight: 23, color: colors.ink }}>{label}</Text>
          <Text variant="tiny">{line}</Text>
        </View>
        {selected && (
          <View style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.action, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.onDark, fontSize: 13, lineHeight: 16, fontFamily: fonts.sansBold }}>✓</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
