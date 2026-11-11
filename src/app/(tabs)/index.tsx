import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Airmail } from '@/components/Airmail';
import { Logo } from '@/components/AuthFrame';
import { DestinationCard, Grid } from '@/components/DestinationCard';
import { RatingCard } from '@/components/RatingCard';
import { Stamp } from '@/components/Stamp';
import { Text } from '@/components/Text';
import { Card, Screen } from '@/components/ui';
import { colors, fonts, GUTTER } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { averageScore, forYouPicks, friendFeed } from '@/lib/data';

export default function Home() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<'for-you' | 'friends'>('for-you');
  const [top, ...rest] = forYouPicks();
  const topAvg = averageScore(top.destination.slug);

  return (
    <Screen tabBar>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 20, paddingBottom: 16 }}>
        <Text variant="quote" style={{ fontSize: 14, color: colors.inkSoft }}>
          Hello {profile?.name.split(' ')[0] ?? 'there'},
        </Text>
        <Logo size={30} />
      </View>

      <View
        style={{
          marginHorizontal: GUTTER,
          marginBottom: 16,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: colors.sand,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <Text variant="tiny">Preview: the picks and ratings below are sample content. Real ones arrive as friends start rating.</Text>
      </View>

      <View
        accessibilityRole="tablist"
        style={{
          marginHorizontal: GUTTER,
          flexDirection: 'row',
          borderWidth: 1,
          borderColor: colors.sand,
          backgroundColor: colors.card,
          borderRadius: 999,
          padding: 4,
        }}
      >
        {(
          [
            ['for-you', 'For you'],
            ['friends', 'Friends'],
          ] as const
        ).map(([id, label]) => (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === id }}
            onPress={() => setTab(id)}
            style={{ flex: 1, borderRadius: 999, paddingVertical: 9, backgroundColor: tab === id ? colors.ink : 'transparent' }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontFamily: fonts.sansSemiBold,
                fontSize: 14,
                color: tab === id ? colors.card : colors.inkSoft,
              }}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ paddingHorizontal: GUTTER, marginTop: 20, gap: 16 }}>
        {tab === 'for-you' ? (
          <>
            <Link href={`/destination/${top.destination.slug}`} asChild>
              <Pressable>
                <Card>
                  <Airmail />
                  <View style={{ padding: 20, flexDirection: 'row', gap: 16 }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="kicker">Top pick for you</Text>
                      <Text variant="title" style={{ marginTop: 6 }}>
                        {top.destination.name}
                      </Text>
                      <Text variant="bodySoft">{top.destination.country}</Text>
                      <Text variant="body" style={{ marginTop: 12, fontSize: 15 }}>
                        {top.destination.blurb}
                      </Text>
                      <Text variant="tiny" style={{ marginTop: 12, color: colors.airmail }}>
                        {top.match}% match · {top.reason}
                      </Text>
                    </View>
                    {topAvg !== null && <Stamp score={topAvg} label="Friends" size="lg" tilt={4} />}
                  </View>
                </Card>
              </Pressable>
            </Link>
            <Text variant="heading" style={{ marginTop: 8 }}>
              More you might love
            </Text>
            <Grid>
              {rest.slice(0, 6).map((p) => (
                <DestinationCard key={p.destination.slug} destination={p.destination} note={`${p.match}% match`} />
              ))}
            </Grid>
          </>
        ) : (
          friendFeed().map((r) => <RatingCard key={r.id} rating={r} />)
        )}
      </View>
    </Screen>
  );
}
