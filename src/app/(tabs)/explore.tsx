import { router } from 'expo-router';
import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentTitle } from '@/components/AccentTitle';
import { BoardTile, PlaceCard, Row, TrendCard } from '@/components/cards';
import { CollectionTile } from '@/components/explore';
import { ChevronIcon, PinIcon, SearchIcon } from '@/components/Icons';
import { Text } from '@/components/Text';
import { Chip, Input, Screen, SectionHeader } from '@/components/ui';
import { colors, GUTTER, appWidth } from '@/constants/theme';
import { collectionTiles, curateExploreFeed, exploreFeed, searchTrips, type FeedItem } from '@/lib/explore';
import { trendingThisMonth } from '@/lib/sample';
import { useExploreDeparture } from '@/lib/useExploreDeparture';

/**
 * Where your trips start, beside "Just for you" (owner, Nov 2026: visible and easy to change, but quiet): a small outline
 * pill with a pin, "From London" and a ⌄. With no city yet it offers "Add your city". Opens the departure city page.
 */
function CityPill({ name }: { name: string | null }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name ? `Trips from ${name}. Change your city` : 'Add your city to see trips from it'}
      onPress={() => router.push('/departure-city')}
      hitSlop={8}
      style={({ pressed }) => ({
        maxWidth: '52%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingLeft: 9,
        paddingRight: 10,
        paddingVertical: 5,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: pressed ? colors.sageSoft : colors.bg,
      })}
    >
      <PinIcon color={colors.muted} size={13} strokeWidth={1.8} />
      <Text variant="tiny" numberOfLines={1} style={{ color: name ? colors.ink : colors.muted, flexShrink: 1 }}>
        {name ? `From ${name}` : 'Add your city'}
      </Text>
      <View style={{ transform: [{ rotate: '90deg' }] }}>
        <ChevronIcon color={colors.muted} size={10} strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}

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
const TRENDING = trendingThisMonth.filter((tile) => !!tile.photo);

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
  const collections = useMemo(() => collectionTiles(), []);
  const collectionLinks = useMemo(() => new Set(collections.map(({ id }) => `/collection/${id}`)), [collections]);
  const { city, groups, weekends, nearLondon } = useExploreDeparture();

  // Text search takes priority. Trending and collections belong to the unfiltered browse view.
  const searching = !!query.trim();
  const search = useMemo(() => (query.trim() ? searchTrips(query) : null), [query]);
  const best = useMemo(() => search?.places.slice(0, 12) ?? [], [search]);
  const browse = !searching && filter === 'all';
  const matching = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const f = FILTERS.find((x) => x.id === filter)!;
    // With a departure city, "Weekends" means short hops from it (the prototype's lines are all from London).
    const fits = f.id === 'weekends' && city ? (b: FeedItem) => b.kind === 'place' && !!b.slug && weekends.has(b.slug) : f.match;
    return feed.filter((b) => b.photo && fits(b) && !(browse && b.href && collectionLinks.has(b.href))
      && (!words.length || words.some((w) => `${b.name} ${b.sub} ${b.kind}`.toLowerCase().includes(w))));
  }, [browse, city, collectionLinks, feed, filter, query, weekends]);
  const shown = useMemo(() => curateExploreFeed(matching, browse ? TRENDING : best, searching ? [] : groups, nearLondon), [best, browse, groups, matching, nearLondon, searching]);
  const visible = shown.slice(0, limit);
  const left = visible.filter((_, i) => i % 2 === 0);
  const right = visible.filter((_, i) => i % 2 === 1);
  const heights = [230, 170, 200, 250, 180];
  const cardWidth = (appWidth() - GUTTER * 2 - 14) / 2;

  // Focused results appear directly under the sticky search bar and chips.
  const insets = useSafeAreaInsets();
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  const toTop = () => scroller.current?.scrollTo({ y: 0, animated: false });

  const pick = (id: string) => {
    setFilter(id);
    setLimit(PAGE);
    toTop();
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
        <View style={{ backgroundColor: colors.bg, paddingTop: 16, paddingBottom: 12 }}>
          <View style={{ paddingHorizontal: GUTTER }}>
            <Input
              value={query}
              onChangeText={(t) => {
                if (!!t.trim() !== searching) toTop();
                setQuery(t);
                setLimit(PAGE);
              }}
              onSubmitEditing={toTop}
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

        {browse && (
          <>
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
                {/* Photos are required here, so rank only what’s shown. */}
                {TRENDING.map((t, i) => (
                  <TrendCard key={t.slug} item={{ ...t, rank: t.rank ? t.rank.replace(/^#\d+/, `#${i + 1}`) : t.rank }} width={170} height={180} />
                ))}
              </Row>
            </View>
          </>
        )}

        <View style={{ paddingTop: browse ? 30 : 12 }}>
          {search && (
            <View style={{ marginBottom: 30 }}>
              <View style={{ paddingHorizontal: GUTTER, marginBottom: 6 }}>
                <AccentTitle before="Best" accent="matches" variant="heading" />
              </View>
              <Text variant="tiny" style={{ paddingHorizontal: GUTTER, marginBottom: 14 }} accessibilityLabel={`Looking for ${search.understood.join(', ')}`}>
                Looking for <Text variant="tiny" style={{ color: colors.accentText }}>{search.understood.join(' · ')}</Text>
              </Text>
              {best.length ? (
                <View style={{ paddingHorizontal: GUTTER, flexDirection: 'row', flexWrap: 'wrap', gap: 14, rowGap: 22 }}>
                  {best.map((p) => (
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
            <View style={{ paddingHorizontal: GUTTER, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              {search ? <AccentTitle before="More" accent="ideas" variant="heading" />
                : searching ? <AccentTitle before="Search" accent="results" variant="heading" />
                : <AccentTitle before="Just" accent="for you" variant="heading" />}
              {!searching && city !== undefined && <CityPill name={city?.name ?? null} />}
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
