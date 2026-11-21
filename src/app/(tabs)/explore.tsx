import { useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { BoardTile, Row, TrendCard } from '@/components/cards';
import { CollectionTile } from '@/components/explore';
import { SearchIcon } from '@/components/Icons';
import { Text } from '@/components/Text';
import { Chip, Input, Screen, SectionHeader } from '@/components/ui';
import { colors, GUTTER } from '@/constants/theme';
import { exploreFeed, itemCollections, placeCollections, placesIn, type FeedItem } from '@/lib/explore';
import { trendingThisMonth } from '@/lib/sample';

const STAYS = ['Riad', 'Villa', 'Ryokan', 'Hotel', 'B&B', 'Airbnb', 'Other'];

/** Filter chips → which feed tiles they show. */
const FILTERS: { id: string; label: string; match: (b: FeedItem) => boolean }[] = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'islands', label: 'Islands & beaches', match: (b) => /island|beach/i.test(b.sub) },
  { id: 'weekends', label: 'Weekends', match: (b) => /weekend/i.test(b.sub) },
  { id: 'overnight', label: 'One night away', match: (b) => b.kind === 'One night away' || /one night/i.test(b.sub) },
  { id: 'destinations', label: 'Destinations', match: (b) => b.kind === 'place' },
  { id: 'stays', label: 'Stays', match: (b) => STAYS.includes(b.kind) },
  { id: 'food', label: 'Food', match: (b) => b.kind === 'Eat' },
  { id: 'todo', label: 'Things to do', match: (b) => b.kind === 'Do' },
  { id: 'gems', label: 'Hidden gems', match: (b) => b.kind === 'Hidden gem' },
  { id: 'culture', label: 'Culture', match: (b) => b.kind.startsWith('Culture') },
];

/** How many tiles to show at first, and how many more load as you near the bottom. */
const PAGE = 60;

/**
 * Explore: search, filter chips, "Find your next trip" collection tiles (each opens its
 * collection), Trending this month, and a long two-column feed of places and things to
 * stay, eat, do and see, which keeps loading as you scroll.
 */
export default function Explore() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [limit, setLimit] = useState(PAGE);

  const feed = useMemo(() => exploreFeed(), []);
  const collections = useMemo(
    () => [
      ...placeCollections().map((c) => ({ id: c.id, title: c.title, items: placesIn(c).map((p) => p.photo) })),
      ...itemCollections.map((c) => ({ id: c.id, title: c.title, items: c.items().map((i) => i.photo) })),
    ].filter((c) => c.items.length >= 3),
    [],
  );

  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const shown = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter)!;
    return feed.filter((b) => f.match(b) && (!words.length || words.some((w) => `${b.name} ${b.sub} ${b.kind}`.toLowerCase().includes(w))));
  }, [feed, filter, words]);
  const visible = shown.slice(0, limit);
  const left = visible.filter((_, i) => i % 2 === 0);
  const right = visible.filter((_, i) => i % 2 === 1);
  const heights = [230, 170, 200, 250, 180];

  const pick = (id: string) => {
    setFilter(id);
    setLimit(PAGE);
  };

  return (
    <Screen
      tabBar
      scrollEventThrottle={200}
      onScroll={({ nativeEvent: { layoutMeasurement, contentOffset, contentSize } }) => {
        // Load the next batch on its own when you're within about two screens of the bottom.
        if (shown.length > limit && contentOffset.y + layoutMeasurement.height > contentSize.height - layoutMeasurement.height * 2) {
          setLimit((l) => Math.min(l + PAGE, shown.length));
        }
      }}
    >
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 16 }}>
        <Input
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            setLimit(PAGE);
          }}
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
            <Chip key={f.id} label={f.label} selected={filter === f.id} onPress={() => pick(f.id)} />
          ))}
        </Row>
      </View>

      <View style={{ paddingHorizontal: GUTTER, marginTop: 22, marginBottom: 14 }}>
        <AccentTitle before="Find your" accent="next" after="trip" />
      </View>
      <Row>
        {collections.map((c) => (
          <CollectionTile key={c.id} id={c.id} title={c.title} photo={c.items[0]} count={c.items.length} />
        ))}
      </Row>

      <View style={{ marginTop: 28, paddingVertical: 22, backgroundColor: colors.blushSoft }}>
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
              <BoardTile key={`${b.slug}-${b.name}`} item={b} height={heights[(i * 2 + c) % heights.length]} />
            ))}
          </View>
        ))}
      </View>
      {shown.length > limit && (
        <View style={{ paddingVertical: 18, alignItems: 'center' }} accessibilityLabel="Loading more">
          <ActivityIndicator color={colors.muted} />
        </View>
      )}
      {shown.length === 0 && (
        <Text variant="bodySoft" style={{ textAlign: 'center', marginTop: 24, paddingHorizontal: GUTTER }}>
          Nothing matches that yet. Try other words, or tap All.
        </Text>
      )}
    </Screen>
  );
}
