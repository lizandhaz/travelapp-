import { Platform, Share } from 'react-native';

import { APP_NAME } from '@/constants/brand';
import { myUserId, supabase } from './supabase';
import { tasteChanged } from './tasteEvents';
import { friendlyError, placeLabel, type Place, type Visibility } from './trips';

/**
 * Your saved lists ("boards"), stored in Supabase (supabase/migrations/20261122120000_boards.sql).
 * Everyone has one "Want to go" list (kind 'wish', made the first time it's needed) plus any
 * lists they make. Only the owner can see or change them for now.
 */

export const WISH_LIST_NAME = 'Want to go';

/** What a saved thing is: a place (the default), or a spot in a place (stay, eat, do, gem). */
export type ItemKind = 'place' | 'stay' | 'eat' | 'do' | 'gem';
export type BoardItem = {
  id: string;
  slug: string | null;
  name: string;
  country: string;
  createdAt: string;
  kind: ItemKind;
  /** The place a spot is in ("Copenhagen"), so it can sit under that place on a board. */
  parentName: string | null;
  parentSlug: string | null;
  /** Set when a Want to go place is shared with other people. */
  shareId: string | null;
};
export type Board = {
  id: string;
  name: string;
  kind: 'list' | 'wish';
  visibility: Visibility;
  updatedAt: string;
  /** A chosen cover photo (one of the app's photos), or null for the photo collage. */
  cover: string | null;
  /** Newest first. */
  items: BoardItem[];
};
/** A place you're saving: a sample place page ("madeira") or any place by name. */
export type SavePlace = Place & { slug?: string | null; kind?: ItemKind; parentName?: string | null; parentSlug?: string | null };

const SELECT =
  'id, name, kind, visibility, updated_at, cover, board_items ( id, place_slug, name, country, created_at, kind, parent_name, parent_slug, share_id )';

type Row = {
  id: string;
  name: string;
  kind: 'list' | 'wish';
  visibility: Visibility;
  updated_at: string;
  cover: string | null;
  board_items:
    | {
        id: string;
        place_slug: string | null;
        name: string;
        country: string;
        created_at: string;
        kind: ItemKind | null;
        parent_name: string | null;
        parent_slug: string | null;
        share_id: string | null;
      }[]
    | null;
};

function fromRow(r: Row): Board {
  return {
    id: r.id,
    name: r.name,
    kind: r.kind,
    visibility: r.visibility,
    updatedAt: r.updated_at,
    cover: r.cover ?? null,
    items: [...(r.board_items ?? [])]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((i) => ({
        id: i.id,
        slug: i.place_slug,
        name: i.name,
        country: i.country,
        createdAt: i.created_at,
        kind: i.kind ?? 'place',
        parentName: i.parent_name ?? null,
        parentSlug: i.parent_slug ?? null,
        shareId: i.share_id ?? null,
      })),
  };
}

/** Your lists: "Want to go" first, then the most recently changed. */
export async function fetchBoards(): Promise<Board[]> {
  const me = await myUserId();
  if (!me) return [];
  // Only yours: followers' boards are readable too now (Step C).
  const { data, error } = await supabase.from('boards').select(SELECT).eq('owner_id', me).order('updated_at', { ascending: false });
  if (error) throw new Error(friendlyError(error));
  const boards = (data as unknown as Row[]).map(fromRow);
  return [...boards.filter((b) => b.kind === 'wish'), ...boards.filter((b) => b.kind !== 'wish')];
}

export async function fetchBoard(id: string): Promise<Board | null> {
  const { data, error } = await supabase.from('boards').select(SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(friendlyError(error));
  return data ? fromRow(data as unknown as Row) : null;
}

export async function createBoard(name: string, visibility: Visibility): Promise<string> {
  const { data, error } = await supabase.from('boards').insert({ name: name.trim(), visibility }).select('id').single();
  if (error) throw new Error(friendlyError(error));
  return (data as { id: string }).id;
}

/** Your "Want to go" list, made now if you don't have one yet. Returns its id. */
export async function ensureWishList(): Promise<string> {
  const find = async () => {
    const me = await myUserId();
    const { data, error } = await supabase.from('boards').select('id').eq('kind', 'wish').eq('owner_id', me ?? '').maybeSingle();
    if (error) throw new Error(friendlyError(error));
    return (data as { id: string } | null)?.id ?? null;
  };
  const existing = await find();
  if (existing) return existing;
  const { data, error } = await supabase.from('boards').insert({ name: WISH_LIST_NAME, kind: 'wish', visibility: 'private' }).select('id').single();
  if (error?.code === '23505') return (await find())!; // made at the same moment on another screen
  if (error) throw new Error(friendlyError(error));
  return (data as { id: string }).id;
}

export async function updateBoard(id: string, changes: { name?: string; visibility?: Visibility; cover?: string | null }): Promise<void> {
  const { error } = await supabase
    .from('boards')
    .update({ ...changes, ...(changes.name != null ? { name: changes.name.trim() } : {}) })
    .eq('id', id);
  if (error) throw new Error(friendlyError(error));
}

/** Deletes a list and every place on it. */
export async function deleteBoard(id: string): Promise<void> {
  const { error } = await supabase.from('boards').delete().eq('id', id);
  if (error) throw new Error(friendlyError(error));
  tasteChanged();
}

/** Adds a place to a list. Adding a place that's already there does nothing. */
export async function addToBoard(boardId: string, place: SavePlace): Promise<void> {
  const { error } = await supabase
    .from('board_items')
    .insert({
      board_id: boardId,
      place_slug: place.slug ?? null,
      name: place.name.trim(),
      country: place.country.trim(),
      ...(place.kind && place.kind !== 'place' ? { kind: place.kind, parent_name: place.parentName ?? null, parent_slug: place.parentSlug ?? null } : {}),
    });
  if (error && error.code !== '23505') throw new Error(friendlyError(error));
  tasteChanged();
}

export async function removeFromBoard(itemId: string): Promise<void> {
  const { error } = await supabase.from('board_items').delete().eq('id', itemId);
  if (error) throw new Error(friendlyError(error));
  tasteChanged();
}

/** Is this place on the list? Matches names the way the database does (ignoring case and spaces). */
export function findOnBoard(board: Board, place: Place): BoardItem | undefined {
  const key = (p: Place) => `${p.name.trim().toLowerCase()}|${p.country.trim().toLowerCase()}`;
  return board.items.find((i) => key(i) === key(place));
}

export function boardMeta(board: Board) {
  const n = placesOn(board.items).length;
  const spots = board.items.length - n;
  const who = board.visibility === 'friends' ? 'Followers' : 'Just me';
  return `${n} ${n === 1 ? 'place' : 'places'}${spots ? ` · ${spots} ${spots === 1 ? 'spot' : 'spots'}` : ''} · ${who}`;
}

/**
 * Opens the phone's share sheet with the list as text, so you can send it to
 * friends by message, WhatsApp or email. Returns false if sharing isn't available.
 */
export async function shareBoard(board: Board): Promise<boolean> {
  const lines = board.items.map((i) => `• ${placeLabel(i)}`);
  const message = `${board.name}\n\n${lines.length ? lines.join('\n') : 'No places yet.'}\n\nFrom my ${APP_NAME} boards`;
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
      if (!navigator.clipboard) return false;
      await navigator.clipboard.writeText(message);
      return true;
    }
    await Share.share({ title: board.name, message });
    return true;
  } catch {
    return false;
  }
}

/** Only the places on a board (not the hotels, restaurants and so on saved under them). */
export const placesOn = (items: BoardItem[]) => items.filter((i) => i.kind === 'place');

/** For each of your shared Want to go places, the other people who have it ("with Maya"). */
export async function fetchSharedWishes(): Promise<Record<string, { id: string; name: string }[]>> {
  const { data, error } = await supabase.rpc('my_shared_wishes');
  if (error) return {};
  const out: Record<string, { id: string; name: string }[]> = {};
  for (const r of (data ?? []) as { item_id: string; user_id: string; name: string }[]) (out[r.item_id] ??= []).push({ id: r.user_id, name: r.name });
  return out;
}

/** Invites people (who you follow and who follow you back) to a place on your Want to go. */
export async function shareWishItem(itemId: string, userIds: string[]): Promise<number> {
  const { data, error } = await supabase.rpc('share_wish_item', { p_item: itemId, p_users: userIds });
  if (error) throw new Error(/follow you back|isn.t on your Want to go|up to 20/i.test(error.message) ? error.message : friendlyError(error));
  return (data as number) ?? 0;
}
