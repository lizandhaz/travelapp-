import { router, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { Avatar } from '@/components/Avatar';
import { HeartIcon, CommentIcon, AddPersonIcon } from '@/components/Icons';
import { Star } from '@/components/Wordmark';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, PageTitle, Screen, SectionHeader } from '@/components/ui';
import { colors, GUTTER, radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { acceptFollower, fetchFollows, removeFollower, type FollowRow } from '@/lib/friends';
import { postedAgo } from '@/lib/friendsFeed';
import { photos } from '@/lib/photos';
import { fetchMyPostcards, fetchSeenAt, markPostcardsSeen, postcardLine, type LivePostcard } from '@/lib/postcardsLive';
import { postcards } from '@/lib/postcards';
import { useTripPhoto } from '@/lib/useTripPhoto';

/**
 * Postcards: what the app calls notifications (product rule 4). Follow requests to answer, then likes and
 * comments on your trips and new followers (plan Step H), newest first with the new ones marked; then the
 * sample postcards about friends' trips.
 */
export default function Postcards() {
  const { session } = useAuth();
  const myId = session?.user.id ?? '';
  const [live, setLive] = useState<LivePostcard[] | null>(null);
  const [requests, setRequests] = useState<FollowRow[]>([]);
  const [seenAt, setSeenAt] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [list, seen, follows] = await Promise.all([fetchMyPostcards(), fetchSeenAt(), fetchFollows().catch(() => null)]);
        if (!active) return;
        setLive(list);
        setSeenAt(seen);
        setRequests(follows?.requests ?? []);
        markPostcardsSeen(list).catch(() => {});
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  async function answer(r: FollowRow, accept: boolean) {
    setBusy(r.userId);
    try {
      if (accept) await acceptFollower(r.userId);
      else await removeFollower(r.userId, myId);
      setRequests((list) => list.filter((x) => x.userId !== r.userId));
    } catch {
      // Leave it in the list to try again.
    } finally {
      setBusy(null);
    }
  }

  const activity = (live ?? []).filter((p) => p.kind !== 'follow_request');

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 12 }}>
        <BackButton />
      </View>
      <PageTitle label="Postcards">
        <AccentTitle before="Love from" accent="friends" />
      </PageTitle>

      {requests.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <SectionHeader>Follow requests</SectionHeader>
          <View style={{ paddingHorizontal: GUTTER, gap: 10 }}>
            {requests.map((r) => (
              <Card key={r.userId} tone="blush" style={{ padding: 14, gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Avatar name={r.name} size={42} />
                  <View style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontSize: 15 }}>
                      <Text variant="strong">{r.name}</Text> asked to follow you
                    </Text>
                    <Text variant="tiny">
                      @{r.handle} · {postedAgo(r.createdAt)}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button title="Accept" kind="accent" size="sm" style={{ flex: 1 }} disabled={busy === r.userId} onPress={() => answer(r, true)} accessibilityLabel={`Accept ${r.name}`} />
                  <Button title="Decline" kind="outline" size="sm" style={{ flex: 1 }} disabled={busy === r.userId} onPress={() => answer(r, false)} accessibilityLabel={`Decline ${r.name}`} />
                </View>
              </Card>
            ))}
          </View>
        </View>
      )}

      <SectionHeader>Your trips and followers</SectionHeader>
      <View style={{ paddingHorizontal: GUTTER }}>
        {live == null ? (
          <ActivityIndicator color={colors.accent} />
        ) : activity.length === 0 ? (
          <Card style={{ padding: 16 }}>
            <Text variant="bodySoft">When friends like or comment on your trips, or start following you, it shows up here.</Text>
          </Card>
        ) : (
          activity.map((p, i) => <LiveRow key={`${p.kind}-${p.actorId}-${p.createdAt}-${i}`} p={p} isNew={!seenAt || p.createdAt > seenAt} />)
        )}
      </View>

      <View style={{ marginTop: 30 }}>
        <SectionHeader>From friends</SectionHeader>
        <View style={{ paddingHorizontal: GUTTER, gap: 2 }}>
          <Text variant="tiny" style={{ marginBottom: 6 }}>
            Examples for now, about the sample friends’ trips.
          </Text>
          {postcards.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => router.push(p.trip ? `/postcard/${p.id}` : `/place/${p.slug}`)}
              accessibilityRole="link"
              accessibilityLabel={`Postcard from ${p.from}: ${p.line}. ${p.when}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line }}
            >
              <View style={{ width: 52, height: 52, borderRadius: radius.sm + 4, overflow: 'hidden', backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' }}>
                {p.photo ? <Image source={photos[p.photo]} style={{ width: 52, height: 52 }} contentFit="cover" /> : <Star size={20} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body" style={{ fontSize: 15, lineHeight: 21 }}>
                  <Text variant="strong">{p.from}</Text> {p.line}
                </Text>
                <Text variant="tiny" style={{ marginTop: 2 }}>
                  {p.when}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

/** One real Postcard: their face, what happened, when; opens your trip (or your followers). */
function LiveRow({ p, isNew }: { p: LivePostcard; isNew: boolean }) {
  const face = useTripPhoto(p.avatarPath);
  const icon =
    p.kind === 'like' ? <HeartIcon color={colors.accentDeep} filled size={14} /> : p.kind === 'comment' ? <CommentIcon color={colors.olive} size={14} /> : <AddPersonIcon color={colors.skyDeep} size={14} />;
  const open = () => (p.tripId ? router.push(`/trip/${p.tripId}`) : router.push({ pathname: '/people', params: { tab: 'followers' } }));
  return (
    <Pressable
      onPress={open}
      accessibilityRole="link"
      accessibilityLabel={`${isNew ? 'New. ' : ''}${p.name} ${postcardLine(p)}. ${postedAgo(p.createdAt)}`}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line, opacity: pressed ? 0.85 : 1 })}
    >
      <View>
        <Avatar name={p.name} uri={face} size={44} />
        <View style={{ position: 'absolute', right: -3, bottom: -3, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="body" numberOfLines={3} style={{ fontSize: 15, lineHeight: 21 }}>
          <Text variant="strong">{p.name}</Text> {postcardLine(p)}
        </Text>
        <Text variant="tiny" style={{ marginTop: 2 }}>
          {postedAgo(p.createdAt)}
        </Text>
      </View>
      {isNew && <View accessibilityElementsHidden style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.accent }} />}
    </Pressable>
  );
}
