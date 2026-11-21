/**
 * "Something that shapes your taste changed": a trip was saved or deleted, or a place
 * was added to or removed from a list. lib/taste.tsx listens and recalculates scores.
 */
const listeners = new Set<() => void>();

export function tasteChanged() {
  for (const l of listeners) l();
}

export function onTasteChanged(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
