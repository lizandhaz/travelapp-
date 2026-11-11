import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { verifyCode, type Result } from '@/lib/authActions';
import { Airmail } from './Airmail';
import { Postmark } from './Postmark';
import { Text } from './Text';
import { Button, Card, Field, Input, ErrorNotice } from './ui';

/** Step two of joining or logging in: type the code from the email. */
export function CodeEntry({
  email,
  intro,
  resend,
  onChangeEmail,
}: {
  email: string;
  intro: string;
  resend: () => Promise<Result>;
  onChangeEmail: () => void;
}) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; detail?: string } | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    const r = await verifyCode(email, code);
    setBusy(false);
    if (!r.ok) setError(r);
  }

  async function again() {
    setInfo(null);
    setError(null);
    const r = await resend();
    if (r.ok) setInfo('Sent. Check your inbox (and spam folder).');
    else setError(r);
  }

  return (
    <Card style={{ marginTop: 32 }}>
      <Airmail />
      <View style={{ padding: 20, gap: 16 }}>
        <Postmark place="In the post" date="Check inbox" size={72} />
        <Text variant="title">Check your inbox</Text>
        <Text variant="bodySoft">
          {intro} <Text variant="strong">{email}</Text>.
        </Text>
        <Field label="Code from the email">
          <Input
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={12}
            placeholder="123456"
            accessibilityLabel="Code from the email"
            style={{ fontSize: 24, letterSpacing: 6, textAlign: 'center' }}
            onSubmitEditing={submit}
          />
        </Field>
        <ErrorNotice error={error} />
        {info && <Text variant="small">{info}</Text>}
        <Button title={busy ? 'Checking…' : 'Continue'} onPress={submit} disabled={busy} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Pressable onPress={again} hitSlop={8} accessibilityRole="button">
            <Text variant="link">Send a new code</Text>
          </Pressable>
          <Pressable onPress={onChangeEmail} hitSlop={8} accessibilityRole="button">
            <Text variant="link">Change email</Text>
          </Pressable>
        </View>
      </View>
    </Card>
  );
}
