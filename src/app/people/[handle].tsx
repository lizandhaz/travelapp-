import { useLocalSearchParams } from 'expo-router';

import { ProfileView } from '@/components/ProfileView';
import { RatingCard } from '@/components/RatingCard';
import { Text } from '@/components/Text';
import { Screen } from '@/components/ui';
import { getDestination, getPerson, ratingsBy } from '@/lib/data';
import NotFound from '../+not-found';

/** A friend's profile. Still sample data until Friends (Step 3). */
export default function PersonScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const person = getPerson(handle);
  if (!person) return <NotFound />;

  const rs = ratingsBy(person.handle);
  const stats = {
    count: rs.length,
    countries: new Set(rs.map((r) => getDestination(r.destination)?.country)).size,
    avg: rs.length ? (rs.reduce((s, r) => s + r.destinationScore, 0) / rs.length).toFixed(1) : '–',
  };

  return (
    <Screen>
      <ProfileView
        person={person}
        stats={stats}
        listTitle="Trips"
        list={
          rs.length ? (
            rs.map((r) => <RatingCard key={r.id} rating={r} showAuthor={false} />)
          ) : (
            <Text variant="bodySoft">No trips yet.</Text>
          )
        }
      />
    </Screen>
  );
}
