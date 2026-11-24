import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { PlaceCard } from '@/components/cards';
import { Text } from '@/components/Text';
import { BackButton, PageTitle, Screen } from '@/components/ui';
import { GUTTER, appWidth } from '@/constants/theme';
import { getPlace } from '@/lib/sample';
import { boardsOf, getPerson } from '@/lib/samplePeople';
import NotFound from '../../+not-found';

/** One of a sample friend's boards: its places as a two-column grid, each opening its page. */
export default function PersonBoard() {
  const { who, i } = useLocalSearchParams<{ who: string; i: string }>();
  const person = getPerson(who);
  const board = person ? boardsOf(person)[Number(i) || 0] : null;
  if (!person || !board) return <NotFound />;
  const width = (appWidth() - GUTTER * 2 - 14) / 2;

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 14 }}>
        <BackButton />
      </View>
      <PageTitle label={`${person.name}’s board · ${board.slugs.length} places`}>
        <Text variant="title">{board.name}</Text>
      </PageTitle>
      <View style={{ paddingHorizontal: GUTTER, flexDirection: 'row', flexWrap: 'wrap', gap: 14, rowGap: 22 }}>
        {board.slugs.map((s) => {
          const p = getPlace(s);
          return p ? <PlaceCard key={s} item={{ slug: s, name: p.name, sub: p.region, photo: p.photo, score: p.score ?? undefined }} width={width} height={width * 1.1} /> : null;
        })}
      </View>
    </Screen>
  );
}
