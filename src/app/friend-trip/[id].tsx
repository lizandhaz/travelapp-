import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Row } from '@/components/cards';
import { BedIcon, BulbIcon, ChevronIcon, CompassIcon, ForkIcon } from '@/components/Icons';
import { MonthPill } from '@/components/MonthPill';
import { PhotoFill, PhotoTile, Shade } from '@/components/Photo';
import { SafetySheet } from '@/components/SafetySheet';
import { ScoreStamp } from '@/components/ScoreStamp';
import { Text } from '@/components/Text';
import { TripActions } from '@/components/TripActions';
import { BackButton, Button, Card, LoadFailed, Screen, SectionHeader } from '@/components/ui';
import { colors, fonts, GUTTER, radius, appWidth } from '@/constants/theme';
import { placeDetails } from '@/lib/placeDetails';
import { personHref } from '@/lib/samplePeople';
import { companionsLabel, photoCount, tripPic, tripPlace } from '@/lib/friendTrips';
import { useFriendTrip } from '@/lib/friendsFeed';
import { TripPeople } from '@/components/TripPeople';
import { scoreWord } from '@/lib/score';
import NotFound from '../+not-found';

/** A friend's trip, opened from Home's Friends feed: their score, photos, stay, food, things to do and tips. */
export default function FriendTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { trip, loading, error, retry } = useFriendTrip(id);
  const [safety, setSafety] = useState(false);
  if (!trip) return loading ? <Screen><ActivityIndicator color={colors.accent} style={{ marginTop: 120 }} /></Screen> : error ? <LoadFailed message={error} onRetry={retry} /> : <NotFound />;
  const pics = Array.from({ length: photoCount(trip) }, (_, i) => tripPic(trip, i)!);
  const isReal = !!trip.photoUrls;
  const { stay, eats, dos, tips } = trip;
  const hasPhoto = pics.length > 0;
  const h = appWidth() * (hasPhoto ? 0.95 : 0.7);

  return (
    <Screen noTopInset>
      {/* The back button and the title stack, so a long title grows the header instead of running into the button. */}
      <View style={{ minHeight: h, paddingTop: insets.top + 10, paddingBottom: 40, justifyContent: 'space-between' }}>
        {hasPhoto ? (
          <>
            <PhotoFill {...pics[0]} label={trip.place} />
            <Shade strength={0.6} />
          </>
        ) : (
          // No photos: soft blush with dark text, like a feed post without photos.
          <View style={{ position: 'absolute', inset: 0, backgroundColor: colors.blushSoft }} />
        )}
        <View style={{ paddingHorizontal: GUTTER, alignItems: 'flex-start' }}>
          <BackButton onPhoto={hasPhoto} />
        </View>
        <View style={{ paddingHorizontal: GUTTER, marginTop: 24 }}>
          <MonthPill month={trip.month} onPhoto={hasPhoto} />
          <Text style={{ fontFamily: fonts.displayBold, fontSize: 40, lineHeight: 44, color: hasPhoto ? colors.onDark : colors.ink, marginTop: 10 }}>
            {trip.who}’s {tripPlace(trip)} trip
          </Text>
          <Text variant="body" style={{ color: hasPhoto ? colors.onDark : colors.muted }}>
            {trip.region}
          </Text>
        </View>
      </View>

      <Card tone={hasPhoto ? "blush" : "white"} style={{ marginHorizontal: GUTTER, marginTop: -24, padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable disabled={!personHref(trip.who)} onPress={() => router.push(personHref(trip.who) as never)} accessibilityRole="link" accessibilityLabel={`${trip.who}. Open their profile`} hitSlop={6}>
            <Avatar face={trip.face} uri={trip.faceUrl} name={trip.who} size={40} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text variant="strong">{trip.who} rated it</Text>
            <Text style={{ fontFamily: fonts.displayItalic, fontSize: 17, color: colors.accentText }}>{scoreWord(trip.score)}</Text>
          </View>
          <ScoreStamp score={trip.score} size="md" label={`${trip.who}'s score for ${trip.place}`} />
        </View>
        {(!!trip.companions || !!trip.nights || trip.wouldReturn != null) && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {!!trip.companions && <Fact label="Went" value={companionsLabel(trip.companions)} />}
            {!!trip.nights && <Fact label="For" value={`${trip.nights} ${trip.nights === 1 ? 'night' : 'nights'}`} />}
            {trip.wouldReturn != null && <Fact label="Go back?" value={trip.wouldReturn ? 'Yes' : 'No'} />}
          </View>
        )}
        <TripPeople tripId={trip.id} />
        {!!trip.quote && <Text variant="quote">“{trip.quote}”</Text>}
        <TripActions id={trip.id} who={trip.who} place={trip.place} slug={trip.slug} country={trip.country} />
      </Card>

      {pics.length > 1 && (
        <View style={{ marginTop: 26 }}>
          <SectionHeader>Their photos</SectionHeader>
          <Row gap={10}>
            {pics.map((p, i) => (
              <PhotoTile key={i} {...p} style={{ width: 260, height: 325 }} shade={false} />
            ))}
          </Row>
        </View>
      )}

      {/* Their picks as one tidy guide (owner, Nov 2026: the mix of big cards, coloured blocks and headings looked clunky):
          every hotel, restaurant, thing to do and tip is the same kind of row, grouped under small labels. */}
      {(!!stay || eats.length > 0 || dos.length > 0 || tips.length > 0) && (
        <View style={{ marginTop: 28 }}>
          <SectionHeader>{`${trip.who}’s picks`}</SectionHeader>
          <Card tone="cream" style={{ marginHorizontal: GUTTER, paddingHorizontal: 16, paddingVertical: 4 }}>
            {[
              stay && {
                label: 'Where they stayed',
                rows: [
                  {
                    key: stay.name,
                    icon: <BedIcon color={colors.olive} size={18} />,
                    photo: stay.photo,
                    name: stay.name,
                    sub: [stay.type, stay.sub?.split(' · ').filter((x) => !/ stayed$/.test(x)).join(' · ')].filter(Boolean).join(' · '),
                    note: stay.wouldReturn == null ? null : stay.wouldReturn ? 'Would stay again' : 'Wouldn’t stay again',
                    score: stay.score,
                    href: trip.slug && placeDetails[trip.slug]?.stays.some((x) => x.name === stay.name) ? { pathname: '/stay/[slug]', params: { slug: trip.slug, name: stay.name } } : null,
                  },
                ],
              },
              eats.length > 0 && {
                label: 'Where they ate',
                rows: eats.map((e) => ({ key: e.name, icon: <ForkIcon color={colors.olive} size={18} />, photo: e.photo, name: e.name, sub: [e.what, e.price].filter(Boolean).join(' · '), note: null, score: e.score, href: null })),
              },
              dos.length > 0 && {
                label: 'What they did',
                rows: dos.map((d) => ({ key: d.name, icon: <CompassIcon color={colors.olive} size={18} />, photo: null, name: d.name, sub: d.what ?? '', note: d.gem ? '✦ Hidden gem' : null, score: null, href: null })),
              },
              tips.length > 0 && {
                label: 'Top tips',
                rows: tips.map((x) => ({ key: x.tip, icon: <BulbIcon color={colors.olive} size={18} />, photo: null, name: null, sub: x.tip, note: null, score: null, href: null })),
              },
            ]
              .filter((g) => !!g)
              .map((g, gi) => (
                <View key={g.label} style={{ paddingVertical: 12, borderTopWidth: gi ? 1 : 0, borderTopColor: colors.line, gap: 12 }}>
                  <Text variant="label">{g.label}</Text>
                  {g.rows.map((r) => {
                    const row = (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        {r.photo ? (
                          <PhotoTile photo={r.photo} style={{ width: 44, height: 44, borderRadius: radius.md }} shade={false} />
                        ) : (
                          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.sageSoft, alignItems: 'center', justifyContent: 'center', alignSelf: r.name ? 'center' : 'flex-start' }}>{r.icon}</View>
                        )}
                        <View style={{ flex: 1, gap: 2 }}>
                          {!!r.name && <Text variant="strong">{r.name}</Text>}
                          {!!r.sub && <Text variant={r.name ? 'small' : 'body'}>{r.sub}</Text>}
                          {!!r.note && (
                            <Text variant="small" style={{ color: colors.olive, fontFamily: fonts.sansSemiBold }}>
                              {r.note}
                            </Text>
                          )}
                        </View>
                        {r.score != null && <ScoreStamp score={r.score} size="sm" label={`${trip.who}'s score for ${r.name}`} />}
                        {!!r.href && <ChevronIcon color={colors.muted} />}
                      </View>
                    );
                    return r.href ? (
                      <Pressable key={r.key} onPress={() => router.push(r.href as never)} accessibilityRole="link" accessibilityLabel={`${r.name}. Open the stay`}>
                        {row}
                      </Pressable>
                    ) : (
                      <View key={r.key}>{row}</View>
                    );
                  })}
                </View>
              ))}
          </Card>
        </View>
      )}

      <View style={{ paddingHorizontal: GUTTER, marginTop: 30 }}>
        {!!trip.slug && <Button title={`More about ${trip.place}`} kind="outline" onPress={() => router.push(`/place/${trip.slug}`)} />}
        {isReal && 'ownerId' in trip ? (
          <Button title={`See ${trip.who}’s profile`} kind="outline" style={{ marginTop: 12 }} onPress={() => router.push({ pathname: '/user/[id]', params: { id: String(trip.ownerId) } })} />
        ) : (
          !!personHref(trip.who) && <Button title={`See ${trip.who}’s profile`} kind="outline" style={{ marginTop: 12 }} onPress={() => router.push(personHref(trip.who) as never)} />
        )}
      </View>
      {isReal && 'ownerId' in trip && (
        <Pressable onPress={() => setSafety(true)} accessibilityRole="button" hitSlop={8} style={{ alignSelf: 'center', marginTop: 22 }}>
          <Text variant="small" style={{ color: colors.muted, textDecorationLine: 'underline' }}>
            Report this trip or block {trip.who}
          </Text>
        </Pressable>
      )}
      {isReal && 'ownerId' in trip && (
        <SafetySheet target={{ userId: String(trip.ownerId), tripId: trip.id, name: trip.who }} visible={safety} onClose={() => setSafety(false)} onBlocked={() => router.back()} />
      )}
      {!isReal && (
        <Text variant="tiny" style={{ paddingHorizontal: GUTTER, marginTop: 14 }}>
          Sample trip for now. Your friends’ real trips arrive with friends.
        </Text>
      )}
    </Screen>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text variant="label" style={{ fontSize: 10 }}>
        {label}
      </Text>
      <Text variant="strong" style={{ fontSize: 14 }}>
        {value}
      </Text>
    </View>
  );
}
