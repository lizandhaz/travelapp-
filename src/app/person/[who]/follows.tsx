import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { ChevronIcon } from '@/components/Icons';
import { Text } from '@/components/Text';
import { BackButton, PageTitle, Screen, Segmented } from '@/components/ui';
import { colors, GUTTER, radius } from '@/constants/theme';
import { getPerson, statsOf, type SamplePerson } from '@/lib/samplePeople';
import NotFound from '../../+not-found';

const TABS = [
  ['followers', 'Followers'],
  ['following', 'Following'],
] as const;

/** A sample friend's followers and who they follow (like People on You). Each opens their profile. */
export default function PersonFollows() {
  const { who, tab: start } = useLocalSearchParams<{ who: string; tab?: string }>();
  const person = getPerson(who);
  const [tab, setTab] = useState<'followers' | 'following'>(start === 'following' ? 'following' : 'followers');
  if (!person) return <NotFound />;
  const people = person[tab].map((id) => getPerson(id)).filter((p): p is SamplePerson => !!p);

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 14 }}>
        <BackButton />
      </View>
      <PageTitle label={`@${person.handle}`}>
        <Text variant="title">{person.name}</Text>
      </PageTitle>
      <View style={{ paddingHorizontal: GUTTER }}>
        <Segmented options={TABS} value={tab} onChange={setTab} label={`${person.name}’s followers and following`} />
      </View>
      <View style={{ paddingHorizontal: GUTTER, marginTop: 18, gap: 10 }}>
        {people.length === 0 && (
          <Text variant="bodySoft">{tab === 'followers' ? `No one follows ${person.name} yet.` : `${person.name} isn’t following anyone yet.`}</Text>
        )}
        {people.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => router.push(`/person/${p.id}`)}
            accessibilityRole="link"
            accessibilityLabel={`${p.name}, @${p.handle}. Open their profile`}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, opacity: pressed ? 0.85 : 1 })}
          >
            <Avatar face={p.face} name={p.name} size={40} />
            <View style={{ flex: 1 }}>
              <Text variant="strong">{p.name}</Text>
              <Text variant="tiny">
                @{p.handle} · {statsOf(p).trips} trips
              </Text>
            </View>
            <ChevronIcon color={colors.muted} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
