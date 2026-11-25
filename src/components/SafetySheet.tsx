import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { colors, GUTTER } from '@/constants/theme';
import { blockUser, REPORT_REASONS, reportContent, type ReportReason, type ReportTarget } from '@/lib/safety';
import { Text } from './Text';
import { Button, Chip, Input } from './ui';

/**
 * "Report or block" (plan Step J): pick a reason, add a few words if you like, send. Underneath, block the
 * person (asks once more). Blocking removes follows both ways and hides you from each other; they aren't told.
 * Used for people (People), a friend's trip and comments.
 */
export function SafetySheet({ target, visible, onClose, onBlocked }: { target: ReportTarget; visible: boolean; onClose: () => void; onBlocked?: () => void }) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [askBlock, setAskBlock] = useState(false);
  const what = target.commentId ? 'this comment' : target.tripId ? `${target.name}’s trip` : target.name;

  const close = () => {
    setReason(null);
    setDetails('');
    setDone(null);
    setError(null);
    setAskBlock(false);
    onClose();
  };

  async function send() {
    if (!reason) return;
    setBusy(true);
    setError(null);
    try {
      await reportContent(target, reason, details);
      setDone('Thanks. We’ll look at it, and they won’t know it was you.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function block() {
    if (!target.userId) return;
    setBusy(true);
    setError(null);
    try {
      await blockUser(target.userId);
      setDone(`${target.name} is blocked. You won’t see each other, and they can’t follow you. Unblock any time in Settings.`);
      onBlocked?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
      setAskBlock(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: GUTTER, paddingTop: 18, paddingBottom: 10 }}>
          <Text variant="heading">Report or block</Text>
          <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
            <Text variant="link">Close</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: 40, gap: 16 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
          {done ? (
            <View style={{ gap: 16, marginTop: 8 }}>
              <Text variant="body">{done}</Text>
              <Button title="Done" onPress={close} />
            </View>
          ) : (
            <>
              <Text variant="label">Report {what}</Text>
              <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {REPORT_REASONS.map((r) => (
                  <Chip key={r.id} label={r.label} selected={reason === r.id} onPress={() => setReason(r.id)} accessibilityLabel={`Reason: ${r.label}`} />
                ))}
              </View>
              <Input value={details} onChangeText={setDetails} placeholder="Anything else we should know? (optional)" accessibilityLabel="More details (optional)" maxLength={500} multiline />
              <Button title={busy ? 'Sending…' : 'Send report'} kind="accent" disabled={!reason || busy} onPress={send} />
              {!!error && (
                <Text variant="small" style={{ color: colors.accentText }}>
                  {error}
                </Text>
              )}
              {!!target.userId && (
                <View style={{ marginTop: 18, gap: 10, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 18 }}>
                  <Text variant="label">Block {target.name}</Text>
                  <Text variant="small">You won’t see each other’s trips, they can’t follow you or find you in search, and they won’t be told.</Text>
                  {askBlock ? (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <Button title="Cancel" kind="outline" style={{ flex: 1 }} onPress={() => setAskBlock(false)} />
                      <Button title={`Yes, block`} kind="dark" style={{ flex: 1 }} disabled={busy} onPress={block} />
                    </View>
                  ) : (
                    <Button title={`Block ${target.name}`} kind="outline" onPress={() => setAskBlock(true)} />
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
