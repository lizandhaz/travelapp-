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
import { DEFAULT_MATCH_SETTINGS, getMatchSettings, setMatchSetting, type MatchSettings } from '@/lib/matchSettings';

/** Settings. Privacy switches, blocking, data download and deleting your account come in plan Step J. */
export default function Settings() {
  const { profile, session, signOut, refreshProfile } = useAuth();
  const [removing, setRemoving] = useState(false);
  const [useViews, setUseViews] = useState(true);
  const [cleared, setCleared] = useState<string | null>(null);
  const [uses, setUses] = useState<MatchSettings>(DEFAULT_MATCH_SETTINGS);
  useEffect(() => {
    viewsEnabled().then(setUseViews);
    getMatchSettings().then(setUses);
  }, []);
  const toggle = (key: keyof MatchSettings) => (on: boolean) => {
    setUses((u) => ({ ...u, [key]: on }));
    setMatchSetting(key, on);
  };

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
          <View style={{ padding: 16, gap: 16 }}>
            <Text variant="small">Choose what your scores and picks are based on.</Text>
            <SwitchRow title="My trips" sub="Where you’ve been and how you rated it." value={uses.trips} onChange={toggle('trips')} />
            <SwitchRow title="My saved places" sub="Your Want to go list and your other lists." value={uses.saves} onChange={toggle('saves')} />
            <SwitchRow title="My friends’ scores" sub="What friends rated places, stays and restaurants." value={uses.friends} onChange={toggle('friends')} />
            <SwitchRow
              title="The places I look at"
              sub="Places you open (and how long you spend on them). Only you can see this."
              value={useViews}
              onChange={(on) => {
                setUseViews(on);
                setViewsEnabled(on);
              }}
            />
            <Button title="Clear the places I’ve looked at" kind="outline" size="sm" onPress={clearViews} />
            {!!cleared && <Text variant="small">{cleared}</Text>}
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

function SwitchRow({ title, sub, value, onChange }: { title: string; sub: string; value: boolean; onChange: (on: boolean) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1 }}>
        <Text variant="strong">{title}</Text>
        <Text variant="small">{sub}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.olive, false: colors.line }} accessibilityLabel={`Use ${title.toLowerCase()} for my scores`} />
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
