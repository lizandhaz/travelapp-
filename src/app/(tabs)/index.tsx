import { router } from 'expo-router';
import { useMemo } from 'react';
import { Dimensions, Pressable, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { FeedCard, Row } from '@/components/cards';
import { CollectionTile } from '@/components/explore';
import { AddPersonIcon, SendIcon } from '@/components/Icons';
import { PhotoStamp } from '@/components/Photo';
import { ScoreStamp } from '@/components/ScoreStamp';
import { Text } from '@/components/Text';
import { IconCircle, Screen, SectionHeader } from '@/components/ui';
import { Wordmark } from '@/components/Wordmark';
import { colors, fonts, GUTTER } from '@/constants/theme';
import { itemCollections, placeCollections, placesIn } from '@/lib/explore';
import { rankValue } from '@/lib/match';
import { friendsFeed, PHOTO_CREDITS, places, rows, unreadPostcardCount } from '@/lib/sample';
import { useTaste } from '@/lib/taste';
import { fitWordSize } from '@/lib/fit';

/**
 * Home: top picks for you, collections to dip into, then what your friends rated
 * (newest first). Everything else lives in Explore.
 */
export default function Home() {
  const width = Math.min(Dimensions.get('window').width, 480);
  const t = useTaste();
  const personal = t.profile.evidence > 0;

  // Top picks: your best matches that are new to you (not been, not saved). Before we
  // know your taste, the prototype's picks.
  const picks = personal
    ? places
        .filter((p) => p.score != null && !t.forSlug(p.slug)?.yours && !t.isSaved(p.slug))
        .map((p) => ({ slug: p.slug, name: p.name, sub: p.region, photo: p.photo, r: t.forSlug(p.slug)! }))
        .sort((a, b) => rankValue(b.r) - rankValue(a.r))
        .slice(0, 8)
    : rows.picked.map((p) => ({ slug: p.slug, name: p.name, sub: p.sub, photo: p.photo, r: t.forSlug(p.slug) }));

  const collections = useMemo(
    () =>
      [
        ...placeCollections().map((c) => ({ id: c.id, title: c.title, photos: placesIn(c).map((p) => p.photo) })),
        ...itemCollections.map((c) => ({ id: c.id, title: c.title, photos: c.items().map((i) => i.photo) })),
      ].filter((c) => c.photos.length >= 3),
    [],
  );

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
          <IconCircle label="Postcards" badge={unreadPostcardCount} onPress={() => router.push('/postcards')}>
            <SendIcon color={colors.ink} />
          </IconCircle>
        </View>
      </View>

      {/* Top picks for you */}
      <View style={{ marginTop: 26 }}>
        <SectionHeader action="Explore" onAction={() => router.navigate('/explore')}>
          <AccentTitle before="Top picks for" accent="you" variant="heading" />
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
                      <Text style={{ fontFamily: fonts.displayBold, fontSize: nameSize, lineHeight: Math.round(nameSize * 1.12), color: colors.onDark }}>{p.name}</Text>
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
            <CollectionTile key={c.id} id={c.id} title={c.title} photo={c.photos[0]} count={c.photos.length} />
          ))}
        </Row>
      </View>

      {/* A line across, then what friends rated, newest first */}
      <View style={{ height: 1, backgroundColor: colors.line, marginHorizontal: GUTTER, marginTop: 34 }} />
      <View style={{ marginTop: 28 }}>
        <SectionHeader action="Find friends" onAction={() => router.push('/people')}>
          <AccentTitle before="From your" accent="friends" variant="heading" />
        </SectionHeader>
        <View style={{ paddingHorizontal: GUTTER, gap: 22 }}>
          {friendsFeed.map((f) => (
            <FeedCard key={`${f.who}-${f.place}`} item={f} />
          ))}
          <Text variant="tiny">Preview: these are sample trips. Your friends’ real trips arrive soon.</Text>
        </View>
      </View>

      <Text variant="tiny" style={{ paddingHorizontal: GUTTER, fontSize: 10, lineHeight: 14, marginTop: 28 }}>
        {PHOTO_CREDITS}
      </Text>
    </Screen>
  );
}
