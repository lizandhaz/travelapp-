import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/components/Text';
import { BackButton, Button, ErrorNotice, Field, Input, PageTitle, Screen, Segmented } from '@/components/ui';
import { colors, GUTTER } from '@/constants/theme';
import { addToBoard, createBoard, fetchBoard, updateBoard } from '@/lib/boards';
import type { Visibility } from '@/lib/trips';

const WHO = [
  ['private', 'Just me'],
  ['friends', 'Friends'],
] as const;

/**
 * Make a new list, or rename one (?id=…). Coming from "Save to a list"
 * (?place=…&country=…&slug=…), the place is added to the new list.
 */
export default function ListForm() {
  const { id, place, country, slug } = useLocalSearchParams<{ id?: string; place?: string; country?: string; slug?: string }>();
  const editing = !!id;
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [kind, setKind] = useState<'list' | 'wish'>('list');
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ message: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchBoard(id)
      .then((b) => {
        if (!b) return setError({ message: 'That list couldn’t be found. It may have been deleted.' });
        setName(b.name);
        setVisibility(b.visibility);
        setKind(b.kind);
      })
      .catch((e: Error) => setError({ message: e.message }))
      .finally(() => setLoading(false));
  }, [id]);

  const tooLong = name.trim().length > 60;

  async function save() {
    if (!name.trim() || tooLong) return;
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateBoard(id!, kind === 'wish' ? { visibility } : { name, visibility });
        router.back();
      } else {
        const newId = await createBoard(name, visibility);
        if (place) {
          await addToBoard(newId, { name: place, country: country ?? '', slug: slug || null });
          router.back();
        } else {
          router.replace(`/list/${newId}`);
        }
      }
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'Something went wrong. Please try again.' });
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 14 }}>
        <BackButton />
      </View>
      <PageTitle label={editing ? 'Edit list' : 'New list'}>
        <Text variant="title">{editing ? (kind === 'wish' ? 'Want to go' : 'Rename your list') : place ? `Save ${place} to a new list` : 'Start a new list'}</Text>
      </PageTitle>
      {loading ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <View style={{ paddingHorizontal: GUTTER, gap: 22 }}>
          {kind !== 'wish' && (
            <Field label="Name" hint={tooLong ? 'Keep it to 60 characters or fewer.' : undefined}>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Summer 2027, Long lunches…"
                accessibilityLabel="List name"
                autoFocus={!editing}
                maxLength={80}
                returnKeyType="done"
                onSubmitEditing={save}
              />
            </Field>
          )}
          <Field label="Who can see this" hint={visibility === 'friends' ? 'Friends will see this list once you add them. You can share it any time with the Share button.' : undefined}>
            <Segmented options={WHO} value={visibility} onChange={setVisibility} label="Who can see this" />
          </Field>
          <ErrorNotice error={error} />
          <Button title={saving ? 'Saving…' : editing ? 'Save' : 'Create list'} disabled={saving || !name.trim() || tooLong} onPress={save} />
        </View>
      )}
    </Screen>
  );
}
