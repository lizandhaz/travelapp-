import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { DestinationCard, Grid } from '@/components/DestinationCard';
import { Text } from '@/components/Text';
import { Chip, Header, Input, Screen } from '@/components/ui';
import { GUTTER } from '@/constants/theme';
import { destinations } from '@/lib/data';

export default function Explore() {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const tags = useMemo(() => [...new Set(destinations.flatMap((d) => d.tags))].sort(), []);

  const q = query.trim().toLowerCase();
  const shown = destinations.filter(
    (d) => (!tag || d.tags.includes(tag)) && (!q || d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)),
  );

  return (
    <Screen tabBar>
      <Header title="Explore" kicker="Rated by friends" />
      <View style={{ paddingHorizontal: GUTTER }}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search a place or country"
          accessibilityLabel="Search destinations"
          returnKeyType="search"
          style={{ borderRadius: 999, paddingHorizontal: 16 }}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: GUTTER, paddingVertical: 12 }}>
        {[null, ...tags].map((t) => (
          <Chip key={t ?? 'all'} label={t ?? 'All'} selected={tag === t} onPress={() => setTag(t)} />
        ))}
      </ScrollView>
      <View style={{ paddingHorizontal: GUTTER }}>
        <Grid>
          {shown.map((d) => (
            <DestinationCard key={d.slug} destination={d} />
          ))}
        </Grid>
        {shown.length === 0 && (
          <Text variant="bodySoft" style={{ textAlign: 'center', marginTop: 40 }}>
            No friends have rated anywhere like that yet.
          </Text>
        )}
      </View>
    </Screen>
  );
}
