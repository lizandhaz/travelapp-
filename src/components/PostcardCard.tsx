import { useEffect, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';

import { colors, fonts, radius } from '@/constants/theme';
import { companionsLabel, type FriendTrip } from '@/lib/friendTrips';
import { scoreWord } from '@/lib/score';
import { MonthPill } from './MonthPill';
import { PhotoFill, PhotoStamp, Shade } from './Photo';
import { ScoreStamp } from './ScoreStamp';
import { Text } from './Text';

/**
 * A friend's trip as a postcard, the same template for everyone: a photo on the front, and on the
 * back their score, who they went with, how long they stayed, where they stayed and ate, and a tip.
 * Tap it (or "Turn over") to flip it. `toName` is who it's addressed to (you).
 */
export function PostcardCard({ trip, toName, width, flipped, onFlip }: { trip: FriendTrip; toName: string; width: number; flipped: boolean; onFlip: () => void }) {
  const height = Math.round(width * 1.45);
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
  const nights = `${trip.nights} ${trip.nights === 1 ? 'night' : 'nights'}`;
  const ate = trip.eats[0]?.name ?? null;
  const tip = trip.tips[0]?.tip ?? trip.quote;

  return (
    <Pressable
      onPress={onFlip}
      accessibilityRole="button"
      accessibilityHint="Turns the postcard over"
      accessibilityLabel={
        flipped
          ? `${trip.who} went to ${trip.place}, ${trip.month}. Rated it ${trip.score.toFixed(1)} out of 10. ${companionsLabel(trip.companions)}, ${nights}.${trip.stay ? ` Stayed at ${trip.stay.name}.` : ''}${ate ? ` Ate at ${ate}.` : ''}${tip ? ` Tip: ${tip}` : ''}`
          : `Postcard from ${trip.who}: greetings from ${trip.place}. Tap to turn over`
      }
      style={{ width, height }}
    >
      {/* Front: the photo */}
      <Animated.View style={[side('0deg', '180deg', true), { borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.sand }]}>
        <PhotoFill photo={trip.photos[0] ?? null} label={trip.place} />
        <Shade strength={0.55} />
        <View style={{ position: 'absolute', inset: 10, borderWidth: 1.5, borderColor: colors.onDark, borderRadius: radius.sm, opacity: 0.85 }} />
        <View style={{ position: 'absolute', left: 26, right: 26, bottom: 30 }}>
          <Text variant="label" style={{ color: colors.onDark, letterSpacing: 3 }}>
            Greetings from
          </Text>
          <Text style={{ fontFamily: fonts.displayItalic, fontSize: 46, lineHeight: 52, color: colors.onDark }}>{trip.place}</Text>
        </View>
      </Animated.View>

      {/* Back: the trip */}
      <Animated.View
        style={[
          side('180deg', '360deg', false),
          { borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 20, gap: 14, shadowColor: colors.ink, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ gap: 4, paddingTop: 4 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 15, letterSpacing: 5, color: colors.ink }}>POSTCARD</Text>
            <View style={{ width: 70, height: 2, backgroundColor: colors.accent, borderRadius: 1 }} />
          </View>
          <PhotoStamp photo={trip.photos[1] ?? trip.photos[0] ?? null} width={66} height={78} tilt={4} />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 22, lineHeight: 27, color: colors.ink }}>
            {trip.who} went to <Text style={{ fontFamily: fonts.displayItalic, fontSize: 22, color: colors.ink }}>{trip.place}</Text>
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <MonthPill month={trip.month} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ScoreStamp score={trip.score} size="md" label={`${trip.who}'s score`} />
          <View style={{ flex: 1 }}>
            <Text variant="label" style={{ fontSize: 10 }}>
              Rated it
            </Text>
            <Text style={{ fontFamily: fonts.displayItalic, fontSize: 22, lineHeight: 27, color: colors.accentText }}>{scoreWord(trip.score)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 }}>
          <Fact label="Went" value={companionsLabel(trip.companions)} />
          <Fact label="For" value={nights} />
          {!!trip.stay && <Fact label="Stayed at" value={`${trip.stay.name}`} sub={trip.stay.type} score={trip.stay.score} />}
          {!!ate && <Fact label="Ate at" value={ate} />}
        </View>

        {!!tip && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 16, color: colors.accent }}>✦</Text>
            <Text numberOfLines={3} style={{ flex: 1, fontFamily: fonts.displayItalic, fontSize: 16, lineHeight: 23, color: colors.ink }}>
              {tip}
            </Text>
          </View>
        )}

        <View style={{ marginTop: 'auto', borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, gap: 6 }}>
          <AddressLine label="To" value={toName} />
          <AddressLine label="From" value={trip.who} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

function Fact({ label, value, sub, score }: { label: string; value: string; sub?: string; score?: number | null }) {
  return (
    <View style={{ width: '50%', paddingRight: 10, gap: 2 }}>
      <Text variant="label" style={{ fontSize: 10 }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text variant="strong" numberOfLines={2} style={{ flexShrink: 1, fontSize: 14, lineHeight: 19 }}>
          {value}
        </Text>
        {score != null && (
          <View style={{ backgroundColor: colors.olive, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 12, color: colors.onDark }}>{score.toFixed(1)}</Text>
          </View>
        )}
      </View>
      {!!sub && <Text variant="tiny">{sub}</Text>}
    </View>
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
