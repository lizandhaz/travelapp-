import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { PlaceCard, Row } from '@/components/cards';
import { ItemCard, useSortedForYou, useSortedItems } from '@/components/explore';
import { Text } from '@/components/Text';
import { BackButton, PageTitle, Screen, SectionHeader } from '@/components/ui';
import { appWidth, GUTTER } from '@/constants/theme';
import { tastePage } from '@/lib/explore';
import { TASTE_LABELS } from '@/lib/taste';

/** A taste's name in a sentence: "food", "city breaks", "the outdoors". */
const inSentence = (label: string) => label.charAt(0).toLowerCase() + label.slice(1);

/**
 * One page for every taste (owner, Nov 2026: tap a tag under "Your taste"): /taste/food, /taste/ski, /taste/wellness…
 * It works for any holiday type the app knows, now or later. Spots that fit (for tastes that are also search topics,
 * like food, skiing or spas) in a sideways row, then the places, best for you first, each opening tailored to the taste.
 */
export default function TasteScreen() {
  const { tag = '' } = useLocalSearchParams<{ tag: string }>();
  const label = TASTE_LABELS[tag] ?? tag.charAt(0).toUpperCase() + tag.slice(1);
  const page = useMemo(() => tastePage(tag), [tag]);
  const places = useSortedForYou(page.places);
  const spots = useSortedItems(page.spots).slice(0, 12);
  const width = (appWidth() - GUTTER * 2 - 14) / 2;

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 14 }}>
        <BackButton />
      </View>
      <PageTitle label={`Your taste · ${places.length} ${places.length === 1 ? 'place' : 'places'}`}>
        <AccentTitle before="For your love of" accent={inSentence(label)} />
      </PageTitle>

      {!places.length ? (
        <Text variant="body" style={{ paddingHorizontal: GUTTER }}>
          We don’t have places for {inSentence(label)} yet. More are on the way.
        </Text>
      ) : (
        <>
          {spots.length > 0 && (
            <View style={{ marginBottom: 28 }}>
              <SectionHeader>
                <AccentTitle before="Spots" accent="for you" variant="heading" />
              </SectionHeader>
              <Row gap={14}>
                {spots.map((i) => (
                  <ItemCard key={i.key} item={i} width={200} />
                ))}
              </Row>
            </View>
          )}
          <SectionHeader>
            <AccentTitle before="Best places" accent="for you" variant="heading" />
          </SectionHeader>
          <View style={{ paddingHorizontal: GUTTER, flexDirection: 'row', flexWrap: 'wrap', gap: 14, rowGap: 22 }}>
            {places.map((p) => (
              <PlaceCard key={p.slug} item={p} width={width} height={width * 1.15} />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
