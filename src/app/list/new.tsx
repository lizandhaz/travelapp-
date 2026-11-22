import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/Text';
import { BackButton, Button, ErrorNotice, Field, Input, PageTitle, Screen, Segmented } from '@/components/ui';
import { colors, GUTTER } from '@/constants/theme';
import { addToBoard, createBoard, fetchBoard, placesOn, updateBoard, type ItemKind } from '@/lib/boards';
import { photoForItem } from '@/components/lists';
import { PhotoFill } from '@/components/Photo';
import type { PhotoName } from '@/lib/photos';
import type { Visibility } from '@/lib/trips';

const WHO = [
  ['private', 'Just me'],
  ['friends', 'Followers'],
] as const;

/** Good cover photos to pick from, after the photos of places already on the board. */
const COVER_CHOICES: PhotoName[] = ['maldives-1', 'positano-1', 'hydra-1', 'kyoto-1', 'como-1', 'zanzibar-1', 'puglia-1', 'cotswolds-1', 'marrakech-1', 'copenhagen-1', 'safari-1', 'valthorens-1'];

/**
 * Make a new list, or rename one (?id=…). Coming from "Save to a list"
 * (?place=…&country=…&slug=…), the place is added to the new list.
 */
export default function ListForm() {
  const { id, place, country, slug, kind: itemKind, parent, parentSlug } = useLocalSearchParams<{
    id?: string;
    place?: string;
    country?: string;
    slug?: string;
    kind?: ItemKind;
    parent?: string;
    parentSlug?: string;
  }>();
  const editing = !!id;
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [kind, setKind] = useState<'list' | 'wish'>('list');
  const [cover, setCover] = useState<string | null>(null);
  const [boardPhotos, setBoardPhotos] = useState<PhotoName[]>([]);
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
        setCover(b.cover);
        setBoardPhotos(placesOn(b.items).map(photoForItem).filter((x): x is PhotoName => !!x));
      })
      .catch((e: Error) => setError({ message: e.message }))
      .finally(() => setLoading(false));
  }, [id]);

  const tooLong = name.trim().length > 60;
  // The place being saved (when starting a board from a place) or the board's places first, then the rest.
  const placePhoto = place && (!itemKind || itemKind === 'place') ? photoForItem({ slug: slug || null, name: place }) : parentSlug ? photoForItem({ slug: parentSlug, name: parent ?? '' }) : null;
  const coverChoices = [...new Set([...(placePhoto ? [placePhoto] : []), ...boardPhotos, ...COVER_CHOICES])];

  async function save() {
    if (!name.trim() || tooLong) return;
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateBoard(id!, kind === 'wish' ? { visibility, cover } : { name, visibility, cover });
        router.back();
      } else {
        const newId = await createBoard(name, visibility);
        if (cover) await updateBoard(newId, { cover });
        if (place) {
          const spot = !!itemKind && itemKind !== 'place';
          await addToBoard(newId, { name: place, country: country ?? '', slug: slug || null, kind: spot ? itemKind : 'place', parentName: spot ? parent || null : null, parentSlug: spot ? parentSlug || null : null });
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
      <PageTitle label={editing ? 'Edit board' : 'New board'}>
        <Text variant="title">{editing ? (kind === 'wish' ? 'Want to go' : 'Rename your board') : place ? `Save ${place} to a new board` : 'Start a new board'}</Text>
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
                accessibilityLabel="Board name"
                autoFocus={!editing}
                maxLength={80}
                returnKeyType="done"
                onSubmitEditing={save}
              />
            </Field>
          )}
          <Field label="Cover photo">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              <CoverChoice label="Collage" selected={cover == null} onPress={() => setCover(null)} />
              {coverChoices.map((p) => (
                <CoverChoice key={p} photo={p} selected={cover === p} onPress={() => setCover(p)} />
              ))}
            </ScrollView>
          </Field>
          <Field label="Who can see this" hint={visibility === 'friends' ? 'People who follow you will see this board. You can share it any time with the Share button.' : undefined}>
            <Segmented options={WHO} value={visibility} onChange={setVisibility} label="Who can see this" />
          </Field>
          <ErrorNotice error={error} />
          <Button title={saving ? 'Saving…' : editing ? 'Save' : 'Create board'} disabled={saving || !name.trim() || tooLong} onPress={save} />
        </View>
      )}
    </Screen>
  );
}

/** One cover option: a photo (or "Collage", the board's places put together). */
function CoverChoice({ photo, label, selected, onPress }: { photo?: PhotoName; label?: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label ?? `Cover photo ${photo}`}
      style={{ width: 76, height: 76, borderRadius: 14, overflow: 'hidden', borderWidth: selected ? 3 : 1, borderColor: selected ? colors.accentDeep : colors.line, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' }}
    >
      {photo ? <PhotoFill photo={photo} /> : <Text variant="small" style={{ color: colors.ink }}>{label}</Text>}
    </Pressable>
  );
}
