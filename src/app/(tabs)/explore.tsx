import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { BoardTile, Row, TrendCard } from '@/components/cards';
import { SearchIcon } from '@/components/Icons';
import { PhotoTile } from '@/components/Photo';
import { Text } from '@/components/Text';
import { Chip, Input, Screen, SectionHeader } from '@/components/ui';
import { colors, fonts, GUTTER } from '@/constants/theme';
import { board, collections, trendingThisMonth, type BoardItem } from '@/lib/sample';

/** Filter chips → which board tiles they show. */
const FILTERS: { id: string; label: string; match: (b: BoardItem) => boolean }[] = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'islands', label: 'Islands & beaches', match: (b) => /island|beach/i.test(b.sub) },
  { id: 'weekends', label: 'Weekends', match: (b) => /weekend/i.test(b.sub) || b.name === 'Weekends away' },
  { id: 'overnight', label: 'One night away', match: (b) => b.kind === 'One night away' },
  { id: 'destinations', label: 'Destinations', match: (b) => b.kind === 'place' },
  { id: 'stays', label: 'Stays', match: (b) => ['Riad', 'Villa', 'Ryokan', 'Hotel', 'B&B'].includes(b.kind) },
  { id: 'food', label: 'Food', match: (b) => b.kind === 'Eat' },
  { id: 'todo', label: 'Things to do', match: (b) => b.kind === 'Do' },
  { id: 'gems', label: 'Hidden gems', match: (b) => b.kind === 'Hidden gem' },
  { id: 'culture', label: 'Culture', match: (b) => b.kind.startsWith('Culture') },
];
const COLLECTION_FILTER: Record<string, string> = {
  islands: 'islands',
  weekends: 'weekends',
  overnight: 'overnight',
  gems: 'gems',
  culture: 'culture',
  stays: 'stays',
  food: 'food',
  todo: 'todo',
  destinations: 'destinations',
};

export default function Explore() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const shown = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter)!;
    return board.filter(
      (b) => f.match(b) && (!words.length || words.some((w) => `${b.name} ${b.sub} ${b.kind}`.toLowerCase().includes(w))),
    );
  }, [filter, words]);
  const left = shown.filter((_, i) => i % 2 === 0);
  const right = shown.filter((_, i) => i % 2 === 1);
  const heights = [230, 170, 200, 250, 180];

  return (
    <Screen tabBar>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 16 }}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Describe your perfect trip"
          accessibilityLabel="Describe your perfect trip"
          returnKeyType="search"
          icon={<SearchIcon color={colors.muted} />}
          style={{ paddingVertical: 14 }}
        />
      </View>
      <View style={{ marginTop: 12 }}>
        <Row gap={8}>
          {FILTERS.map((f) => (
            <Chip key={f.id} label={f.label} selected={filter === f.id} onPress={() => setFilter(f.id)} />
          ))}
        </Row>
      </View>

      <View style={{ paddingHorizontal: GUTTER, marginTop: 22, marginBottom: 14 }}>
        <AccentTitle before="Find your" accent="next" after="trip" />
      </View>
      <Row>
        {collections.map((c) => (
          <Pressable
            key={c.name}
            accessibilityRole="button"
            accessibilityLabel={`Show ${c.name}`}
            onPress={() => setFilter(COLLECTION_FILTER[c.filter] ?? 'all')}
          >
            <PhotoTile photo={c.photo} style={{ width: 120, height: 150 }}>
              <Text style={{ position: 'absolute', left: 10, right: 10, bottom: 10, fontFamily: fonts.display, fontSize: 17, lineHeight: 20, color: colors.onDark }}>
                {c.name}
              </Text>
            </PhotoTile>
          </Pressable>
        ))}
      </Row>

      <View style={{ marginTop: 28 }}>
        <SectionHeader>Trending this month</SectionHeader>
        <Row>
          {trendingThisMonth.map((t) => (
            <TrendCard key={t.slug} item={t} width={170} height={180} />
          ))}
        </Row>
      </View>

      <View style={{ paddingHorizontal: GUTTER, marginTop: 28, flexDirection: 'row', gap: 12 }}>
        {[left, right].map((col, c) => (
          <View key={c} style={{ flex: 1 }}>
            {col.map((b, i) => (
              <BoardTile key={`${b.name}-${i}`} item={b} height={heights[(i * 2 + c) % heights.length]} />
            ))}
          </View>
        ))}
      </View>
      {shown.length === 0 && (
        <Text variant="bodySoft" style={{ textAlign: 'center', marginTop: 24, paddingHorizontal: GUTTER }}>
          Nothing matches that yet. Try other words, or tap All.
        </Text>
      )}
    </Screen>
  );
}
