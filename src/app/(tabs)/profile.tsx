import { Link } from 'expo-router';
import { View } from 'react-native';

import { ProfileView } from '@/components/ProfileView';
import { Text } from '@/components/Text';
import { Button, Card, Screen } from '@/components/ui';
import { colors, GUTTER } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import type { Person } from '@/lib/data';

const COLOURS: Person['colour'][] = ['postbox', 'airmail', 'sea', 'sun', 'ink'];

export default function You() {
  const { profile, session, signOut } = useAuth();
  const name = profile?.name ?? session?.user.email?.split('@')[0] ?? 'You';
  const id = profile?.id ?? session?.user.id ?? 'x';

  const person: Person = {
    handle: profile?.handle ?? '…',
    name,
    initials: name
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    homeTown: '',
    bio: '',
    colour: COLOURS[id.charCodeAt(0) % COLOURS.length],
    isFriend: false,
  };

  return (
    <Screen tabBar>
      <ProfileView person={person} isMe>
        <View style={{ paddingHorizontal: GUTTER, marginTop: 24, gap: 16 }}>
          <Link href="/log" asChild>
            <Button title="Log your first holiday" />
          </Link>

          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text variant="strong">Public profile</Text>
                <Text variant="small">Let anyone on Postcard see your ratings, not just friends.</Text>
              </View>
              <View style={{ backgroundColor: colors.sand, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
                <Text variant="tiny" style={{ color: colors.inkSoft }}>
                  {profile?.isPublic ? 'On' : 'Off'}
                </Text>
              </View>
            </View>
            <Text variant="tiny" style={{ marginTop: 12 }}>
              {profile?.canGoPublic
                ? 'Public profiles are coming soon.'
                : 'Public profiles are for over-18s. Until then, your profile is just for friends.'}
            </Text>
          </Card>

          <Card style={{ padding: 16, gap: 12 }}>
            <Text variant="small">
              Signed in as <Text variant="strong">{session?.user.email}</Text>
            </Text>
            <Button title="Log out" kind="secondary" onPress={signOut} />
          </Card>
        </View>
      </ProfileView>
    </Screen>
  );
}
