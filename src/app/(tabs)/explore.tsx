import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { BoardTile, PlaceCard, Row, TrendCard } from '@/components/cards';
import { CollectionTile, ItemCard, ItemSection, PlaceSection } from '@/components/explore';
import { SearchIcon } from '@/components/Icons';
import { Text } from '@/components/Text';
import { Chip, Input, Screen, SectionHeader } from '@/components/ui';
import { colors, GUTTER } from '@/constants/theme';
import { itemCollections, placeCollections, placesIn, searchExplore } from '@/lib/explore';
import { board, trendingThisMonth, type BoardItem } from '@/lib/sample';

/** Filter chips for the "Browse everything" board at the bottom. */
const FILTERS: { id: string; label: string; match: (b: BoardItem) => boolean }[] = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'destinations', label: 'Destinations', match: (b) => b.kind === 'place' },
  { id: 'stays', label: 'Stays', match: (b) => ['Riad', 'Villa', 'Ryokan', 'Hotel', 'B&B'].includes(b.kind) },
  { id: 'food', label: 'Food', match: (b) => b.kind === 'Eat' },
  { id: 'todo', label: 'Things to do', match: (b) => b.kind === 'Do' },
  { id: 'gems', label: 'Hidden gems', match: (b) => b.kind === 'Hidden gem' },
  { id: 'culture', label: 'Culture', match: (b) => b.kind.startsWith('Culture') },
];

/** The order of the rows down the page: place collections and things, mixed so it never feels samey. */
const ROWS: { type: 'places' | 'items'; id: string }[] = [
  { type: 'places', id: 'sun-now' },
  { type: 'places', id: 'friends-faves' },
  { type: 'places', id: 'islands' },
  { type: 'items', id: 'gems' },
  { type: 'places', id: 'cities' },
  { type: 'places', id: 'food' },
  { type: 'items', id: 'eats' },
  { type: 'places', id: 'best-now' },
  { type: 'places', id: 'weekends' },
  { type: 'items', id: 'stays' },
  { type: 'places', id: 'no-fly' },
  { type: 'places', id: 'culture' },
  { type: 'items', id: 'todo' },
  { type: 'places', id: 'winter-sun' },
  { type: 'places', id: 'lakes-mountains' },
  { type: 'places', id: 'ski' },
  { type: 'places', id: 'splurge' },
  { type: 'places', id: 'value' },
  { type: 'items', id: 'culture-items' },
  { type: 'places', id: 'couples' },
  { type: 'places', id: 'families' },
  { type: 'places', id: 'one-night' },
];

/**
 * Explore: search, every collection as a tile, Trending this month, a long run of rows
 * (place collections and things to do, eat and stay, each with "See all"), and the
 * full board at the bottom. Everything is ordered by your score.
 */
export default function Explore() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const collections = useMemo(() => placeCollections().map((c) => ({ ...c, items: placesIn(c) })).filter((c) => c.items.length >= 3), []);
  const things = useMemo(() => itemCollections.map((c) => ({ ...c, list: c.items() })).filter((c) => c.list.length >= 3), []);
  const results = useMemo(() => searchExplore(query), [query]);
  const searching = query.trim().length > 2;

  const boardShown = useMemo(() => board.filter(FILTERS.find((x) => x.id === filter)!.match), [filter]);
  const left = boardShown.filter((_, i) => i % 2 === 0);
  const right = boardShown.filter((_, i) => i % 2 === 1);
  const heights = [230, 170, 200, 250, 180];

  return (
    <Screen tabBar>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 16 }}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search places, food, things to do…"
          accessibilityLabel="Search Explore"
          returnKeyType="search"
          icon={<SearchIcon color={colors.muted} />}
          style={{ paddingVertical: 14 }}
        />
      </View>

      {searching ? (
        <View style={{ marginTop: 22, gap: 26 }}>
          {results.places.length > 0 && (
            <View>
              <SectionHeader>{`Places (${results.places.length})`}</SectionHeader>
              <Row>
                {results.places.map((p) => (
                  <PlaceCard key={p.slug} item={p} width={180} height={200} />
                ))}
              </Row>
            </View>
          )}
          {results.items.length > 0 && (
            <View>
              <SectionHeader>{`Food, stays and things to do (${results.items.length})`}</SectionHeader>
              <Row gap={14}>
                {results.items.map((i) => (
                  <ItemCard key={i.key} item={i} />
                ))}
              </Row>
            </View>
          )}
          {!results.places.length && !results.items.length && (
            <Text variant="bodySoft" style={{ textAlign: 'center', paddingHorizontal: GUTTER }}>
              Nothing matches that yet. Try another word, like “beach”, “sushi” or “Portugal”.
            </Text>
          )}
        </View>
      ) : (
        <View style={{ gap: 30 }}>
          <View>
            <View style={{ paddingHorizontal: GUTTER, marginTop: 22, marginBottom: 14 }}>
              <AccentTitle before="Find your" accent="next" after="trip" />
            </View>
            <Row>
              {collections.map((c) => (
                <CollectionTile key={c.id} id={c.id} title={c.title} photo={c.items[0].photo} count={c.items.length} />
              ))}
              {things.map((c) => (
                <CollectionTile key={c.id} id={c.id} title={c.title} photo={c.list[0].photo} count={c.list.length} />
              ))}
            </Row>
          </View>

          <View>
            <SectionHeader>Trending this month</SectionHeader>
            <Row>
              {trendingThisMonth.map((t) => (
                <TrendCard key={t.slug} item={t} width={170} height={180} />
              ))}
            </Row>
          </View>

          {ROWS.map((r) => {
            if (r.type === 'places') {
              const c = collections.find((x) => x.id === r.id);
              return c ? <PlaceSection key={r.id} id={c.id} title={c.title} items={c.items} /> : null;
            }
            const c = things.find((x) => x.id === r.id);
            return c ? <ItemSection key={r.id} id={c.id} title={c.title} items={c.list} /> : null;
          })}

          <View>
            <View style={{ paddingHorizontal: GUTTER, marginBottom: 12 }}>
              <AccentTitle before="Browse" accent="everything" variant="heading" />
            </View>
            <Row gap={8}>
              {FILTERS.map((f) => (
                <Chip key={f.id} label={f.label} selected={filter === f.id} onPress={() => setFilter(f.id)} />
              ))}
            </Row>
            <View style={{ paddingHorizontal: GUTTER, marginTop: 16, flexDirection: 'row', gap: 12 }}>
              {[left, right].map((col, c) => (
                <View key={c} style={{ flex: 1 }}>
                  {col.map((b, i) => (
                    <BoardTile key={`${b.name}-${i}`} item={b} height={heights[(i * 2 + c) % heights.length]} />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </Screen>
  );
}
