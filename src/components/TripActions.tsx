import { router } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Keyboard, LayoutAnimation, Modal, Platform, Pressable, ScrollView, View } from 'react-native';

import { colors, fonts, GUTTER } from '@/constants/theme';
import { sampleCountry } from '@/lib/placeFeatures';
import { addComment, toggleLike, toggleSavedTrip, useReactions } from '@/lib/reactions';
import { Avatar } from './Avatar';
import { SafetySheet } from './SafetySheet';
import { BookmarkIcon, CommentIcon, HeartIcon } from './Icons';
import { Text } from './Text';
import { Button, Input } from './ui';

/**
 * Like, comment on, or save a friend's trip (save = put the place on one of your lists).
 * The comments open in a sheet.
 */
export function TripActions({ id, who, place, slug, country }: { id: string; who: string; place: string; slug: string; country?: string }) {
  const r = useReactions(id);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState('');
  const send = () => {
    addComment(id, draft);
    setDraft('');
  };

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
        <Action
          onPress={() => toggleLike(id)}
          a11y={r.liked ? `Unlike ${who}'s trip` : `Like ${who}'s trip`}
          selected={r.liked}
          icon={<HeartIcon color={r.liked ? colors.accentDeep : colors.ink} filled={r.liked} size={21} />}
          count={r.likes}
        />
        <Action onPress={() => setOpen(true)} a11y={`Comments on ${who}'s trip, ${r.comments.length}`} icon={<CommentIcon color={colors.ink} size={21} />} count={r.comments.length} />
        <View style={{ flex: 1 }} />
        <Action
          onPress={() => setSaving(true)}
          a11y={r.saved ? `Saved. Save options for ${who}'s trip` : `Save ${place} or ${who}'s trip`}
          selected={r.saved}
          icon={<BookmarkIcon color={r.saved ? colors.olive : colors.ink} filled={r.saved} size={21} />}
          text={r.saved ? 'Saved' : 'Save'}
        />
      </View>

      {/* Save: the place (to a list) or their whole trip. */}
      <Modal visible={saving} transparent animationType="fade" onRequestClose={() => setSaving(false)}>
        <Pressable onPress={() => setSaving(false)} accessibilityLabel="Close" style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: GUTTER, paddingBottom: 36, gap: 12 }}>
            <Text variant="heading">Save</Text>
            <SaveOption
              title={`Save ${place}`}
              sub="Add the place to Want to go or one of your boards"
              onPress={() => {
                setSaving(false);
                router.push({ pathname: '/save', params: { place, country: country ?? sampleCountry(slug), slug } });
              }}
            />
            <SaveOption
              title={r.saved ? `Remove ${who}’s trip from Saved` : `Save ${who}’s trip`}
              sub={r.saved ? 'It’s in Saved → Friends’ trips' : 'Keep where they stayed, ate and what they did, in Saved'}
              selected={r.saved}
              onPress={() => {
                toggleSavedTrip(id);
                setSaving(false);
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <CommentSheet who={who} comments={r.comments} draft={draft} setDraft={setDraft} send={send} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function Action({ onPress, a11y, icon, count, text, selected }: { onPress: () => void; a11y: string; icon: React.ReactNode; count?: number; text?: string; selected?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={selected != null ? { selected } : undefined}
      hitSlop={8}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: pressed ? 0.6 : 1 })}
    >
      {icon}
      {(count != null || text) && <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.ink }}>{text ?? count}</Text>}
    </Pressable>
  );
}

function SaveOption({ title, sub, onPress, selected = false }: { title: string; sub: string; onPress: () => void; selected?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${sub}`}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, opacity: pressed ? 0.8 : 1 })}
    >
      <BookmarkIcon color={selected ? colors.olive : colors.ink} filled={selected} size={22} />
      <View style={{ flex: 1 }}>
        <Text variant="strong">{title}</Text>
        <Text variant="small">{sub}</Text>
      </View>
    </Pressable>
  );
}

/**
 * On your own trip: who liked it and what friends said (plan Step H), with a box to reply. Shows nothing
 * until someone has liked or commented.
 */
export function TripLikesAndComments({ id }: { id: string }) {
  const r = useReactions(id);
  const [draft, setDraft] = useState('');
  if (!r.likes && !r.comments.length) return null;
  const names = r.likers.filter((n) => n !== 'You');
  const likedBy = names.length <= 2 ? names.join(' and ') : `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`;
  return (
    <View style={{ gap: 12 }}>
      <Text variant="heading" accessibilityRole="header">
        Likes and comments
      </Text>
      {r.likes > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <HeartIcon color={colors.accentDeep} filled size={18} />
          <Text variant="body">
            {r.likes} {r.likes === 1 ? 'like' : 'likes'}
            {!!likedBy && <Text variant="small">{`  ·  ${likedBy}`}</Text>}
          </Text>
        </View>
      )}
      {r.comments.map((c, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <Avatar name={c.who} size={30} />
          <View style={{ flex: 1 }}>
            <Text variant="small" style={{ color: colors.ink }}>
              <Text variant="strong" style={{ fontSize: 14 }}>
                {c.who}
              </Text>
              {`  ${c.when}`}
            </Text>
            <Text variant="body" style={{ fontSize: 15 }}>
              {c.text}
            </Text>
          </View>
        </View>
      ))}
      {r.comments.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Input value={draft} onChangeText={setDraft} placeholder="Reply…" accessibilityLabel="Reply to the comments" maxLength={500} returnKeyType="send" onSubmitEditing={() => (addComment(id, draft), setDraft(''))} />
          </View>
          <Button title="Send" kind="dark" size="sm" disabled={!draft.trim()} onPress={() => (addComment(id, draft), setDraft(''))} />
        </View>
      )}
    </View>
  );
}


/**
 * How far the keyboard covers this view, so the box to write in can sit at the bottom and rise above the keyboard
 * (owner, Nov 2026: "comments down the bottom, but it mustn't get blocked"). KeyboardAvoidingView doesn't work inside an
 * iOS page sheet, so this measures where the view ends on screen and where the keyboard starts (also right on iPad,
 * where the sheet floats in the middle).
 */
function useKeyboardOverlap(ref: React.RefObject<ComponentRef<typeof View> | null>) {
  const [overlap, setOverlap] = useState(0);
  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillChangeFrame' : 'keyboardDidShow', (e) => {
      ref.current?.measureInWindow((_x, y, _w, h) => {
        if (ios) LayoutAnimation.configureNext(LayoutAnimation.create(e.duration || 250, 'keyboard', 'opacity'));
        setOverlap(Math.max(0, y + h - e.endCoordinates.screenY));
      });
    });
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', (e) => {
      if (ios) LayoutAnimation.configureNext(LayoutAnimation.create(e.duration || 250, 'keyboard', 'opacity'));
      setOverlap(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [ref]);
  return overlap;
}

/** The comments sheet: comments, newest at the bottom, and the box to write in along the bottom edge. */
function CommentSheet({
  who,
  comments,
  draft,
  setDraft,
  send,
  onClose,
}: {
  who: string;
  comments: { who: string; when: string; text: string; mine?: boolean; id?: string }[];
  draft: string;
  setDraft: (s: string) => void;
  send: () => void;
  onClose: () => void;
}) {
  const root = useRef<ComponentRef<typeof View>>(null);
  const list = useRef<ComponentRef<typeof ScrollView>>(null);
  const overlap = useKeyboardOverlap(root);
  const [reporting, setReporting] = useState<{ id: string; who: string } | null>(null);
  return (
    <View ref={root} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: GUTTER, paddingTop: 18, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.line }}>
        <Text variant="heading">Comments</Text>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close comments" hitSlop={10}>
          <Text variant="link">Done</Text>
        </Pressable>
      </View>
      <ScrollView
        ref={list}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 16, gap: 16, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })}
      >
        {comments.length === 0 && <Text variant="bodySoft">No comments yet. Say something nice to {who}.</Text>}
        {comments.map((c, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
            <Avatar name={c.who} size={34} />
            <View style={{ flex: 1 }}>
              <Text variant="small">
                <Text variant="strong" style={{ fontSize: 14 }}>
                  {c.who}
                </Text>{' '}
                <Text variant="tiny">{c.when}</Text>
              </Text>
              <Text variant="body" style={{ fontSize: 15 }}>
                {c.text}
              </Text>
              {!c.mine && !!c.id && (
                <Pressable onPress={() => setReporting({ id: c.id!, who: c.who })} accessibilityRole="button" accessibilityLabel={`Report ${c.who}'s comment`} hitSlop={6} style={{ alignSelf: 'flex-start', marginTop: 2 }}>
                  <Text variant="tiny" style={{ color: colors.muted }}>
                    Report
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingHorizontal: GUTTER, paddingTop: 12, paddingBottom: overlap > 0 ? overlap + 10 : 34, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg }}>
        <View style={{ flex: 1 }}>
          <Input value={draft} onChangeText={setDraft} placeholder={`Comment on ${who}’s trip`} accessibilityLabel="Write a comment" returnKeyType="send" onSubmitEditing={send} maxLength={500} />
        </View>
        <Button title="Send" kind="dark" size="sm" disabled={!draft.trim()} onPress={send} />
      </View>
      {!!reporting && <SafetySheet target={{ commentId: reporting.id, name: reporting.who }} visible onClose={() => setReporting(null)} />}
    </View>
  );
}
