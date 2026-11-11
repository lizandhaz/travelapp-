import { useLocalSearchParams } from 'expo-router';

import { ProfileView } from '@/components/ProfileView';
import { Screen } from '@/components/ui';
import { getPerson } from '@/lib/data';
import NotFound from '../+not-found';

export default function PersonScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const person = getPerson(handle);
  if (!person) return <NotFound />;
  return (
    <Screen>
      <ProfileView person={person} />
    </Screen>
  );
}
