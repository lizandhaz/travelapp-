import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { addToBoard, ensureWishList, fetchBoards, findOnBoard, removeFromBoard, type SavePlace } from './boards';

/**
 * Is this place on your "Want to go" list? `toggle()` adds or removes it in one tap.
 * Re-checks each time the screen comes into view (in case it changed on Saved).
 */
export function useWantToGo(place: SavePlace) {
  const [itemId, setItemId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { name, country } = place;

  const refresh = useCallback(async () => {
    const wish = (await fetchBoards()).find((b) => b.kind === 'wish');
    setItemId((wish && findOnBoard(wish, { name, country })?.id) ?? null);
    setReady(true);
  }, [name, country]);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => setReady(true));
    }, [refresh]),
  );

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const wasSaved = !!itemId;
    setItemId(wasSaved ? null : 'saving'); // show the change straight away
    try {
      if (wasSaved && itemId !== 'saving') await removeFromBoard(itemId!);
      else await addToBoard(await ensureWishList(), place);
      await refresh();
    } catch (e) {
      setItemId(wasSaved ? itemId : null);
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return { saved: !!itemId, ready, busy, error, toggle };
}
