import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { Avatar } from '@/components/Avatar';
import { SearchIcon } from '@/components/Icons';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, Input, PageTitle, Screen } from '@/components/ui';
import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { acceptFriend, addFriend, fetchFriendships, inviteFriends, removeFriendship, searchPeople, type Friendship, type Person, type Standing } from '@/lib/friends';

/** Find people by name or @username, answer friend requests, and see your friends. */
export default function People() {
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Person[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [friendships, setFriendships] = useState<Friendship[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invited, setInvited] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchFriendships()
      .then(setFriendships)
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
  const byUser = new Map((friendships ?? []).map((f) => [f.userId, f]));
  const received = (friendships ?? []).filter((f) => f.status === 'received');
  const sent = (friendships ?? []).filter((f) => f.status === 'sent');
  const friends = (friendships ?? []).filter((f) => f.status === 'friends');

  async function act(key: string, job: () => Promise<unknown>) {
    setBusy(key);
    setError(null);
    try {
      await job();
      const [f, r] = await Promise.all([fetchFriendships(), searchingFor ? searchPeople(query.trim()) : Promise.resolve(null)]);
      setFriendships(f);
      if (r) setResults(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 12 }}>
        <BackButton />
      </View>
      <PageTitle label="Friends">
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
            {results?.map((p) => {
              const f = byUser.get(p.id);
              return (
                <PersonRow
                  key={p.id}
                  name={p.name}
                  handle={p.handle}
                  status={p.status}
                  busy={busy === p.id}
                  onAdd={() => act(p.id, () => addFriend(p.id))}
                  onAccept={f ? () => act(p.id, () => acceptFriend(f.id)) : undefined}
                  onRemove={f ? () => act(p.id, () => removeFriendship(f.id)) : undefined}
                />
              );
            })}
          </View>
        ) : (
          <>
            {received.length > 0 && (
              <Group title="Friend requests">
                {received.map((f) => (
                  <PersonRow
                    key={f.id}
                    name={f.name}
                    handle={f.handle}
                    status="received"
                    busy={busy === f.id}
                    onAccept={() => act(f.id, () => acceptFriend(f.id))}
                    onRemove={() => act(f.id, () => removeFriendship(f.id))}
                  />
                ))}
              </Group>
            )}
            <Group title={friends.length ? `Your friends (${friends.length})` : 'Your friends'}>
              {!friendships ? (
                <ActivityIndicator color={colors.accent} />
              ) : friends.length === 0 ? (
                <Text variant="bodySoft">No friends yet. Search for them above, or invite them.</Text>
              ) : (
                friends.map((f) => (
                  <PersonRow key={f.id} name={f.name} handle={f.handle} status="friends" busy={busy === f.id} onRemove={() => act(f.id, () => removeFriendship(f.id))} />
                ))
              )}
            </Group>
            {sent.length > 0 && (
              <Group title="Waiting for them to accept">
                {sent.map((f) => (
                  <PersonRow key={f.id} name={f.name} handle={f.handle} status="sent" busy={busy === f.id} onRemove={() => act(f.id, () => removeFriendship(f.id))} />
                ))}
              </Group>
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
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10, marginTop: 6 }}>
      <Text variant="label">{title}</Text>
      {children}
    </View>
  );
}

/** One person: picture, name, @handle and what you can do (Add, Accept, Requested, Friends). */
function PersonRow({
  name,
  handle,
  status,
  busy,
  onAdd,
  onAccept,
  onRemove,
}: {
  name: string;
  handle: string;
  status: Standing;
  busy: boolean;
  onAdd?: () => void;
  onAccept?: () => void;
  onRemove?: () => void;
}) {
  // Removing a friend or cancelling a request asks once more before it happens.
  const [confirming, setConfirming] = useState(false);
  const removeLabel = status === 'friends' ? 'Remove' : status === 'sent' ? 'Cancel request' : 'Decline';
  return (
    <Card style={{ padding: 12, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={name} size={44} />
        <View style={{ flex: 1 }}>
          <Text variant="strong" numberOfLines={1}>
            {name}
          </Text>
          <Text variant="tiny" numberOfLines={1}>
            @{handle}
          </Text>
        </View>
        {busy ? (
          <ActivityIndicator color={colors.accent} />
        ) : status === 'none' ? (
          <Pill label="Add" filled onPress={onAdd} a11y={`Add ${name} as a friend`} />
        ) : status === 'received' ? (
          <Pill label="Accept" filled onPress={onAccept} a11y={`Accept ${name}'s friend request`} />
        ) : status === 'sent' ? (
          <Pill label="Requested" onPress={onRemove ? () => setConfirming(true) : undefined} a11y={`Request sent to ${name}. Tap to cancel`} />
        ) : (
          <Pill label="Friends ✓" onPress={onRemove ? () => setConfirming(true) : undefined} a11y={`You and ${name} are friends`} />
        )}
      </View>
      {status === 'received' && onRemove && !busy && (
        <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Decline ${name}'s friend request`} hitSlop={6} style={{ alignSelf: 'flex-end' }}>
          <Text variant="small" style={{ color: colors.muted }}>
            Decline
          </Text>
        </Pressable>
      )}
      {confirming && !busy && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
          <Pressable onPress={() => setConfirming(false)} accessibilityRole="button" hitSlop={6}>
            <Text variant="small" style={{ color: colors.muted }}>
              Keep
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setConfirming(false);
              onRemove?.();
            }}
            accessibilityRole="button"
            accessibilityLabel={`${removeLabel}: ${name}`}
            hitSlop={6}
          >
            <Text variant="small" style={{ color: colors.accentText, fontFamily: fonts.sansSemiBold }}>
              {removeLabel}
            </Text>
          </Pressable>
        </View>
      )}
    </Card>
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
