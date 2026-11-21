import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Dimensions, View } from 'react-native';

import { PlaceCard } from '@/components/cards';
import { ItemCard, useSortedForYou, useSortedItems } from '@/components/explore';
import { Text } from '@/components/Text';
import { BackButton, PageTitle, Screen } from '@/components/ui';
import { GUTTER } from '@/constants/theme';
import { itemCollections, placeCollections, placesIn } from '@/lib/explore';
import NotFound from '../+not-found';

/** One Explore collection: every place (or thing) in it, best for you first, as a two-column grid. */
export default function CollectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const placeCol = useMemo(() => placeCollections().find((c) => c.id === id), [id]);
  const itemCol = itemCollections.find((c) => c.id === id);
  const places = useSortedForYou(useMemo(() => (placeCol ? placesIn(placeCol) : []), [placeCol]));
  const items = useSortedItems(useMemo(() => (itemCol ? itemCol.items() : []), [itemCol]));
  if (!placeCol && !itemCol) return <NotFound />;

  const width = (Math.min(Dimensions.get('window').width, 480) - GUTTER * 2 - 14) / 2;
  const count = placeCol ? places.length : items.length;
  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 14 }}>
        <BackButton />
      </View>
      <PageTitle label={`${count} ${placeCol ? (count === 1 ? 'place' : 'places') : 'ideas'} · best for you first`}>
        <Text variant="title">{placeCol?.title ?? itemCol!.title}</Text>
      </PageTitle>
      <View style={{ paddingHorizontal: GUTTER, flexDirection: 'row', flexWrap: 'wrap', gap: 14, rowGap: 22 }}>
        {placeCol
          ? places.map((p) => <PlaceCard key={p.slug} item={p} width={width} height={width * 1.15} />)
          : items.map((i) => <ItemCard key={i.key} item={i} width={width} />)}
      </View>
    </Screen>
  );
}
