import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentTitle } from '@/components/AccentTitle';
import { BoardTile, PlaceCard, Row, TasteCard, TrendCard } from '@/components/cards';
import { useTaste } from '@/lib/taste';
import { CollectionTile } from '@/components/explore';
import { SearchIcon } from '@/components/Icons';
import { Text } from '@/components/Text';
import { Chip, Input, Screen, SectionHeader } from '@/components/ui';
import { colors, GUTTER, appWidth } from '@/constants/theme';
import { collectionTiles, exploreFeed, searchTrips, type FeedItem } from '@/lib/explore';
import { rows, TASTES, trendingThisMonth } from '@/lib/sample';

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
  const taste = useTaste();
  const [tasteFilter, setTasteFilter] = useState(0);
  const tasteItems = rows.taste
    .filter((i) => !!i.photo)
    .filter(TASTES[tasteFilter].match)
    .sort((a, b) => (taste.profile.evidence > 0 ? taste.forItem(b).score - taste.forItem(a).score : 0));
  const collections = useMemo(() => collectionTiles(), []);


  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const shown = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter)!;
    return feed.filter((b) => !!b.photo && f.match(b) && (!words.length || words.some((w) => `${b.name} ${b.sub} ${b.kind}`.toLowerCase().includes(w))));
  }, [feed, filter, words]);
  // "Beach in February", "romantic weekend", "Greece": the places that fit, with why.
  const search = useMemo(() => (query.trim() ? searchTrips(query) : null), [query]);
  const visible = shown.slice(0, limit);
  const left = visible.filter((_, i) => i % 2 === 0);
  const right = visible.filter((_, i) => i % 2 === 1);
  const heights = [230, 170, 200, 250, 180];
  const cardWidth = (appWidth() - GUTTER * 2 - 14) / 2;

  // The search bar and chips stay pinned at the top; picking a chip (or searching) jumps down to the feed.
  const insets = useSafeAreaInsets();
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  const spots = useRef({ feed: 0, bar: 0 });
  const toFeed = () => scroller.current?.scrollTo({ y: Math.max(0, spots.current.feed - spots.current.bar - 6), animated: true });

  const pick = (id: string) => {
    setFilter(id);
    setLimit(PAGE);
    toFeed();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <Screen
        ref={scroller}
        tabBar
        noTopInset
        stickyHeaderIndices={[0]}
        scrollEventThrottle={200}
        onScroll={({ nativeEvent: { layoutMeasurement, contentOffset, contentSize } }) => {
          // Load the next batch on its own when you're within about two screens of the bottom.
          if (shown.length > limit && contentOffset.y + layoutMeasurement.height > contentSize.height - layoutMeasurement.height * 2) {
            setLimit((l) => Math.min(l + PAGE, shown.length));
          }
        }}
      >
        <View onLayout={(e) => (spots.current.bar = e.nativeEvent.layout.height)} style={{ backgroundColor: colors.bg, paddingTop: 16, paddingBottom: 12 }}>
          <View style={{ paddingHorizontal: GUTTER }}>
            <Input
              value={query}
              onChangeText={(t) => {
                if (!query && t) toFeed();
                setQuery(t);
                setLimit(PAGE);
              }}
              onSubmitEditing={toFeed}
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
        </View>

        <View>
          <View style={{ paddingHorizontal: GUTTER, marginTop: 10, marginBottom: 14 }}>
            <AccentTitle before="Find your" accent="next" after="trip" />
          </View>
          <Row>
            {collections.map((c) => (
              <CollectionTile key={c.id} id={c.id} title={c.title} photo={c.photo} count={c.count} />
            ))}
          </Row>
        </View>

        <View style={{ marginTop: 28 }}>
          <SectionHeader>Trending this month</SectionHeader>
          <Row>
            {trendingThisMonth.filter((t) => !!t.photo).map((t) => (
              <TrendCard key={t.slug} item={t} width={170} height={180} />
            ))}
          </Row>
        </View>

        {/* Made for your taste: things to eat, do and stay, scored for you (moved from Home). */}
        <View style={{ marginTop: 30, backgroundColor: colors.sageSoft, paddingVertical: 24 }}>
          <SectionHeader>
            <AccentTitle before="Made for your" accent="taste" variant="heading" />
          </SectionHeader>
          <Row gap={8}>
            {TASTES.map((x, i) => (
              <Chip key={x.label} label={x.label} selected={tasteFilter === i} onPress={() => setTasteFilter(i)} />
            ))}
          </Row>
          <View style={{ height: 14 }} />
          <Row gap={14}>
            {tasteItems.map((i) => (
              <TasteCard key={`${i.slug}-${i.name}`} item={i} />
            ))}
          </Row>
        </View>

        <View onLayout={(e) => (spots.current.feed = e.nativeEvent.layout.y)} style={{ paddingTop: 30 }}>
          {search && (
            <View style={{ marginBottom: 30 }}>
              <View style={{ paddingHorizontal: GUTTER, marginBottom: 6 }}>
                <AccentTitle before="Best" accent="matches" variant="heading" />
              </View>
              <Text variant="tiny" style={{ paddingHorizontal: GUTTER, marginBottom: 14 }} accessibilityLabel={`Looking for ${search.understood.join(', ')}`}>
                Looking for <Text variant="tiny" style={{ color: colors.accentText }}>{search.understood.join(' · ')}</Text>
              </Text>
              {search.places.length ? (
                <View style={{ paddingHorizontal: GUTTER, flexDirection: 'row', flexWrap: 'wrap', gap: 14, rowGap: 22 }}>
                  {search.places.slice(0, 12).map((p) => (
                    <PlaceCard key={p.slug} item={p} width={cardWidth} height={cardWidth * 1.1} />
                  ))}
                </View>
              ) : (
                <Text variant="bodySoft" style={{ paddingHorizontal: GUTTER }}>
                  No place has all of that yet. Try fewer words, like “beach” or “February”.
                </Text>
              )}
            </View>
          )}
          {!(search && shown.length === 0) && (
            <View style={{ paddingHorizontal: GUTTER, marginBottom: 14 }}>
              {search ? <AccentTitle before="More" accent="ideas" variant="heading" /> : <AccentTitle before="Just" accent="for you" variant="heading" />}
            </View>
          )}
          <View style={{ paddingHorizontal: GUTTER, flexDirection: 'row', gap: 12 }}>
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
          {shown.length === 0 && !search && (
            <Text variant="bodySoft" style={{ textAlign: 'center', marginTop: 24, paddingHorizontal: GUTTER }}>
              Nothing matches that yet. Try other words, or tap All.
            </Text>
          )}
        </View>
      </Screen>
    </View>
  );
}
