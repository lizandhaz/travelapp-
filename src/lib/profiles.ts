import { myUserId, supabase } from './supabase';

/**
 * Public and private profiles (owner, Nov 2026; supabase/migrations/20261203120000_public_profiles.sql).
 * Private is the default: followers see what you share. Public (18+ only) lets anyone follow you without a request,
 * and you choose, for trips, boards and stats, whether everyone or only followers see them.
 */
export type Share = 'everyone' | 'followers';
export type PrivacyChange = { is_public?: boolean; share_trips?: Share; share_boards?: Share; share_stats?: Share };

export async function updatePrivacy(change: PrivacyChange): Promise<void> {
  const me = await myUserId();
  if (!me) throw new Error('Not signed in');
  const { error } = await supabase.from('profiles').update(change).eq('id', me);
  if (error) throw new Error(/18/.test(error.message) ? 'Public profiles are for over-18s.' : 'Couldn’t save that. Try again in a moment.');
}

export type ProfileCard = {
  id: string;
  name: string;
  handle: string;
  avatarPath: string | null;
  isPublic: boolean;
  followers: number;
  following: number;
  /** me / following / requested / none */
  status: 'me' | 'following' | 'requested' | 'none';
  followsYou: boolean;
  seeTrips: boolean;
  seeBoards: boolean;
  seeStats: boolean;
  trips: number | null;
  countries: number | null;
};

type CardRow = {
  id: string; name: string; handle: string; avatar_path: string | null; is_public: boolean; followers: number; following: number;
  status: ProfileCard['status']; follows_you: boolean; see_trips: boolean; see_boards: boolean; see_stats: boolean; trips: number | null; countries: number | null;
};

/** Someone's profile card, or null if you can't see them (blocked, or an under-18 you don't know). */
export async function fetchProfileCard(userId: string): Promise<ProfileCard | null> {
  const { data, error } = await supabase.rpc('profile_card', { p_user: userId });
  const r = (data as CardRow[] | null)?.[0];
  if (error || !r) return null;
  return {
    id: r.id,
    name: r.name,
    handle: r.handle,
    avatarPath: r.avatar_path,
    isPublic: r.is_public,
    followers: Number(r.followers),
    following: Number(r.following),
    status: r.status,
    followsYou: r.follows_you,
    seeTrips: r.see_trips,
    seeBoards: r.see_boards,
    seeStats: r.see_stats,
    trips: r.trips == null ? null : Number(r.trips),
    countries: r.countries == null ? null : Number(r.countries),
  };
}
