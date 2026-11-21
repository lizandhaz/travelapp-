import { Switch, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, PageTitle, Screen } from '@/components/ui';
import { APP_NAME } from '@/constants/brand';
import { colors, GUTTER } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { setProfilePicture } from '@/lib/trips';
import { useEffect, useState } from 'react';
import { clearPlaceViews, setViewsEnabled, viewsEnabled } from '@/lib/views';

/** Settings. Privacy switches, blocking, data download and deleting your account come in plan Step J. */
export default function Settings() {
  const { profile, session, signOut, refreshProfile } = useAuth();
  const [removing, setRemoving] = useState(false);
  const [useViews, setUseViews] = useState(true);
  const [cleared, setCleared] = useState<string | null>(null);
  useEffect(() => {
    viewsEnabled().then(setUseViews);
  }, []);

  async function clearViews() {
    try {
      await clearPlaceViews();
      setCleared('Cleared. Your scores no longer use the places you’ve looked at.');
    } catch (e) {
      setCleared(e instanceof Error ? e.message : 'Something went wrong.');
    }
  }

  async function removePicture() {
    setRemoving(true);
    try {
      await setProfilePicture(null, undefined, profile?.avatarPath);
      await refreshProfile();
    } finally {
      setRemoving(false);
    }
  }
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
        <Section label="Your scores">
          <View style={{ padding: 16, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text variant="strong">Use the places I look at</Text>
                <Text variant="small">Places you open (and how long you spend on them) help your scores. Only you can see this.</Text>
              </View>
              <Switch
                value={useViews}
                onValueChange={(on) => {
                  setUseViews(on);
                  setViewsEnabled(on);
                }}
                trackColor={{ true: colors.olive, false: colors.line }}
                accessibilityLabel="Use the places I look at for my scores"
              />
            </View>
            <Button title="Clear the places I’ve looked at" kind="outline" size="sm" onPress={clearViews} />
            {!!cleared && <Text variant="small">{cleared}</Text>}
            <Text variant="tiny">Your scores also use your trips, your saved places and your friends’ ratings.</Text>
          </View>
        </Section>
        {!!profile?.avatarPath && (
          <Section label="Profile picture">
            <View style={{ padding: 16 }}>
              <Button title={removing ? 'Removing…' : 'Remove profile picture'} kind="outline" disabled={removing} onPress={removePicture} />
            </View>
          </Section>
        )}
        <Section label="Signed in as">
          <View style={{ padding: 16, gap: 14 }}>
            <Text variant="strong">{session?.user.email}</Text>
            <Button title="Sign out" kind="outline" onPress={signOut} />
          </View>
        </Section>
        <Text variant="tiny">Place names and map positions include data from GeoNames (geonames.org), CC BY 4.0.</Text>
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
