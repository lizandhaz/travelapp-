import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, View, StyleSheet } from 'react-native';

import { colors, fonts, GUTTER } from '@/constants/theme';
import { shareWishItem } from '@/lib/boards';
import { fetchFollows, mutuals, type FollowRow } from '@/lib/friends';
import { Avatar } from './Avatar';
import { Text } from './Text';
import { Button } from './ui';

/**
 * "Who do you want to go with?": pick people you follow who follow you back, and the place is added
 * to their Want to go too, with each other's names on it.
 */
export function InviteSheet({ itemId, place, visible, onClose, onDone, already = [] }: { itemId: string; place: string; visible: boolean; onClose: () => void; onDone: () => void; already?: string[] }) {
  const [people, setPeople] = useState<FollowRow[] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    let live = true;
    fetchFollows()
      .then((f) => live && setPeople(mutuals(f)))
      .catch((e: Error) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [visible]);

  async function invite() {
    setBusy(true);
    setError(null);
    try {
      await shareWishItem(itemId, picked);
      setPicked([]);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />
        <View style={{ backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: GUTTER, paddingBottom: 36, gap: 12, maxHeight: '80%' }}>
          <Text variant="heading">Who do you want to go with?</Text>
          <Text variant="small">{place} goes on their Want to go too, with your names on it.</Text>
          {!people && !error ? (
            <ActivityIndicator color={colors.accent} />
          ) : people && people.length === 0 ? (
            <View style={{ gap: 10 }}>
              <Text variant="body">You can invite people you follow who follow you back. Find your friends first.</Text>
              <Button
                title="Find friends"
                kind="dark"
                onPress={() => {
                  onClose();
                  router.push('/people');
                }}
              />
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ gap: 8 }}>
              {people?.map((p) => {
                const on = picked.includes(p.userId);
                const done = already.includes(p.userId);
                return (
                  <Pressable
                    key={p.userId}
                    disabled={done}
                    onPress={() => setPicked((xs) => (on ? xs.filter((x) => x !== p.userId) : [...xs, p.userId]))}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on || done, disabled: done }}
                    accessibilityLabel={`${p.name}${done ? ', already going with you' : ''}`}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: on ? colors.accentDeep : colors.line }}
                  >
                    <Avatar name={p.name} size={36} />
                    <View style={{ flex: 1 }}>
                      <Text variant="strong">{p.name}</Text>
                      <Text variant="tiny">@{p.handle}</Text>
                    </View>
                    <Text style={{ fontFamily: fonts.sansSemiBold, color: done ? colors.olive : on ? colors.accentDeep : colors.muted }}>{done ? 'Going' : on ? '✓' : ''}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
          {!!error && (
            <Text variant="small" style={{ color: colors.accentText }}>
              {error}
            </Text>
          )}
          {!!people?.length && <Button title={busy ? 'Inviting…' : picked.length ? `Invite ${picked.length}` : 'Pick people'} disabled={busy || !picked.length} onPress={invite} />}
        </View>
      </View>
    </Modal>
  );
}
