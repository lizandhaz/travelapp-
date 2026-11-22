import { Platform, Share } from 'react-native';

import { APP_NAME } from '@/constants/brand';
import { supabase } from './supabase';
import { friendlyError } from './trips';

/**
 * Friends (supabase/migrations/20261125120000_friends.sql): find people by name or @handle,
 * send and accept friend requests, and remove them. Under-18s only show up for their friends,
 * and can't be sent a request out of the blue (product rule 3).
 */
export type Standing = 'friends' | 'sent' | 'received' | 'none';
export type Person = { id: string; handle: string; name: string; status: Standing };
export type Friendship = { id: string; userId: string; handle: string; name: string; status: Exclude<Standing, 'none'>; createdAt: string };

function fail(error: { message?: string }): never {
  const m = error.message ?? '';
  if (/can't add|can’t add|isn't on the app|isn’t there any more|Too many requests/i.test(m)) throw new Error(m);
  throw new Error(friendlyError(error));
}

/** People whose name or handle matches (2+ letters). */
export async function searchPeople(query: string): Promise<Person[]> {
  if (query.replace(/^@/, '').trim().length < 2) return [];
  const { data, error } = await supabase.rpc('search_people', { p_query: query });
  if (error) fail(error);
  return (data as Person[]) ?? [];
}

/** Your friends and requests (sent and received), newest first. */
export async function fetchFriendships(): Promise<Friendship[]> {
  const { data, error } = await supabase.rpc('my_friendships');
  if (error) fail(error);
  return ((data ?? []) as { friendship_id: string; user_id: string; handle: string; name: string; status: Friendship['status']; created_at: string }[]).map((r) => ({
    id: r.friendship_id,
    userId: r.user_id,
    handle: r.handle,
    name: r.name,
    status: r.status,
    createdAt: r.created_at,
  }));
}

/** Sends a request (or accepts theirs, if they've already asked you). */
export async function addFriend(userId: string): Promise<'sent' | 'friends' | 'already'> {
  const { data, error } = await supabase.rpc('send_friend_request', { p_user: userId });
  if (error) fail(error);
  return data as 'sent' | 'friends' | 'already';
}

export async function acceptFriend(friendshipId: string): Promise<void> {
  const { error } = await supabase.rpc('accept_friend_request', { p_friendship: friendshipId });
  if (error) fail(error);
}

/** Cancels a request you sent, declines one you got, or unfriends. */
export async function removeFriendship(friendshipId: string): Promise<void> {
  const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
  if (error) fail(error);
}

/** Shares an invite through the phone's share sheet (copied to the clipboard on web). */
export async function inviteFriends(handle: string | null | undefined): Promise<boolean> {
  const message = `Come and rate holidays with me on ${APP_NAME}!${handle ? ` Find me as @${handle}.` : ''}`;
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
      if (!navigator.clipboard) return false;
      await navigator.clipboard.writeText(message);
      return true;
    }
    await Share.share({ message });
    return true;
  } catch {
    return false;
  }
}
