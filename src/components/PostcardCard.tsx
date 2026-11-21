import { useEffect, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';

import { colors, fonts, radius } from '@/constants/theme';
import type { Postcard } from '@/lib/postcards';
import { PhotoFill, PhotoStamp, Shade } from './Photo';
import { ScoreStamp } from './ScoreStamp';
import { Text } from './Text';

/**
 * A digital postcard: a photo on the front and a handwritten-style message on the back.
 * Tap it (or "Turn over") to flip it. `toName` is who it's addressed to (you).
 */
export function PostcardCard({ card, toName, width, flipped, onFlip }: { card: Postcard; toName: string; width: number; flipped: boolean; onFlip: () => void }) {
  const height = Math.round(width * 1.32);
  const [turn] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.spring(turn, { toValue: flipped ? 1 : 0, useNativeDriver: true, friction: 8, tension: 40 }).start();
  }, [flipped, turn]);
  const side = (from: string, to: string, visibleFirst: boolean) => ({
    position: 'absolute' as const,
    inset: 0,
    backfaceVisibility: 'hidden' as const,
    opacity: turn.interpolate({ inputRange: [0, 0.5, 0.501, 1], outputRange: visibleFirst ? [1, 1, 0, 0] : [0, 0, 1, 1] }),
    transform: [{ perspective: 1200 }, { rotateY: turn.interpolate({ inputRange: [0, 1], outputRange: [from, to] }) }],
  });
  const front = card.place ? `Greetings from` : 'Hello from';
  const frontName = card.place || card.from;

  return (
    <Pressable
      onPress={onFlip}
      accessibilityRole="button"
      accessibilityHint="Turns the postcard over"
      accessibilityLabel={
        flipped
          ? `Back of the postcard. Dear ${toName}, ${card.message} ${card.signoff}`
          : `Postcard from ${card.from}: ${front} ${frontName}. Tap to read the message`
      }
      style={{ width, height }}
    >
      {/* Front: the photo */}
      <Animated.View style={[side('0deg', '180deg', true), { borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.sand }]}>
        <PhotoFill photo={card.photos[0] ?? null} label={frontName} />
        <Shade strength={0.55} />
        <View style={{ position: 'absolute', inset: 10, borderWidth: 1.5, borderColor: colors.onDark, borderRadius: radius.sm, opacity: 0.85 }} />
        <View style={{ position: 'absolute', left: 26, right: 26, bottom: 30 }}>
          <Text variant="label" style={{ color: colors.onDark, letterSpacing: 3 }}>
            {front}
          </Text>
          <Text style={{ fontFamily: fonts.displayItalic, fontSize: 46, lineHeight: 52, color: colors.onDark }}>{frontName}</Text>
        </View>
      </Animated.View>

      {/* Back: the message */}
      <Animated.View
        style={[
          side('180deg', '360deg', false),
          { borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 20, shadowColor: colors.ink, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ gap: 4, paddingTop: 4 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 15, letterSpacing: 5, color: colors.ink }}>POSTCARD</Text>
            <View style={{ width: 70, height: 2, backgroundColor: colors.accent, borderRadius: 1 }} />
          </View>
          <PhotoStamp photo={card.photos[0] ?? null} width={74} height={88} tilt={4} />
        </View>

        <View style={{ flex: 1, marginTop: 14, gap: 10 }}>
          <Text style={{ fontFamily: fonts.displayItalic, fontSize: 21, lineHeight: 26, color: colors.ink }}>Dear {toName},</Text>
          <Text style={{ fontFamily: fonts.displayItalic, fontSize: width < 340 ? 16 : 17.5, lineHeight: width < 340 ? 23 : 26, color: colors.ink }}>{card.message}</Text>
          <Text style={{ fontFamily: fonts.displayItalic, fontSize: 21, lineHeight: 26, color: colors.accentText, textAlign: 'right', marginTop: 4 }}>{card.signoff}</Text>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 6 }}>
            <AddressLine label="To" value={toName} />
            <AddressLine label="From" value={card.from} />
          </View>
          {card.score != null && <ScoreStamp score={card.score} size="sm" label={`${card.from}'s score`} />}
        </View>
      </Animated.View>
    </Pressable>
  );
}

function AddressLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 3 }}>
      <Text variant="label" style={{ fontSize: 10, width: 38 }}>
        {label}
      </Text>
      <Text style={{ fontFamily: fonts.displayItalic, fontSize: 16, color: colors.ink }}>{value}</Text>
    </View>
  );
}
