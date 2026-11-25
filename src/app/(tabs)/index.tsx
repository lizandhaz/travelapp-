import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { FeedCard, Row } from '@/components/cards';
import { CollectionTile } from '@/components/explore';
import { AddPersonIcon, SendIcon } from '@/components/Icons';
import { PhotoStamp } from '@/components/Photo';
import { ScoreStamp } from '@/components/ScoreStamp';
import { Text } from '@/components/Text';
import { Button, Card, ExampleTag, IconCircle, Screen, SectionHeader } from '@/components/ui';
import { Wordmark } from '@/components/Wordmark';
import { colors, fonts, GUTTER, appWidth } from '@/constants/theme';
import { collectionTiles } from '@/lib/explore';
import { rankValue } from '@/lib/match';
import { friendsFeed, places, rows } from '@/lib/sample';
import { refreshUnread, useUnreadPostcards } from '@/lib/postcardsLive';
import { useTaste } from '@/lib/taste';
import { feedItemFor, fetchFriendsTrips, type RealFriendTrip } from '@/lib/friendsFeed';
import { fitLines, fitWordSize } from '@/lib/fit';
import { getStartTaste } from '@/lib/startTaste';

/**
 * Home: top picks for you, collections to dip into, then what your friends rated
 * (newest first). Everything else lives in Explore.
 */
export default function Home() {
  const width = appWidth();
  const t = useTaste();
  const unreadPostcards = useUnreadPostcards();
  const personal = t.profile.evidence > 0;
  // Friends' real trips, refreshed each time Home comes back into view.
  const [realFeed, setRealFeed] = useState<RealFriendTrip[] | null>(null);
  useFocusEffect(
    useCallback(() => {
      let live = true;
      fetchFriendsTrips()
        .then((r) => live && setRealFeed(r))
        .catch(() => {}); // keep what we had (or the sample feed)
      refreshUnread().catch(() => {}); // the paper plane's count
      return () => {
        live = false;
      };
    }, []),
  );

  // Top picks: your best matches that are new to you (not been, not saved). Before we
  // know your taste, the prototype's picks.
  const picks = personal
    ? places
        .filter((p) => p.score != null && !t.forSlug(p.slug)?.yours && !t.isSaved(p.slug))
        .map((p) => ({ slug: p.slug, name: p.name, sub: p.region, photo: p.photo, r: t.forSlug(p.slug)! }))
        .sort((a, b) => rankValue(b.r) - rankValue(a.r))
        .slice(0, 8)
        // Shown highest score first (owner, Nov 2026); the best matches above are the ones chosen.
        .sort((a, b) => b.r.score - a.r.score)
    : rows.picked
        .filter((p) => !!p.photo)
        .map((p) => ({ slug: p.slug, name: p.name, sub: p.sub, photo: p.photo, r: t.forSlug(p.slug) }))
        .sort((a, b) => (b.r?.score ?? 0) - (a.r?.score ?? 0));

  const collections = useMemo(() => collectionTiles(), []);

  // New here with nothing to go on? Ask what they love first (app/setup.tsx), once.
  const ready = t.ready;
  useEffect(() => {
    if (!ready || personal) return;
    let live = true;
    getStartTaste().then((s) => live && !s.done && router.push('/setup'));
    return () => {
      live = false;
    };
  }, [ready, personal]);


  const cardW = Math.round((width - GUTTER * 2) * 0.78);
  const cardH = Math.round(cardW * 1.22);

  return (
    <Screen tabBar>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 16, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Wordmark />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
          <IconCircle label="Find friends" onPress={() => router.push('/people')}>
            <AddPersonIcon color={colors.ink} />
          </IconCircle>
          <IconCircle label="Postcards" badge={unreadPostcards} onPress={() => router.push('/postcards')}>
            <SendIcon color={colors.ink} />
          </IconCircle>
        </View>
      </View>

      {/* Top picks for you */}
      <View style={{ marginTop: 26 }}>
        <SectionHeader action="Explore" onAction={() => router.navigate('/explore')}>
          {personal ? <AccentTitle before="Top picks for" accent="you" variant="heading" /> : <AccentTitle before="Popular" accent="picks" variant="heading" />}
        </SectionHeader>
        <Row gap={14}>
          {picks.map((p) => {
            const score = p.r?.score ?? null;
            // The name shrinks so its longest word fits beside the score stamp (no "Zanziba / r").
            // Room beside the stamp: card minus frame and padding (about 44) minus the stamp and gap (68).
            const nameSize = fitWordSize(p.name, cardW - 44 - 68, 30, 18);
            return (
              <Pressable
                key={p.slug}
                onPress={() => router.push(`/place/${p.slug}`)}
                accessibilityRole="link"
                accessibilityLabel={`${p.name}, ${p.sub}${score != null ? `, ${score.toFixed(1)} out of 10` : ''}`}
                style={{ width: cardW }}
              >
                <PhotoStamp photo={p.photo} width={cardW} height={cardH}>
                  <View style={{ position: 'absolute', left: 20, right: 20, bottom: 20, flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text {...fitLines(p.name)} style={{ fontFamily: fonts.displayBold, fontSize: nameSize, lineHeight: Math.round(nameSize * 1.12), color: colors.onDark }}>{p.name}</Text>
                      <Text variant="label" style={{ color: colors.onDark, marginTop: 4 }} numberOfLines={1}>
                        {p.sub}
                      </Text>
                    </View>
                    {score != null && <ScoreStamp score={score} size="md" />}
                  </View>
                </PhotoStamp>
              </Pressable>
            );
          })}
        </Row>
      </View>

      {/* Collections */}
      <View style={{ marginTop: 30 }}>
        <SectionHeader action="See all" onAction={() => router.navigate('/explore')}>
          <AccentTitle before="Dip into" accent="collections" variant="heading" />
        </SectionHeader>
        <Row>
          {collections.map((c) => (
            <CollectionTile key={c.id} id={c.id} title={c.title} photo={c.photo} count={c.count} />
          ))}
        </Row>
      </View>

      {/* A line across, then what friends rated, newest first */}
      <View style={{ height: 1, backgroundColor: colors.line, marginHorizontal: GUTTER, marginTop: 34 }} />
      {realFeed && realFeed.length > 0 ? (
        <View style={{ marginTop: 28 }}>
          <SectionHeader action="Find friends" onAction={() => router.push('/people')}>
            <AccentTitle before="From your" accent="friends" variant="heading" />
          </SectionHeader>
          {/* Real trips from people you follow, newest first. */}
          <View style={{ paddingHorizontal: GUTTER, gap: 22 }}>
            {realFeed.map((t) => (
              <FeedCard key={t.id} item={feedItemFor(t)} />
            ))}
          </View>
        </View>
      ) : (
        // No friends yet (owner, Nov 2026): say so and help them find some, then example trips clearly marked as examples.
        <View style={{ marginTop: 28 }}>
          <SectionHeader>
            <AccentTitle before="From your" accent="friends" variant="heading" />
          </SectionHeader>
          <View style={{ paddingHorizontal: GUTTER, gap: 22 }}>
            <Card tone="cream" style={{ padding: 18, gap: 12 }}>
              <Text variant="subheading">Your friends’ trips show here</Text>
              <Text variant="small">Follow friends to see where they loved staying. Your scores work without them too.</Text>
              <Button title="Find friends" kind="accent" onPress={() => router.push('/people')} />
            </Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <Text variant="label">Meanwhile, some example trips</Text>
              <ExampleTag />
            </View>
            {friendsFeed.map((f) => (
              <FeedCard key={`${f.who}-${f.place}`} item={f} />
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}
