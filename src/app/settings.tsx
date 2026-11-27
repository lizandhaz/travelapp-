import { router } from 'expo-router';
import { Pressable, Switch, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, PageTitle, Screen, Segmented } from '@/components/ui';
import { APP_NAME } from '@/constants/brand';
import { colors, GUTTER } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { setDeparturePreference } from '@/lib/departurePreference';
import { setProfilePicture } from '@/lib/trips';
import { useEffect, useState } from 'react';
import { clearPlaceViews, setViewsEnabled, viewsEnabled } from '@/lib/views';
import { DEFAULT_MATCH_SETTINGS, getMatchSettings, setMatchSetting, type MatchSettings } from '@/lib/matchSettings';
import { deleteMyAccount, fetchBlocks, unblockUser, type Blocked } from '@/lib/safety';
import { updatePrivacy, type PrivacyChange } from '@/lib/profiles';

/** Settings: what your scores use, blocked people, privacy policy, sign out and deleting your account (plan Step J). */
export default function Settings() {
  const { profile, session, signOut, refreshProfile } = useAuth();
  const [removing, setRemoving] = useState(false);
  const [useViews, setUseViews] = useState(true);
  const [cleared, setCleared] = useState<string | null>(null);
  const [uses, setUses] = useState<MatchSettings>(DEFAULT_MATCH_SETTINGS);
  const [blocked, setBlocked] = useState<Blocked[] | null>(null);
  const [deleting, setDeleting] = useState<'idle' | 'asking' | 'busy'>('idle');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  useEffect(() => {
    viewsEnabled().then(setUseViews);
    getMatchSettings().then(setUses);
    fetchBlocks().then(setBlocked);
  }, []);

  const [privacyError, setPrivacyError] = useState<string | null>(null);
  async function changePrivacy(change: PrivacyChange) {
    setPrivacyError(null);
    try {
      await updatePrivacy(change);
      await refreshProfile();
    } catch (e) {
      setPrivacyError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  }

  async function unblock(b: Blocked) {
    try {
      await unblockUser(b.userId);
      setBlocked((list) => list?.filter((x) => x.userId !== b.userId) ?? list);
    } catch {
      // Leave them in the list to try again.
    }
  }

  async function deleteAccount() {
    setDeleting('busy');
    setDeleteError(null);
    try {
      await deleteMyAccount();
      if (session) await setDeparturePreference(session.user.id, null).catch(() => {});
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Something went wrong.');
      setDeleting('asking');
    }
  }
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
          {profile?.canGoPublic ? (
            <View style={{ padding: 16, gap: 16 }}>
              <SwitchRow
                title="Public profile"
                sub={profile.isPublic ? `Anyone on ${APP_NAME} can follow you without asking, and see what you choose below.` : 'Private: only followers you accept see what you share.'}
                value={profile.isPublic}
                onChange={(on) => changePrivacy({ is_public: on })}
              />
              {profile.isPublic && (
                <>
                  <Text variant="small">Who can see each part of your profile? Trips set to “Just me” are only ever seen by you.</Text>
                  {(
                    [
                      ['share_trips', 'Your trips', profile.shareTrips],
                      ['share_boards', 'Your boards', profile.shareBoards],
                      ['share_stats', 'Your stats and travel map', profile.shareStats],
                    ] as const
                  ).map(([key, title, value]) => (
                    <View key={key} style={{ gap: 8 }}>
                      <Text variant="strong">{title}</Text>
                      <Segmented
                        label={`Who can see ${title.toLowerCase()}`}
                        options={[
                          ['everyone', 'Everyone'],
                          ['followers', 'Followers only'],
                        ]}
                        value={value}
                        onChange={(v) => changePrivacy({ [key]: v })}
                      />
                    </View>
                  ))}
                </>
              )}
              {!!privacyError && (
                <Text variant="small" style={{ color: colors.accentText }}>
                  {privacyError}
                </Text>
              )}
            </View>
          ) : (
            <>
              <Row title="Public profile" sub={`Let anyone on ${APP_NAME} see your trips, not just friends.`} value="Off" />
              <Text variant="tiny" style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
                Public profiles are for over-18s. Until then, your profile is just for friends.
              </Text>
            </>
          )}
        </Section>
        <Section label="Your scores">
          <View style={{ padding: 16, gap: 16 }}>
            <Text variant="small">Choose what your scores and picks are based on.</Text>
            <SwitchRow title="My trips" sub="Where you’ve been and how you rated it." value={uses.trips} onChange={toggle('trips')} />
            <SwitchRow title="My saved places" sub="Your Want to go board and your other boards." value={uses.saves} onChange={toggle('saves')} />
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
        <Section label="Trips near you">
          <Pressable onPress={() => router.push('/departure-city')} accessibilityRole="link" style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text variant="strong" style={{ flex: 1 }}>Departure city</Text>
            <Text variant="link">Change</Text>
          </Pressable>
        </Section>
        <Section label="Your taste">
          <Pressable onPress={() => router.push('/setup')} accessibilityRole="link" style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text variant="strong">Tell us what you love</Text>
              <Text variant="small">The quick questions from when you joined. Your scores update straight away.</Text>
            </View>
            <Text variant="link">Start →</Text>
          </Pressable>
        </Section>
        <Section label="Blocked people">
          <View style={{ padding: 16, gap: 12 }}>
            {!blocked ? (
              <Text variant="small">Loading…</Text>
            ) : blocked.length === 0 ? (
              <Text variant="small">You haven’t blocked anyone. To block someone, tap ••• next to them on People, or “Report” on a trip or comment.</Text>
            ) : (
              blocked.map((b) => (
                <View key={b.userId} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="strong">{b.name}</Text>
                    <Text variant="tiny">@{b.handle}</Text>
                  </View>
                  <Button title="Unblock" kind="outline" size="sm" onPress={() => unblock(b)} accessibilityLabel={`Unblock ${b.name}`} />
                </View>
              ))
            )}
          </View>
        </Section>
        <Section label="Privacy">
          <Pressable onPress={() => router.push('/privacy')} accessibilityRole="link" style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
            <Text variant="strong" style={{ flex: 1 }}>
              Privacy policy
            </Text>
            <Text variant="link">Read →</Text>
          </Pressable>
        </Section>
        <Section label="Signed in as">
          <View style={{ padding: 16, gap: 14 }}>
            <Text variant="strong">{session?.user.email}</Text>
            <Button title="Sign out" kind="outline" onPress={signOut} />
          </View>
        </Section>
        <Section label="Delete account">
          <View style={{ padding: 16, gap: 12 }}>
            {deleting === 'idle' ? (
              <>
                <Text variant="small">Deletes your account and everything in it: trips, photos, boards, followers, likes and comments. This can’t be undone.</Text>
                <Button title="Delete my account" kind="outline" onPress={() => setDeleting('asking')} />
              </>
            ) : (
              <>
                <Text variant="strong">Are you sure? Everything will be deleted for good, straight away.</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button title="Keep my account" kind="outline" style={{ flex: 1 }} disabled={deleting === 'busy'} onPress={() => setDeleting('idle')} />
                  <Button title={deleting === 'busy' ? 'Deleting…' : 'Yes, delete it'} kind="accent" style={{ flex: 1 }} disabled={deleting === 'busy'} onPress={deleteAccount} />
                </View>
                {!!deleteError && (
                  <Text variant="small" style={{ color: colors.accentText }}>
                    {deleteError}
                  </Text>
                )}
              </>
            )}
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
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.olive, false: colors.line }} thumbColor={colors.card} ios_backgroundColor={colors.line} accessibilityLabel={`Use ${title.toLowerCase()} for my scores`} />
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
