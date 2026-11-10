import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AuthFrame } from '@/components/AuthFrame';
import { CodeEntry } from '@/components/CodeEntry';
import { Text } from '@/components/Text';
import { Button, Field, Input, Notice } from '@/components/ui';
import { requestLogInCode } from '@/lib/authActions';

export default function LogIn() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const send = () => requestLogInCode(email);

  async function submit() {
    setBusy(true);
    setError(null);
    const r = await send();
    setBusy(false);
    if (r.ok) setSent(true);
    else setError(r.message);
  }

  if (sent) {
    return (
      <AuthFrame>
        <CodeEntry
          email={email.trim()}
          intro="If there's an account, we've sent a code to"
          resend={send}
          onChangeEmail={() => setSent(false)}
        />
        <Text variant="small" style={{ marginTop: 16, textAlign: 'center' }}>
          No email after a few minutes? You may need to join first.
        </Text>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame>
      <Text variant="title" style={{ marginTop: 32, fontSize: 36, lineHeight: 42 }}>
        Welcome back
      </Text>
      <Text variant="bodySoft" style={{ marginTop: 8 }}>
        Enter your email and we&apos;ll send you a code to log in.
      </Text>
      <View style={{ gap: 20, marginTop: 28 }}>
        <Field label="Email">
          <Input
            value={email}
            onChangeText={setEmail}
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="you@example.com"
            accessibilityLabel="Email"
            onSubmitEditing={submit}
          />
        </Field>
        {error && (
          <Notice>
            <Text variant="body" style={{ fontSize: 14 }}>
              {error}
            </Text>
          </Notice>
        )}
        <Button title={busy ? 'Sending…' : 'Send my code'} onPress={submit} disabled={busy} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 6 }}>
        <Text variant="small">New here?</Text>
        <Link href="/signup" asChild>
          <Pressable accessibilityRole="link">
            <Text variant="link" style={{ fontSize: 14 }}>
              Join Postcard
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthFrame>
  );
}
