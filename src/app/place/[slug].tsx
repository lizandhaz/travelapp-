import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WantToGoButton } from '@/components/lists';
import { BestTimeSection } from '@/components/BestTime';
import { InviteSheet } from '@/components/InviteSheet';
import { MonthPill } from '@/components/MonthPill';
import { PhotoFill, PhotoTile, Shade } from '@/components/Photo';
import { DoRow, EatRow, FriendName, FriendTripLink, MoreAbout, PlaceFacts, PlaceMapSection, SaidList, StayRow, YourScore, InviteRow } from '@/components/place';
import { PhotoBadge, Row } from '@/components/cards';
import { ScoreStamp } from '@/components/ScoreStamp';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, Screen, SectionHeader } from '@/components/ui';
import { APP_NAME } from '@/constants/brand';
import { colors, fonts, GUTTER, appWidth, radius } from '@/constants/theme';
import { countryOf } from '@/lib/knownPlaces';
import { placeDetails } from '@/lib/placeDetails';
import { wouldGoBack } from '@/lib/friendTrips';
import { topicPicks, type TopicPick } from '@/lib/explore';
import { aboutPlace, getPlace } from '@/lib/sample';
import { stayKind } from '@/lib/placeFeatures';
import { tasteNote, useTaste } from '@/lib/taste';
import { useWantToGo } from '@/lib/useWantToGo';
import { hotelPrefsLine } from '@/lib/hotelPrefs';
import { recordPlaceView } from '@/lib/views';
import NotFound from '../+not-found';

/** A place page (sample content from the prototype for now; real place pages come in plan Step E). */
export default function PlaceScreen() {
  const { slug, topic } = useLocalSearchParams<{ slug: string; topic?: string }>();
  const insets = useSafeAreaInsets();
  const place = getPlace(slug);
  const country = place ? countryOf({ name: place.name, country: place.region.split(', ').pop() ?? '' }) : '';
  const wish = useWantToGo({ name: place?.name ?? '', country, slug });
  const taste = useTaste();
  const [inviting, setInviting] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
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
  // Opened from a search for a topic ("golf trips"): the page leads with that (owner, Nov 2026).
  const tailored = topicPicks(slug, topic);
  const { said, ideas } = aboutPlace(slug);
  const result = taste.forSlug(slug);
  const personal = taste.profile.evidence > 0;
  // Stays with your score out of 10 (no % match), best first, each with its main reason ("Ikos, a brand you love").
  // Hotel taste counts as soon as we know any (owner, Nov 2026: "luxury but not too expensive"), even with no trips yet.
  const stayPersonal = personal || taste.knowsHotels;
  const stays = (detail?.stays ?? [])
    .map((s) => {
      const why = stayPersonal ? taste.stayWhy(s, slug) : null;
      return { ...s, score: stayPersonal ? taste.stayScoreFor(s, slug) : s.score, match: null as number | null, because: why?.reason ?? null, against: !!why?.against, featured: false };
    })
    .sort((a, b) => (stayPersonal ? (b.score ?? 0) - (a.score ?? 0) : 0))
    // Stays that fit the search come first.
    .sort((a, b) => Number(!!tailored?.stayNames.includes(b.name)) - Number(!!tailored?.stayNames.includes(a.name)));
  if (stays.length) {
    // "We think you'd like it" only when it's true: a score of 8 or more for you.
    stays[0].featured = !stayPersonal || (stays[0].score ?? 0) >= 8;
    const kind = stayKind(stays[0].type);
    if (!stays[0].because && personal && (taste.profile.stayTypes[kind] ?? 0) > 0.2) stays[0].because = `Because you rate ${kind === 'B&B' ? 'B&Bs' : kind === 'Other' ? 'places like this' : `${kind.toLowerCase()}s`} highly`;
  }
  const eats = (detail?.eats ?? [])
    .map((e) => ({ ...e, score: personal ? taste.eatScoreFor(e) : e.score, match: null as number | null }))
    .sort((a, b) => (personal ? (b.score ?? 0) - (a.score ?? 0) : 0));
  // Things to do, best for you first once we know your taste (owner, Nov 2026: Krka's waterfalls for someone who loves nature).
  const dos = [...(detail?.dos ?? [])].sort((a, b) =>
    personal ? taste.forItem({ slug, kind: 'Do', name: b.name, friends: '' }).score - taste.forItem({ slug, kind: 'Do', name: a.name, friends: '' }).score : 0,
  );
  const moreSaid = (detail?.said ?? []).filter((s) => !said.some((f) => f.who === s.who));
  // Friends who've been, for the strip in the score card; the full reviews open in a sheet.
  const goBack = wouldGoBack(slug, [...said.map((s) => s.who), ...moreSaid.map((s) => s.who)]);
  const friendsHere =
    said.length + moreSaid.length > 0
      ? {
          people: [...said.map((s) => ({ who: s.who, face: s.face, score: s.score, quote: s.quote })), ...moreSaid.map((s) => ({ who: s.who, face: s.face, score: s.score, quote: s.quote }))],
          yes: goBack.yes,
          answered: goBack.answered,
          onOpen: () => setFriendsOpen(true),
        }
      : null;
  const h = appWidth() * 1.0;

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

      {!!result && <YourScore result={result} note={tasteNote(taste.profile, taste.usingFriends)} known={personal} friends={friendsHere} />}
      <Text variant="tiny" style={{ paddingHorizontal: GUTTER, marginTop: 8 }}>
        Example page: friends, scores and prices are made up while {APP_NAME} is in testing.
      </Text>

      <View style={{ paddingHorizontal: GUTTER, marginTop: 12, flexDirection: 'row', gap: 10 }}>
        <WantToGoButton variant="block" saved={wish.saved} busy={wish.busy || !wish.ready} onPress={wish.toggle} style={{ flex: 1 }} />
        <Button title="I’ve been" kind="accent" style={{ flex: 1 }} onPress={() => router.navigate({ pathname: '/add', params: { place: place.name, country } })} />
      </View>
      {/* Once it's on Want to go: invite people you'd go with. Only shown then (owner Nov 2026: the hidden line left a gap);
          it appears below the buttons, so the button you tapped never moves. */}
      {wish.ready && wish.saved && !!wish.itemId && (
        <InviteRow place={place.name} onInvite={() => setInviting(true)} />
      )}
      {inviting && !!wish.itemId && <InviteSheet itemId={wish.itemId} place={place.name} visible onClose={() => setInviting(false)} onDone={() => setInviting(false)} />}
      {!!wish.error && (
        <Text variant="small" style={{ paddingHorizontal: GUTTER, marginTop: 6, color: colors.accentText }}>
          {wish.error}
        </Text>
      )}

      {tailored && <TopicSection slug={slug} place={place.name} label={tailored.label} picks={tailored.picks} />}

      {detail && (
        <View style={{ marginTop: 20 }}>
          <PlaceFacts detail={detail} />
        </View>
      )}

      <PlaceMapSection slug={slug} name={place.name} />

      {detail && detail.bestMonths.length > 0 && (
        <View style={{ marginTop: 40 }}>
          <SectionHeader>Best time to go</SectionHeader>
          <BestTimeSection detail={detail} />
        </View>
      )}

      {/* Every friend's review, opened from the friends strip in the score card (owner, Nov 2026). */}
      <Modal visible={friendsOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setFriendsOpen(false)}>
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: GUTTER, paddingTop: 18, paddingBottom: 12 }}>
            <Text variant="heading" accessibilityRole="header">
              What friends said
            </Text>
            <Pressable onPress={() => setFriendsOpen(false)} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}>
              <Text variant="link">Close</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {(() => {
            const g = wouldGoBack(slug, [...said.map((s) => s.who), ...moreSaid.map((s) => s.who)]);
            return g.answered > 0 ? (
              <Text variant="strong" style={{ paddingHorizontal: GUTTER, marginTop: -4, marginBottom: 12, color: colors.olive }} accessibilityLabel={`${g.yes} of ${g.answered} friends would go back`}>
                ↺ {g.yes} of {g.answered} {g.answered === 1 ? 'friend' : 'friends'} would go back
              </Text>
            ) : null;
          })()}
          <View style={{ paddingHorizontal: GUTTER, gap: 12 }}>
            {said.map((s) => (
              <Card key={s.who + s.month} style={{ padding: 16, gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1, alignItems: 'flex-start' }}>
                    <FriendName who={s.who} face={s.face} size={34}>
                      <Text variant="strong">{s.who}</Text>
                    </FriendName>
                  </View>
                  <MonthPill month={s.month} />
                </View>
                {!!s.quote && <Text variant="quote">{s.quote}</Text>}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <ScoreStamp score={s.score} size="sm" label="Destination" />
                  <Text variant="small" style={{ flex: 1 }}>
                    Stayed at <Text variant="strong">{s.stayName}</Text> ({s.stayType})
                  </Text>
                </View>
                <FriendTripLink who={s.who} slug={slug} />
              </Card>
            ))}
          </View>
          {moreSaid.length > 0 && (
            <View style={{ marginTop: said.length ? 16 : 0 }}>
              <SaidList items={moreSaid} slug={slug} />
            </View>
          )}
          </ScrollView>
        </View>
      </Modal>

      {stays.length > 0 && <StayRow stays={stays} at={{ name: place.name, country, slug }} tune={{ line: hotelPrefsLine(taste.hotelPrefs) }} />}

      {!detail && ideas.length > 0 && (
        <View style={{ marginTop: 40 }}>
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

      {detail && (
        <MoreAbout
          name={place.name}
          detail={detail}
          eat={eats.length > 0 ? <EatRow eats={eats} at={{ name: place.name, country, slug }} /> : undefined}
          todo={dos.length ? <DoRow dos={dos} at={{ name: place.name, country, slug }} /> : undefined}
        />
      )}

      <View style={{ paddingHorizontal: GUTTER, marginTop: 28, flexDirection: 'row', gap: 12 }}>
        <WantToGoButton variant="block" saved={wish.saved} busy={wish.busy || !wish.ready} onPress={wish.toggle} style={{ flex: 1 }} />
        <Button title="Save to a board" kind="outline" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/save', params: { place: place.name, country, slug } })} />
      </View>
      {/* Say what happened right here, not only at the top of the page. */}
      {!!wish.error ? (
        <Text variant="small" style={{ paddingHorizontal: GUTTER, marginTop: 8, color: colors.accentText }}>
          {wish.error}
        </Text>
      ) : (
        <Text variant="small" style={{ paddingHorizontal: GUTTER, marginTop: 8, color: colors.olive, opacity: wish.saved ? 1 : 0 }} accessibilityElementsHidden={!wish.saved}>
          ✓ On your Want to go board
        </Text>
      )}

      <Text variant="tiny" style={{ paddingHorizontal: GUTTER, marginTop: 18 }}>
        Sample content for now.{detail?.credits ? ` ${detail.credits}` : ''}
      </Text>
    </Screen>
  );
}

/**
 * "Golf in the Algarve": what on this page fits the search you came from, at the top (owner, Nov 2026). Stays open
 * their own page. The × shows the page as normal; the rest of the page is still below either way.
 */
function TopicSection({ slug, place, label, picks }: { slug: string; place: string; label: string; picks: TopicPick[] }) {
  return (
    <View style={{ marginTop: 22, marginHorizontal: GUTTER, backgroundColor: colors.sageSoft, borderRadius: radius.lg, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="label">Picked for you</Text>
          <Text variant="heading" accessibilityRole="header">
            {label} in {place}
          </Text>
        </View>
        <Pressable onPress={() => router.setParams({ topic: '' })} accessibilityRole="button" accessibilityLabel={`Stop showing ${label.toLowerCase()} first`} hitSlop={12}>
          <Text style={{ fontSize: 22, lineHeight: 26, color: colors.muted }}>×</Text>
        </Pressable>
      </View>
      {picks.slice(0, 8).map((p) => {
        const card = (
          <View style={{ backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 12, gap: 3 }}>
            <Text variant="label" style={{ color: colors.olive }}>
              {p.label}
            </Text>
            <Text variant={p.kind === 'tip' ? 'body' : 'strong'}>{p.name}</Text>
            {!!p.what && <Text variant="small">{p.what}</Text>}
            {p.kind === 'stay' && (
              <Text variant="small" style={{ color: colors.accentText }}>
                See the stay →
              </Text>
            )}
          </View>
        );
        return p.kind === 'stay' ? (
          <Pressable key={`${p.kind}-${p.name}`} onPress={() => router.push({ pathname: '/stay/[slug]', params: { slug, name: p.name } })} accessibilityRole="link" accessibilityLabel={`${p.name}, ${p.label}. Open the stay`}>
            {card}
          </Pressable>
        ) : (
          <View key={`${p.kind}-${p.name}`} accessible accessibilityLabel={[p.label, p.name, p.what].filter(Boolean).join(', ')}>
            {card}
          </View>
        );
      })}
    </View>
  );
}
