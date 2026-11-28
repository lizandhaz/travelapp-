import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { colors, fonts, radius } from '@/constants/theme';
import { fetchTripPeople, type TripPerson } from '@/lib/trips';
import { Avatar } from './Avatar';
import { Text } from './Text';

const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

/**
 * "Went with": the friends tagged on a real trip (owner, Nov 2026), each opening their profile. Only people you're
 * allowed to know show (trip_people_of); nothing at all when nobody's tagged or for sample trips.
 */
export function TripPeople({ tripId }: { tripId: string }) {
  const [people, setPeople] = useState<{ id: string; list: TripPerson[] } | null>(null);
  useEffect(() => {
    if (!isUuid(tripId)) return;
    let live = true;
    fetchTripPeople(tripId).then((list) => live && setPeople({ id: tripId, list }));
    return () => {
      live = false;
    };
  }, [tripId]);
  const list = people?.id === tripId ? people.list : [];
  if (!list.length) return null;
  return (
    <View style={{ gap: 8 }}>
      <Text variant="label">Went with</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {list.map((p) => (
          <Pressable
            key={p.userId}
            onPress={() => router.push(`/user/${p.userId}`)}
            accessibilityRole="link"
            accessibilityLabel={`${p.name}. Open their profile`}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 4, paddingRight: 12, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: pressed ? colors.sageSoft : colors.card })}
          >
            <Avatar name={p.name} size={28} />
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink }}>{p.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
