import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Dimensions, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { Row } from '@/components/cards';
import { PhotoTile } from '@/components/Photo';
import { PostcardCard } from '@/components/PostcardCard';
import { BackButton, Button, PageTitle, Screen, SectionHeader } from '@/components/ui';
import { GUTTER } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { getPostcard } from '@/lib/postcards';
import NotFound from '../+not-found';

/** One Postcard, opened from the Postcards list: the card itself (tap to turn over), their photos, and the place. */
export default function PostcardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [flipped, setFlipped] = useState(false);
  const card = getPostcard(id);
  if (!card) return <NotFound />;
  const width = Math.min(Dimensions.get('window').width, 480) - GUTTER * 2;
  const toName = profile?.name?.split(/\s+/)[0] || 'you';

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 12 }}>
        <BackButton />
      </View>
      <PageTitle label="Postcard">
        <AccentTitle before="From" accent={card.from} />
      </PageTitle>
      <View style={{ paddingHorizontal: GUTTER, gap: 14 }}>
        <PostcardCard card={card} toName={toName} width={width} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
        <Button title={flipped ? 'See the front' : 'Turn over to read'} kind="outline" onPress={() => setFlipped((f) => !f)} />
      </View>

      {card.photos.length > 1 && (
        <View style={{ marginTop: 26 }}>
          <SectionHeader>{`Photos from ${card.from}`}</SectionHeader>
          <Row gap={10}>
            {card.photos.map((p) => (
              <PhotoTile key={p} photo={p} style={{ width: 150, height: 190 }} shade={false} />
            ))}
          </Row>
        </View>
      )}

      {!!card.place && (
        <View style={{ paddingHorizontal: GUTTER, marginTop: 26 }}>
          <Button title={`More about ${card.place}`} kind="dark" onPress={() => router.push(`/place/${card.slug}`)} />
        </View>
      )}
    </Screen>
  );
}
