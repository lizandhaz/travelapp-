import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Pressable, View } from 'react-native';

import { colors, fonts, radius } from '@/constants/theme';
import { companionsLabel, tripPlace, type FriendTrip } from '@/lib/friendTrips';
import { fitLines, fitWordSize } from '@/lib/fit';
import { scoreWord } from '@/lib/score';
import { MonthPill } from './MonthPill';
import { PhotoFill, PhotoStamp, PhotoTile, Shade } from './Photo';
import { Star } from './Wordmark';
import { ScoreStamp } from './ScoreStamp';
import { Text } from './Text';

/**
 * A friend's trip as a postcard, the same template for everyone: a photo on the front, and on the
 * back their words on the left and the details on the right (score, who with, how long, where they
 * stayed and ate), split by the line down the middle like a real postcard. No To/From lines.
 * Tap it (or "Turn over") to flip it.
 */
export function PostcardCard({ trip, width, flipped, onFlip }: { trip: FriendTrip; width: number; flipped: boolean; onFlip: () => void }) {
  // The back sets the card's height (so a half-filled postcard is shorter); the front fills the same space.
  const minHeight = Math.round(width * 0.82);
  const [turn] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.spring(turn, { toValue: flipped ? 1 : 0, useNativeDriver: true, friction: 8, tension: 40 }).start();
  }, [flipped, turn]);
  const side = (from: string, to: string, visibleFirst: boolean) => ({
    backfaceVisibility: 'hidden' as const,
    opacity: turn.interpolate({ inputRange: [0, 0.5, 0.501, 1], outputRange: visibleFirst ? [1, 1, 0, 0] : [0, 0, 1, 1] }),
    transform: [{ perspective: 1200 }, { rotateY: turn.interpolate({ inputRange: [0, 1], outputRange: [from, to] }) }],
  });
  // Anything they didn't fill in is simply left out, and the card rearranges around what's there.
  const nights = trip.nights ? `${trip.nights} ${trip.nights === 1 ? 'night' : 'nights'}` : null;
  const ate = trip.eats[0]?.name ?? null;
  const tip = trip.tips[0]?.tip ?? null;
  const front = trip.photos[0] ?? null;
  const nameSize = fitWordSize(trip.place, width - 52, 46, 28);
  const stamp = trip.photos[1] ?? trip.photos[0] ?? null;
  const hasWords = !!trip.quote || !!tip;
  // No words? Show a big photo on the left instead (if there is one).
  const leftPhoto = !hasWords ? (trip.photos[2] ?? trip.photos[1] ?? trip.photos[0] ?? null) : null;
  const hasLeft = hasWords || !!leftPhoto;
  type DetailRow = { label: string; value: string; sub?: string; score?: number | null };
  const details: DetailRow[] = [];
  if (trip.companions) details.push({ label: 'Went', value: companionsLabel(trip.companions) });
  if (nights) details.push({ label: 'Stayed', value: nights });
  if (trip.stay) details.push({ label: 'Slept at', value: trip.stay.name, sub: trip.stay.type, score: trip.stay.score });
  if (ate) details.push({ label: 'Ate at', value: ate });

  return (
    <Pressable
      onPress={onFlip}
      accessibilityRole="button"
      accessibilityHint="Turns the postcard over"
      accessibilityLabel={
        flipped
          ? [
              `${trip.who}'s ${tripPlace(trip)} trip, ${trip.month}. Rated it ${trip.score.toFixed(1)} out of 10.`,
              trip.quote,
              ...details.map((d) => `${d.label} ${d.value}.`),
              tip && `Tip: ${tip}`,
            ]
              .filter(Boolean)
              .join(' ')
          : `Postcard from ${trip.who}: greetings from ${trip.place}, ${trip.score.toFixed(1)} out of 10. Tap to turn over`
      }
      style={{ width, minHeight }}
    >
      {/* Front: the photo */}
      <Animated.View style={[side('0deg', '180deg', true), { position: 'absolute', inset: 0, zIndex: 1, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.sand }]}>
        {front ? (
          <>
            <PhotoFill photo={front} label={trip.place} />
            <Shade strength={0.55} />
          </>
        ) : (
          // No photos: a coloured card in the palette instead.
          <LinearGradient colors={[colors.olive, colors.accentDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Star size={width * 0.28} color={colors.onDark} />
          </LinearGradient>
        )}
        <View style={{ position: 'absolute', inset: 10, borderWidth: 1.5, borderColor: colors.onDark, borderRadius: radius.sm, opacity: 0.85 }} />
        {/* Their score as the postage stamp, top right (owner, Nov 2026). */}
        <View style={{ position: 'absolute', top: 22, right: 22, transform: [{ rotate: '4deg' }] }}>
          <ScoreStamp score={trip.score} size="lg" label={`${trip.who}'s score`} />
        </View>
        <View style={{ position: 'absolute', left: 26, right: 26, bottom: 30 }}>
          <Text variant="label" style={{ color: colors.onDark, letterSpacing: 3 }}>
            Greetings from
          </Text>
          <Text {...fitLines(trip.place)} style={{ fontFamily: fonts.displayItalic, fontSize: nameSize, lineHeight: Math.round(nameSize * 1.13), color: colors.onDark }}>
            {trip.place}
          </Text>
        </View>
      </Animated.View>

      {/* Back: the trip, laid out like the back of a real postcard */}
      <Animated.View
        style={[
          side('180deg', '360deg', false),
          { minHeight, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 20, shadowColor: colors.ink, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ flex: 1, gap: 8 }}>
            <Text variant="label" style={{ letterSpacing: 4, color: colors.accentText }}>
              Postcard
            </Text>
            <View>
              <Text style={{ fontFamily: fonts.displayItalic, fontSize: 28, lineHeight: 33, color: colors.ink }}>{trip.place}</Text>
              {trip.region !== trip.place && <Text variant="small">{trip.region}</Text>}
            </View>
            <View style={{ flexDirection: 'row' }}>
              <MonthPill month={trip.month} />
            </View>
          </View>
          {!!stamp && <PhotoStamp photo={stamp} width={Math.round(width * 0.29)} height={Math.round(width * 0.35)} tilt={4} />}
        </View>

        <View style={{ flexGrow: 1, flexDirection: 'row', marginTop: 18 }}>
          {hasLeft && (
            <>
              {/* Left: in their words (or a big photo if they didn't write anything) */}
              <View style={{ flex: 1.05, paddingRight: 14, gap: 14 }}>
                {!!trip.quote && (
                  <Text numberOfLines={tip ? 5 : 9} style={{ fontFamily: fonts.displayItalic, fontSize: 18, lineHeight: 25, color: colors.ink }}>
                    “{trip.quote}”
                  </Text>
                )}
                {!!tip && (
                  <View style={{ gap: 4 }}>
                    <Text variant="label" style={{ fontSize: 10, color: colors.accentText }}>
                      ✦ Top tip
                    </Text>
                    <Text numberOfLines={trip.quote ? 5 : 9} style={{ fontFamily: fonts.displayItalic, fontSize: trip.quote ? 14.5 : 17, lineHeight: trip.quote ? 21 : 24, color: trip.quote ? colors.muted : colors.ink }}>
                      {tip}
                    </Text>
                  </View>
                )}
                {!!leftPhoto && <PhotoTile photo={leftPhoto} style={{ flex: 1, minHeight: Math.round(width * 0.5), borderRadius: radius.sm }} shade={false} />}
              </View>

              {/* The line down the middle of a postcard */}
              <View style={{ width: 1, backgroundColor: colors.line }} />
            </>
          )}

          {/* Right (or the whole width): the details */}
          <View style={{ flex: 1, paddingLeft: hasLeft ? 14 : 0, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ScoreStamp score={trip.score} size={hasLeft ? 'sm' : 'md'} label={`${trip.who}'s score`} />
              <Text style={{ flex: 1, fontFamily: fonts.displayItalic, fontSize: hasLeft ? 18 : 24, lineHeight: hasLeft ? 22 : 29, color: colors.accentText }}>{scoreWord(trip.score)}</Text>
            </View>
            <View style={hasLeft ? { gap: 12 } : { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 12 }}>
              {details.map((d) => (
                <View key={d.label} style={hasLeft ? undefined : { width: '47%' }}>
                  <Detail {...d} />
                </View>
              ))}
            </View>
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
