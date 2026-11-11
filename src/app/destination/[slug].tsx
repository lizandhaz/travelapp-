import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Photo } from '@/components/Photo';
import { RatingCard } from '@/components/RatingCard';
import { Stamp } from '@/components/Stamp';
import { Text } from '@/components/Text';
import { Card, Header, Screen } from '@/components/ui';
import { colors, GUTTER } from '@/constants/theme';
import { averageScore, getDestination, getPerson, ratingsFor } from '@/lib/data';
import NotFound from '../+not-found';

export default function DestinationScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const place = getDestination(slug);
  if (!place) return <NotFound />;

  const rs = ratingsFor(slug);
  const avg = averageScore(slug);
  const food = rs.flatMap((r) => r.foodPicks.map((f) => ({ ...f, by: r.author })));
  const tips = rs.flatMap((r) => r.topTips.map((t) => ({ tip: t, by: r.author })));

  return (
    <Screen contentStyle={{ paddingTop: 0 }}>
      <Photo palette={place.palette} style={{ height: 220, borderRadius: 0 }} />
      <Header
        title={place.name}
        kicker={place.country}
        back="Back"
        right={avg !== null ? <Stamp score={avg} label="Friends" tilt={-3} /> : undefined}
      />
      <View style={{ paddingHorizontal: GUTTER, gap: 28 }}>
        <Text variant="bodySoft">{place.blurb}</Text>

        {rs.length === 0 ? (
          <Card style={{ padding: 20, alignItems: 'center', borderStyle: 'dashed' }}>
            <Text variant="heading">No friends have rated {place.name} yet.</Text>
            <Link href="/log" asChild>
              <Pressable style={{ marginTop: 12 }}>
                <Text variant="link" style={{ color: colors.postbox }}>
                  Been? Rate it →
                </Text>
              </Pressable>
            </Link>
          </Card>
        ) : (
          <>
            <Section title="Where friends stayed">
              <Card>
                {rs.map((r, i) => (
                  <Link key={r.id} href={`/rating/${r.id}`} asChild>
                    <Pressable
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 12,
                        borderTopWidth: i ? 1 : 0,
                        borderTopColor: colors.sand,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text variant="strong">{r.stay.name}</Text>
                        <Text variant="tiny">
                          {r.stay.type} · {getPerson(r.author)?.name}
                        </Text>
                      </View>
                      <Stamp score={r.stay.score} size="sm" />
                    </Pressable>
                  </Link>
                ))}
              </Card>
            </Section>

            <Section title="Food picks">
              {food.map((f) => (
                <Card key={f.by + f.name} style={{ padding: 12 }}>
                  <Text variant="strong">{f.name}</Text>
                  <Text variant="small">{f.note}</Text>
                </Card>
              ))}
            </Section>

            <Section title="Top tips">
              {tips.map((t) => (
                <View key={t.by + t.tip} style={{ flexDirection: 'row', gap: 12 }}>
                  <Avatar person={getPerson(t.by)!} size="sm" />
                  <Text variant="quote" style={{ flex: 1 }}>
                    “{t.tip}”
                  </Text>
                </View>
              ))}
            </Section>

            <Section title="Ratings">
              {rs.map((r) => (
                <RatingCard key={r.id} rating={r} />
              ))}
            </Section>
          </>
        )}
      </View>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <Text variant="heading">{title}</Text>
      {children}
    </View>
  );
}
