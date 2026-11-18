import { View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, PageTitle, Screen } from '@/components/ui';
import { APP_NAME } from '@/constants/brand';
import { colors, GUTTER } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

/** Settings. Privacy switches, blocking, data download and deleting your account come in plan Step J. */
export default function Settings() {
  const { profile, session, signOut } = useAuth();
  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 12 }}>
        <BackButton />
      </View>
      <PageTitle label="Settings">
        <AccentTitle before="Your" accent="account" />
      </PageTitle>
      <View style={{ paddingHorizontal: GUTTER, gap: 22 }}>
        <Section label="Privacy">
          <Row title="Public profile" sub={`Let anyone on ${APP_NAME} see your trips, not just friends.`} value={profile?.isPublic ? 'On' : 'Off'} />
          <Text variant="tiny" style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
            {profile?.canGoPublic ? 'Public profiles are coming soon.' : 'Public profiles are for over-18s. Until then, your profile is just for friends.'}
          </Text>
        </Section>
        <Section label="Signed in as">
          <View style={{ padding: 16, gap: 14 }}>
            <Text variant="strong">{session?.user.email}</Text>
            <Button title="Sign out" kind="outline" onPress={signOut} />
          </View>
        </Section>
      </View>
    </Screen>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="label">{label}</Text>
      <Card>{children}</Card>
    </View>
  );
}

function Row({ title, sub, value }: { title: string; sub: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 }}>
      <View style={{ flex: 1 }}>
        <Text variant="strong">{title}</Text>
        <Text variant="small">{sub}</Text>
      </View>
      <View style={{ backgroundColor: colors.bg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: colors.line }}>
        <Text variant="tiny" style={{ color: colors.ink }}>
          {value}
        </Text>
      </View>
    </View>
  );
}
