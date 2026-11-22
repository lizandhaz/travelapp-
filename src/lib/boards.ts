import { Platform, Share } from 'react-native';

import { APP_NAME } from '@/constants/brand';
import { supabase } from './supabase';
import { tasteChanged } from './tasteEvents';
import { friendlyError, placeLabel, type Place, type Visibility } from './trips';

/**
 * Your saved lists ("boards"), stored in Supabase (supabase/migrations/20261122120000_boards.sql).
 * Everyone has one "Want to go" list (kind 'wish', made the first time it's needed) plus any
 * lists they make. Only the owner can see or change them for now.
 */

export const WISH_LIST_NAME = 'Want to go';

export type BoardItem = { id: string; slug: string | null; name: string; country: string; createdAt: string };
export type Board = {
  id: string;
  name: string;
  kind: 'list' | 'wish';
  visibility: Visibility;
  updatedAt: string;
  /** Newest first. */
  items: BoardItem[];
};
/** A place you're saving: a sample place page ("madeira") or any place by name. */
export type SavePlace = Place & { slug?: string | null };

const SELECT = 'id, name, kind, visibility, updated_at, board_items ( id, place_slug, name, country, created_at )';

type Row = {
  id: string;
  name: string;
  kind: 'list' | 'wish';
  visibility: Visibility;
  updated_at: string;
  board_items: { id: string; place_slug: string | null; name: string; country: string; created_at: string }[] | null;
};

function fromRow(r: Row): Board {
  return {
    id: r.id,
    name: r.name,
    kind: r.kind,
    visibility: r.visibility,
    updatedAt: r.updated_at,
    items: [...(r.board_items ?? [])]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((i) => ({ id: i.id, slug: i.place_slug, name: i.name, country: i.country, createdAt: i.created_at })),
  };
}

/** Your lists: "Want to go" first, then the most recently changed. */
export async function fetchBoards(): Promise<Board[]> {
  const { data, error } = await supabase.from('boards').select(SELECT).order('updated_at', { ascending: false });
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
    const { data, error } = await supabase.from('boards').select('id').eq('kind', 'wish').maybeSingle();
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

export async function updateBoard(id: string, changes: { name?: string; visibility?: Visibility }): Promise<void> {
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
    .insert({ board_id: boardId, place_slug: place.slug ?? null, name: place.name.trim(), country: place.country.trim() });
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
  const n = board.items.length;
  return `${n} ${n === 1 ? 'place' : 'places'} · ${board.visibility === 'friends' ? 'Friends' : 'Just me'}`;
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
