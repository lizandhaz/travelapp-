import { useEffect, useSyncExternalStore } from 'react';

import { supabase } from './supabase';

/**
 * Your real Postcards (plan Step H, supabase/migrations/20261130120000_likes_comments_postcards.sql):
 * likes and comments on your trips, follow requests and new followers, newest first, plus the unread
 * count for Home's paper plane (what's newer than when you last opened Postcards, and requests waiting).
 * If the database update hasn't run yet, everything here is simply empty.
 */

export type LivePostcard = {
  kind: 'like' | 'comment' | 'follow_request' | 'new_follower';
  actorId: string;
  name: string;
  handle: string | null;
  avatarPath: string | null;
  tripId: string | null;
  place: string | null;
  body: string | null;
  createdAt: string;
};

type Row = { kind: LivePostcard['kind']; actor_id: string; name: string; handle: string | null; avatar_path: string | null; trip_id: string | null; place: string | null; body: string | null; created_at: string };

/** `strict` throws on a failed load (the Postcards page says so); otherwise it quietly returns none (the badge). */
export async function fetchMyPostcards(strict = false): Promise<LivePostcard[]> {
  const { data, error } = await supabase.rpc('my_postcards');
  if (error && strict) throw new Error(/network|fetch/i.test(error.message) ? 'Couldn’t connect. Check you’re online and try again.' : 'Couldn’t load your Postcards. Please try again.');
  if (error) return [];
  return ((data ?? []) as Row[]).map((r) => ({
    kind: r.kind,
    actorId: r.actor_id,
    name: r.name,
    handle: r.handle,
    avatarPath: r.avatar_path,
    tripId: r.trip_id,
    place: r.place,
    body: r.body,
    createdAt: r.created_at,
  }));
}

export async function fetchSeenAt(): Promise<string | null> {
  const { data, error } = await supabase.from('postcards_seen').select('seen_at').maybeSingle();
  return error ? null : ((data as { seen_at: string } | null)?.seen_at ?? null);
}

// The unread count, shared by Home's badge and the Postcards screen.
let unread = 0;
const listeners = new Set<() => void>();
const setUnread = (n: number) => {
  unread = n;
  listeners.forEach((l) => l());
};

/** How many Postcards are new to you: newer than when you last looked, plus follow requests waiting. */
export function unreadCount(list: LivePostcard[], seenAt: string | null): number {
  return list.filter((p) => p.kind === 'follow_request' || !seenAt || p.createdAt > seenAt).length;
}

/** Reloads the unread count (Home calls this when it comes into view). */
export async function refreshUnread(): Promise<void> {
  const [list, seenAt] = await Promise.all([fetchMyPostcards(), fetchSeenAt()]);
  setUnread(unreadCount(list, seenAt));
}

/** Marks everything seen (opening Postcards). Follow requests still count until answered. */
export async function markPostcardsSeen(list: LivePostcard[]): Promise<void> {
  setUnread(list.filter((p) => p.kind === 'follow_request').length);
  await supabase.rpc('mark_postcards_seen');
}

export function useUnreadPostcards(): number {
  useEffect(() => {
    refreshUnread().catch(() => {});
  }, []);
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => unread,
  );
}

/** "Maya liked your Corfu trip", "Tom: 'Looks amazing!'", "Sam asked to follow you". */
export function postcardLine(p: LivePostcard): string {
  const trip = p.place ? `your ${p.place} trip` : 'your trip';
  switch (p.kind) {
    case 'like':
      return `liked ${trip}`;
    case 'comment':
      return `commented on ${trip}: “${p.body ?? ''}”`;
    case 'follow_request':
      return 'asked to follow you';
    case 'new_follower':
      return 'started following you';
  }
}
