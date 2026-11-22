import { Platform, Share } from 'react-native';

import { APP_NAME } from '@/constants/brand';
import { supabase } from './supabase';
import { friendlyError } from './trips';

/**
 * Followers and following, like Instagram (supabase/migrations/20261126120000_follows_boards_sharing.sql).
 * Everyone's account is private for now, so following someone sends a request they approve.
 * Under-18s only show up for people they already follow or who follow them (product rule 3).
 */
export type FollowStatus = 'following' | 'requested' | 'none';
export type Person = { id: string; handle: string; name: string; status: FollowStatus; followsYou: boolean };
export type FollowRow = { userId: string; handle: string; name: string; relation: 'follower' | 'following'; status: 'pending' | 'accepted'; createdAt: string };
export type Follows = {
  /** People who follow you (accepted). */
  followers: FollowRow[];
  /** People you follow (accepted). */
  following: FollowRow[];
  /** People asking to follow you. */
  requests: FollowRow[];
  /** People you've asked to follow, still waiting. */
  sent: FollowRow[];
};

function fail(error: { message?: string }): never {
  const m = error.message ?? '';
  if (/can't follow|can’t follow|isn't on the app|isn’t there any more|Too many requests/i.test(m)) throw new Error(m);
  throw new Error(friendlyError(error));
}

/** People whose name or handle matches (2+ letters). */
export async function searchPeople(query: string): Promise<Person[]> {
  if (query.replace(/^@/, '').trim().length < 2) return [];
  const { data, error } = await supabase.rpc('search_people_follows', { p_query: query });
  if (error) fail(error);
  return ((data ?? []) as { id: string; handle: string; name: string; status: FollowStatus; follows_you: boolean }[]).map((r) => ({
    id: r.id,
    handle: r.handle,
    name: r.name,
    status: r.status,
    followsYou: r.follows_you,
  }));
}

/** Your followers, who you follow, and waiting requests both ways. */
export async function fetchFollows(): Promise<Follows> {
  const { data, error } = await supabase.rpc('my_follows');
  if (error) fail(error);
  const rows = ((data ?? []) as { user_id: string; handle: string; name: string; relation: 'follower' | 'following'; status: 'pending' | 'accepted'; created_at: string }[]).map(
    (r): FollowRow => ({ userId: r.user_id, handle: r.handle, name: r.name, relation: r.relation, status: r.status, createdAt: r.created_at }),
  );
  return {
    followers: rows.filter((r) => r.relation === 'follower' && r.status === 'accepted'),
    following: rows.filter((r) => r.relation === 'following' && r.status === 'accepted'),
    requests: rows.filter((r) => r.relation === 'follower' && r.status === 'pending'),
    sent: rows.filter((r) => r.relation === 'following' && r.status === 'pending'),
  };
}

/** People you follow who follow you back: who you can invite to a Want to go place. */
export const mutuals = (f: Follows) => f.following.filter((p) => f.followers.some((q) => q.userId === p.userId));

/** Follows someone: 'following' straight away for a public account, otherwise 'requested'. */
export async function follow(userId: string): Promise<'following' | 'requested'> {
  const { data, error } = await supabase.rpc('follow_user', { p_user: userId });
  if (error) fail(error);
  return data as 'following' | 'requested';
}

/** Unfollows, or cancels a request you sent. */
export async function unfollow(userId: string, myId: string): Promise<void> {
  const { error } = await supabase.from('follows').delete().eq('follower_id', myId).eq('followee_id', userId);
  if (error) fail(error);
}

/** Lets someone who asked follow you. */
export async function acceptFollower(userId: string): Promise<void> {
  const { error } = await supabase.rpc('accept_follower', { p_user: userId });
  if (error) fail(error);
}

/** Removes a follower, or declines a request. */
export async function removeFollower(userId: string, myId: string): Promise<void> {
  const { error } = await supabase.from('follows').delete().eq('follower_id', userId).eq('followee_id', myId);
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
