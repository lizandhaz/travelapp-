import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { WantToGoButton } from '@/components/lists';
import { InviteSheet } from '@/components/InviteSheet';
import { MonthPill } from '@/components/MonthPill';
import { PhotoFill, PhotoTile, Shade } from '@/components/Photo';
import { BestTimeChart, DoRow, EatRow, MoreAbout, PlaceFacts, PlaceMapSection, SaidList, StayRow, YourScore } from '@/components/place';
import { PhotoBadge, Row } from '@/components/cards';
import { ScoreStamp } from '@/components/ScoreStamp';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, Screen, SectionHeader } from '@/components/ui';
import { colors, fonts, GUTTER } from '@/constants/theme';
import { countryOf } from '@/lib/knownPlaces';
import { placeDetails } from '@/lib/placeDetails';
import { aboutPlace, getPlace } from '@/lib/sample';
import { stayKind } from '@/lib/placeFeatures';
import { tasteNote, useTaste } from '@/lib/taste';
import { useWantToGo } from '@/lib/useWantToGo';
import { recordPlaceView } from '@/lib/views';
import NotFound from '../+not-found';

/** A place page (sample content from the prototype for now; real place pages come in plan Step E). */
export default function PlaceScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const place = getPlace(slug);
  const country = place ? countryOf({ name: place.name, country: place.region.split(', ').pop() ?? '' }) : '';
  const wish = useWantToGo({ name: place?.name ?? '', country, slug });
  const taste = useTaste();
  const [inviting, setInviting] = useState(false);
  // Count this visit (and how long you stay) towards your matches when you leave the page.
  const placeName = place?.name ?? '';
  useFocusEffect(
    useCallback(() => {
      if (!placeName) return;
      const start = Date.now();
      return () => {
        recordPlaceView(slug, placeName, country, (Date.now() - start) / 1000);
      };
    }, [slug, placeName, country]),
  );
  if (!place) return <NotFound />;
  const detail = placeDetails[slug] ?? null;
  const { said, ideas } = aboutPlace(slug);
  const result = taste.forSlug(slug);
  const personal = taste.profile.evidence > 0;
  // Stays and places to eat with your score out of 10 (no % match), best first. The featured stay is your top one,
  // and its "Because…" is only shown when it's true for you.
  const stays = (detail?.stays ?? [])
    .map((s) => ({ ...s, score: personal ? taste.stayScoreFor(s) : s.score, match: null as number | null, because: null as string | null, featured: false }))
    .sort((a, b) => (personal ? (b.score ?? 0) - (a.score ?? 0) : 0));
  if (stays.length) {
    stays[0].featured = true;
    const kind = stayKind(stays[0].type);
    if (personal && (taste.profile.stayTypes[kind] ?? 0) > 0.2) stays[0].because = `Because you rate ${kind === 'B&B' ? 'B&Bs' : kind === 'Other' ? 'places like this' : `${kind.toLowerCase()}s`} highly`;
  }
  const eats = (detail?.eats ?? [])
    .map((e) => ({ ...e, score: personal ? taste.eatScoreFor(e) : e.score, match: null as number | null }))
    .sort((a, b) => (personal ? (b.score ?? 0) - (a.score ?? 0) : 0));
  const moreSaid = (detail?.said ?? []).filter((s) => !said.some((f) => f.who === s.who));
  const h = Math.min(Dimensions.get('window').width, 480) * 1.0;

  return (
    <Screen noTopInset>
      {/* The back button and the title stack, so a long title grows the header instead of running into the button. */}
      <View style={{ minHeight: h, paddingTop: insets.top + 10, paddingBottom: detail ? 48 : 22, justifyContent: 'space-between' }}>
        <PhotoFill photo={place.photo} label={place.name} />
        <Shade strength={0.55} />
        <View style={{ paddingHorizontal: GUTTER, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <BackButton onPhoto />
          {wish.ready && <WantToGoButton variant="photo" saved={wish.saved} busy={wish.busy} onPress={wish.toggle} />}
        </View>
        <View style={{ paddingHorizontal: GUTTER, marginTop: 24 }}>
          {!!detail?.kicker && (
            <Text variant="label" style={{ color: colors.onDark, opacity: 0.95 }}>
              {detail.kicker}
            </Text>
          )}
          <Text style={{ fontFamily: fonts.displayBold, fontSize: 46, lineHeight: 50, color: colors.onDark }}>{place.name}</Text>
          <Text variant="body" style={{ color: colors.onDark }}>
            {place.region}
          </Text>
        </View>
      </View>

      {!!result && <YourScore result={result} note={tasteNote(taste.profile, taste.usingFriends)} />}

      <View style={{ paddingHorizontal: GUTTER, marginTop: 12, flexDirection: 'row', gap: 10 }}>
        <WantToGoButton variant="block" saved={wish.saved} busy={wish.busy || !wish.ready} onPress={wish.toggle} style={{ flex: 1 }} />
        <Button title="I’ve been" kind="accent" style={{ flex: 1 }} onPress={() => router.navigate({ pathname: '/add', params: { place: place.name, country } })} />
      </View>
      {/* Once it's on Want to go: invite people you'd go with. */}
      {wish.saved && !!wish.itemId && (
        <Pressable onPress={() => setInviting(true)} accessibilityRole="button" accessibilityLabel={`Invite people to go to ${place.name} with you`} style={{ paddingHorizontal: GUTTER, marginTop: 8 }}>
          <Text variant="small" style={{ color: colors.accentText }}>
            On your Want to go. Going with someone? <Text variant="small" style={{ color: colors.accentText, fontFamily: fonts.sansSemiBold }}>Invite them →</Text>
          </Text>
        </Pressable>
      )}
      {inviting && !!wish.itemId && <InviteSheet itemId={wish.itemId} place={place.name} visible onClose={() => setInviting(false)} onDone={() => setInviting(false)} />}
      {!!wish.error && (
        <Text variant="small" style={{ paddingHorizontal: GUTTER, marginTop: 6, color: colors.accentText }}>
          {wish.error}
        </Text>
      )}

      {detail && (
        <View style={{ marginTop: 12 }}>
          <PlaceFacts detail={detail} />
        </View>
      )}

      <PlaceMapSection slug={slug} name={place.name} />

      {detail && <BestTimeChart detail={detail} />}

      {(said.length > 0 || moreSaid.length > 0) && (
        <View style={{ marginTop: 28 }}>
          <SectionHeader>What friends said</SectionHeader>
          <View style={{ paddingHorizontal: GUTTER, gap: 12 }}>
            {said.map((s) => (
              <Card key={s.who + s.month} style={{ padding: 16, gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Avatar face={s.face} name={s.who} size={34} />
                  <Text variant="strong" style={{ flex: 1 }}>
                    {s.who}
                  </Text>
                  <MonthPill month={s.month} />
                </View>
                {!!s.quote && <Text variant="quote">{s.quote}</Text>}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <ScoreStamp score={s.score} size="sm" label="Destination" />
                  <Text variant="small" style={{ flex: 1 }}>
                    Stayed at <Text variant="strong">{s.stayName}</Text> ({s.stayType})
                  </Text>
                  <ScoreStamp score={s.stayScore} size="sm" tone="olive" label={s.stayType} />
                </View>
              </Card>
            ))}
          </View>
          {moreSaid.length > 0 && (
            <View style={{ marginTop: said.length ? 16 : 0 }}>
              <SaidList items={moreSaid} />
            </View>
          )}
        </View>
      )}

      {stays.length > 0 && <StayRow stays={stays} at={{ name: place.name, country, slug }} />}
      {eats.length > 0 && <EatRow eats={eats} at={{ name: place.name, country, slug }} />}
      {!!detail?.dos.length && <DoRow dos={detail.dos} at={{ name: place.name, country, slug }} />}

      {!detail && ideas.length > 0 && (
        <View style={{ marginTop: 28 }}>
          <SectionHeader>Things friends loved here</SectionHeader>
          <Row gap={14}>
            {ideas.map((i) => (
              <View key={i.name} style={{ width: 200 }}>
                <PhotoTile photo={i.photo} style={{ width: 200, height: 150 }} shade={false}>
                  <PhotoBadge text={i.kind} style={{ position: 'absolute', top: 10, left: 10 }} />
                </PhotoTile>
                <Text variant="subheading" style={{ marginTop: 8 }}>
                  {i.name}
                </Text>
                <Text variant="tiny">{i.sub}</Text>
              </View>
            ))}
          </Row>
        </View>
      )}

      {detail && <MoreAbout name={place.name} detail={detail} />}

      <View style={{ paddingHorizontal: GUTTER, marginTop: 28, flexDirection: 'row', gap: 12 }}>
        <WantToGoButton variant="block" saved={wish.saved} busy={wish.busy || !wish.ready} onPress={wish.toggle} style={{ flex: 1 }} />
        <Button title="Save to a board" kind="outline" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/save', params: { place: place.name, country, slug } })} />
      </View>

      <Text variant="tiny" style={{ paddingHorizontal: GUTTER, marginTop: 18 }}>
        Sample content for now.{detail?.credits ? ` ${detail.credits}` : ''}
      </Text>
    </Screen>
  );
}
