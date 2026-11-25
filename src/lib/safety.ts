import { myUserId, supabase } from './supabase';

/**
 * Safety basics (plan Step J, supabase/migrations/20261202120000_safety_block_report_delete.sql):
 * block and unblock people, report a person, trip or comment, and delete your account.
 */

export type ReportReason = 'spam' | 'abuse' | 'inappropriate' | 'underage' | 'other';
export const REPORT_REASONS: { id: ReportReason; label: string }[] = [
  { id: 'abuse', label: 'Bullying or abuse' },
  { id: 'inappropriate', label: 'Inappropriate' },
  { id: 'spam', label: 'Spam or fake' },
  { id: 'underage', label: 'Under 13' },
  { id: 'other', label: 'Something else' },
];

/** What's being reported: a person, one of their trips, or a comment. */
export type ReportTarget = { userId?: string | null; tripId?: string | null; commentId?: string | null; name: string };

const friendly = (e: { message?: string } | null, fallback: string) => new Error(e?.message && !/function|schema|relation/i.test(e.message) ? e.message : fallback);

export async function reportContent(t: ReportTarget, reason: ReportReason, details: string): Promise<void> {
  const { error } = await supabase.rpc('report_content', {
    p_user: t.commentId || t.tripId ? null : (t.userId ?? null),
    p_trip: t.commentId ? null : (t.tripId ?? null),
    p_comment: t.commentId ?? null,
    p_reason: reason,
    p_details: details.trim() || null,
  });
  if (error) throw friendly(error, 'Couldn’t send that report. Try again in a moment.');
}

export async function blockUser(userId: string): Promise<void> {
  const { error } = await supabase.rpc('block_user', { p_user: userId });
  if (error) throw friendly(error, 'Couldn’t block them. Try again in a moment.');
}

export async function unblockUser(userId: string): Promise<void> {
  const { error } = await supabase.from('blocks').delete().eq('blocked_id', userId);
  if (error) throw friendly(error, 'Couldn’t unblock them. Try again in a moment.');
}

export type Blocked = { userId: string; name: string; handle: string };

export async function fetchBlocks(): Promise<Blocked[]> {
  const { data, error } = await supabase.rpc('my_blocks');
  if (error) return [];
  return ((data ?? []) as { user_id: string; name: string; handle: string }[]).map((r) => ({ userId: r.user_id, name: r.name, handle: r.handle }));
}

/**
 * Deletes your account: first your photos and profile picture from storage (you may delete your own files),
 * then everything else in one go on the database, then signs you out.
 */
export async function deleteMyAccount(): Promise<void> {
  const me = await myUserId();
  if (me) {
    const bucket = supabase.storage.from('trip-photos');
    for (let page = 0; page < 20; page++) {
      const { data } = await bucket.list(me, { limit: 100 });
      if (!data?.length) break;
      const { error } = await bucket.remove(data.map((f) => `${me}/${f.name}`));
      if (error) break;
    }
  }
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw friendly(error, 'Couldn’t delete your account. Try again in a moment.');
  await supabase.auth.signOut();
}
