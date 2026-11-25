import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { Avatar } from '@/components/Avatar';
import { SearchIcon } from '@/components/Icons';
import { SafetySheet } from '@/components/SafetySheet';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, Input, PageTitle, Screen, Segmented } from '@/components/ui';
import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { acceptFollower, fetchFollows, follow, inviteFriends, removeFollower, searchPeople, unfollow, type Follows, type Person } from '@/lib/friends';

type Tab = 'followers' | 'following' | 'requests';

/** People: find people by name or @username and follow them; your followers, who you follow, and requests. */
export default function People() {
  const { profile, session } = useAuth();
  const me = session?.user.id ?? '';
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(params.tab ?? 'followers');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Person[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [follows, setFollows] = useState<Follows | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invited, setInvited] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchFollows()
      .then(setFollows)
      .catch((e: Error) => setError(e.message));
  }, []);
  useFocusEffect(load);

  // Search as you type (after a short pause).
  useEffect(() => {
    const q = query.trim();
    if (q.replace(/^@/, '').length < 2) return;
    let live = true;
    const timer = setTimeout(() => {
      setSearching(true);
      searchPeople(q)
        .then((r) => live && setResults(r))
        .catch((e: Error) => live && setError(e.message))
        .finally(() => live && setSearching(false));
    }, 300);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [query]);

  const searchingFor = query.trim().replace(/^@/, '').length >= 2;
  const iFollow = (id: string) => (follows?.following.some((f) => f.userId === id) ? 'following' : follows?.sent.some((f) => f.userId === id) ? 'requested' : 'none');
  const followsMe = (id: string) => !!follows?.followers.some((f) => f.userId === id);

  const [safety, setSafety] = useState<{ userId: string; name: string } | null>(null);

  async function act(key: string, job: () => Promise<unknown>) {
    setBusy(key);
    setError(null);
    try {
      await job();
      const [f, r] = await Promise.all([fetchFollows(), searchingFor ? searchPeople(query.trim()) : Promise.resolve(null)]);
      setFollows(f);
      if (r) setResults(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  const followButton = (id: string, name: string, status: 'following' | 'requested' | 'none', followsYou: boolean) =>
    status === 'none' ? (
      <Pill label={followsYou ? 'Follow back' : 'Follow'} filled onPress={() => act(id, () => follow(id))} a11y={`Follow ${name}`} />
    ) : (
      <Confirm
        label={status === 'following' ? 'Following' : 'Requested'}
        confirm={status === 'following' ? 'Unfollow' : 'Cancel request'}
        a11y={status === 'following' ? `You follow ${name}. Tap to unfollow` : `Request sent to ${name}. Tap to cancel`}
        onConfirm={() => act(id, () => unfollow(id, me))}
      />
    );

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 12 }}>
        <BackButton />
      </View>
      <PageTitle label="People">
        <AccentTitle before="Find your" accent="people" />
      </PageTitle>

      <View style={{ paddingHorizontal: GUTTER, gap: 14 }}>
        <Input
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            if (t.trim().replace(/^@/, '').length < 2) setResults(null);
          }}
          placeholder="Search by name or @username"
          accessibilityLabel="Search for people by name or username"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          icon={<SearchIcon color={colors.muted} />}
          style={{ paddingVertical: 14 }}
        />
        {!!error && (
          <Text variant="small" style={{ color: colors.accentText }}>
            {error}
          </Text>
        )}

        {searchingFor ? (
          <View style={{ gap: 10 }}>
            {searching && !results && <ActivityIndicator color={colors.accent} />}
            {results?.length === 0 && !searching && (
              <Text variant="bodySoft" style={{ textAlign: 'center', paddingVertical: 16 }}>
                Nobody by that name yet. Invite them below.
              </Text>
            )}
            {results?.map((p) => (
              <PersonRow key={p.id} onOpen={() => router.push({ pathname: '/user/[id]', params: { id: p.id } })} onMore={() => setSafety({ userId: p.id, name: p.name })} name={p.name} handle={p.handle} sub={p.followsYou ? 'Follows you' : undefined} busy={busy === p.id}>
                {followButton(p.id, p.name, p.status, p.followsYou)}
              </PersonRow>
            ))}
          </View>
        ) : (
          <>
            <Segmented
              label="People"
              value={tab}
              onChange={setTab}
              options={[
                ['followers', `Followers ${follows?.followers.length ?? ''}`.trim()],
                ['following', `Following ${follows?.following.length ?? ''}`.trim()],
                ['requests', `Requests${follows?.requests.length ? ` ${follows.requests.length}` : ''}`],
              ]}
            />
            {!follows ? (
              <ActivityIndicator color={colors.accent} />
            ) : tab === 'followers' ? (
              follows.followers.length === 0 ? (
                <Text variant="bodySoft">No followers yet. Invite friends below.</Text>
              ) : (
                follows.followers.map((f) => (
                  <PersonRow key={f.userId} onOpen={() => router.push({ pathname: '/user/[id]', params: { id: f.userId } })} onMore={() => setSafety({ userId: f.userId, name: f.name })} name={f.name} handle={f.handle} busy={busy === f.userId}>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      {iFollow(f.userId) === 'none' ? followButton(f.userId, f.name, 'none', true) : null}
                      <Confirm label="Remove" confirm="Remove follower" a11y={`Remove ${f.name} as a follower`} onConfirm={() => act(f.userId, () => removeFollower(f.userId, me))} quiet />
                    </View>
                  </PersonRow>
                ))
              )
            ) : tab === 'following' ? (
              follows.following.length === 0 ? (
                <Text variant="bodySoft">You’re not following anyone yet. Search for people above.</Text>
              ) : (
                follows.following.map((f) => (
                  <PersonRow key={f.userId} onOpen={() => router.push({ pathname: '/user/[id]', params: { id: f.userId } })} onMore={() => setSafety({ userId: f.userId, name: f.name })} name={f.name} handle={f.handle} sub={followsMe(f.userId) ? 'Follows you' : undefined} busy={busy === f.userId}>
                    {followButton(f.userId, f.name, 'following', followsMe(f.userId))}
                  </PersonRow>
                ))
              )
            ) : (
              <View style={{ gap: 10 }}>
                {follows.requests.length === 0 && follows.sent.length === 0 && <Text variant="bodySoft">No requests right now.</Text>}
                {follows.requests.map((f) => (
                  <PersonRow key={f.userId} onOpen={() => router.push({ pathname: '/user/[id]', params: { id: f.userId } })} onMore={() => setSafety({ userId: f.userId, name: f.name })} name={f.name} handle={f.handle} sub="Wants to follow you" busy={busy === f.userId}>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <Pill label="Accept" filled onPress={() => act(f.userId, () => acceptFollower(f.userId))} a11y={`Let ${f.name} follow you`} />
                      <Pressable onPress={() => act(f.userId, () => removeFollower(f.userId, me))} accessibilityRole="button" accessibilityLabel={`Decline ${f.name}`} hitSlop={6}>
                        <Text variant="small" style={{ color: colors.muted }}>
                          Decline
                        </Text>
                      </Pressable>
                    </View>
                  </PersonRow>
                ))}
                {follows.sent.length > 0 && (
                  <Text variant="label" style={{ marginTop: 6 }}>
                    Waiting for them to accept
                  </Text>
                )}
                {follows.sent.map((f) => (
                  <PersonRow key={f.userId} onOpen={() => router.push({ pathname: '/user/[id]', params: { id: f.userId } })} onMore={() => setSafety({ userId: f.userId, name: f.name })} name={f.name} handle={f.handle} busy={busy === f.userId}>
                    {followButton(f.userId, f.name, 'requested', followsMe(f.userId))}
                  </PersonRow>
                ))}
              </View>
            )}
          </>
        )}

        <Card tone="sage" style={{ padding: 16, gap: 10, marginTop: 6 }}>
          <Text variant="strong">Invite friends</Text>
          {!!profile?.handle && (
            <Text variant="small">
              Your username is <Text variant="strong">@{profile.handle}</Text>, so friends can find you.
            </Text>
          )}
          <Button
            title="Send an invite"
            kind="dark"
            onPress={async () => setInvited((await inviteFriends(profile?.handle)) ? 'Invite ready to send.' : 'Couldn’t open sharing on this device.')}
          />
          {!!invited && <Text variant="tiny">{invited}</Text>}
        </Card>
      </View>
      {!!safety && (
        <SafetySheet
          target={{ userId: safety.userId, name: safety.name }}
          visible
          onClose={() => setSafety(null)}
          onBlocked={() => {
            fetchFollows().then(setFollows).catch(() => {});
            setResults((r) => r?.filter((x) => x.id !== safety.userId) ?? r);
          }}
        />
      )}
    </Screen>
  );
}

/** One person: picture, name, @handle, an optional line ("Follows you") and their buttons. */
function PersonRow({ name, handle, sub, busy, children, onMore, onOpen }: { name: string; handle: string; sub?: string; busy: boolean; children: React.ReactNode; onMore?: () => void; onOpen?: () => void }) {
  return (
    <Card style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Pressable onPress={onOpen} disabled={!onOpen} accessibilityRole="link" accessibilityLabel={`${name}, @${handle}. Open their profile`} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={name} size={44} />
        <View style={{ flex: 1 }}>
          <Text variant="strong" numberOfLines={1}>
            {name}
          </Text>
          <Text variant="tiny" numberOfLines={1}>
            @{handle}
            {sub ? ` · ${sub}` : ''}
          </Text>
        </View>
      </Pressable>
      {busy ? <ActivityIndicator color={colors.accent} /> : children}
      {!!onMore && (
        <Pressable onPress={onMore} accessibilityRole="button" accessibilityLabel={`Report or block ${name}`} hitSlop={10} style={{ paddingHorizontal: 2 }}>
          <Text style={{ fontSize: 18, color: colors.muted, letterSpacing: 1 }}>•••</Text>
        </Pressable>
      )}
    </Card>
  );
}

/** A pill that asks once more before doing something you'd regret (unfollow, remove, cancel). */
function Confirm({ label, confirm, a11y, onConfirm, quiet = false }: { label: string; confirm: string; a11y: string; onConfirm: () => void; quiet?: boolean }) {
  const [asking, setAsking] = useState(false);
  if (asking)
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => setAsking(false)} accessibilityRole="button" hitSlop={6}>
          <Text variant="small" style={{ color: colors.muted }}>
            Keep
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setAsking(false);
            onConfirm();
          }}
          accessibilityRole="button"
          accessibilityLabel={confirm}
          hitSlop={6}
        >
          <Text variant="small" style={{ color: colors.accentText, fontFamily: fonts.sansSemiBold }}>
            {confirm}
          </Text>
        </Pressable>
      </View>
    );
  return quiet ? (
    <Pressable onPress={() => setAsking(true)} accessibilityRole="button" accessibilityLabel={a11y} hitSlop={6}>
      <Text variant="small" style={{ color: colors.muted }}>
        {label}
      </Text>
    </Pressable>
  ) : (
    <Pill label={label} onPress={() => setAsking(true)} a11y={a11y} />
  );
}

function Pill({ label, filled = false, onPress, a11y }: { label: string; filled?: boolean; onPress?: () => void; a11y: string }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={({ pressed }) => ({
        borderRadius: radius.pill,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: filled ? colors.accentDeep : colors.card,
        borderWidth: 1,
        borderColor: filled ? colors.accentDeep : colors.line,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 14, color: filled ? colors.onDark : colors.ink }}>{label}</Text>
    </Pressable>
  );
}
