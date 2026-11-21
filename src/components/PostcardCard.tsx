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
 * back their words on the left and the details on the right (score, who with, how long, where they
 * stayed and ate), split by the line down the middle like a real postcard. No To/From lines.
 * Tap it (or "Turn over") to flip it.
 */
export function PostcardCard({ trip, width, flipped, onFlip }: { trip: FriendTrip; width: number; flipped: boolean; onFlip: () => void }) {
  const height = Math.round(width * 1.3);
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

      {/* Back: the trip, laid out like the back of a real postcard */}
      <Animated.View
        style={[
          side('180deg', '360deg', false),
          { borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 20, shadowColor: colors.ink, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ flex: 1, gap: 8 }}>
            <Text variant="label" style={{ letterSpacing: 4, color: colors.accentText }}>
              Postcard
            </Text>
            <Text style={{ fontFamily: fonts.display, fontSize: 24, lineHeight: 29, color: colors.ink }}>
              {trip.who} went to{' '}
              <Text style={{ fontFamily: fonts.displayItalic, fontSize: 24, lineHeight: 29, color: colors.ink }}>{trip.place}</Text>
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <MonthPill month={trip.month} />
            </View>
          </View>
          <PhotoStamp photo={trip.photos[1] ?? trip.photos[0] ?? null} width={70} height={84} tilt={4} />
        </View>

        <View style={{ flex: 1, flexDirection: 'row', marginTop: 18 }}>
          {/* Left: in their words */}
          <View style={{ flex: 1.05, paddingRight: 14, gap: 14 }}>
            {!!trip.quote && (
              <Text numberOfLines={6} style={{ fontFamily: fonts.displayItalic, fontSize: 18, lineHeight: 25, color: colors.ink }}>
                “{trip.quote}”
              </Text>
            )}
            {!!tip && tip !== trip.quote && (
              <View style={{ gap: 4 }}>
                <Text variant="label" style={{ fontSize: 10, color: colors.accentText }}>
                  ✦ Top tip
                </Text>
                <Text numberOfLines={6} style={{ fontFamily: fonts.displayItalic, fontSize: 14.5, lineHeight: 21, color: colors.muted }}>
                  {tip}
                </Text>
              </View>
            )}
          </View>

          {/* The line down the middle of a postcard */}
          <View style={{ width: 1, backgroundColor: colors.line }} />

          {/* Right: the details */}
          <View style={{ flex: 1, paddingLeft: 14, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ScoreStamp score={trip.score} size="sm" label={`${trip.who}'s score`} />
              <Text style={{ flex: 1, fontFamily: fonts.displayItalic, fontSize: 18, lineHeight: 22, color: colors.accentText }}>{scoreWord(trip.score)}</Text>
            </View>
            <Detail label="Went" value={companionsLabel(trip.companions)} />
            <Detail label="Stayed" value={nights} />
            {!!trip.stay && <Detail label="Slept at" value={trip.stay.name} sub={trip.stay.type} score={trip.stay.score} />}
            {!!ate && <Detail label="Ate at" value={ate} />}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

function Detail({ label, value, sub, score }: { label: string; value: string; sub?: string; score?: number | null }) {
  return (
    <View style={{ gap: 1, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 8 }}>
      <Text variant="label" style={{ fontSize: 9.5 }}>
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
