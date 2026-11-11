import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AuthFrame } from '@/components/AuthFrame';
import { CodeEntry } from '@/components/CodeEntry';
import { DateOfBirth, dobToIso, type Dob } from '@/components/DateOfBirth';
import { Text } from '@/components/Text';
import { Button, Field, Input, ErrorNotice } from '@/components/ui';
import { requestSignUpCode } from '@/lib/authActions';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState<Dob>({ day: '', month: '', year: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; detail?: string } | null>(null);
  const [sent, setSent] = useState(false);

  const send = () => requestSignUpCode(name, email, dobToIso(dob));

  async function submit() {
    setBusy(true);
    setError(null);
    const r = await send();
    setBusy(false);
    if (r.ok) setSent(true);
    else setError(r);
  }

  if (sent) {
    return (
      <AuthFrame>
        <CodeEntry email={email.trim()} intro="We've sent a code to" resend={send} onChangeEmail={() => setSent(false)} />
      </AuthFrame>
    );
  }

  return (
    <AuthFrame>
      <Text variant="title" style={{ marginTop: 32, fontSize: 36, lineHeight: 42 }}>
        Join Postcard
      </Text>
      <Text variant="bodySoft" style={{ marginTop: 8 }}>
        No password needed. We&apos;ll email you a code to sign in.
      </Text>
      <View style={{ gap: 20, marginTop: 28 }}>
        <Field label="Your name">
          <Input value={name} onChangeText={setName} autoComplete="name" textContentType="name" accessibilityLabel="Your name" />
        </Field>
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
          />
        </Field>
        <DateOfBirth value={dob} onChange={setDob} />
        <ErrorNotice error={error} />
        <Button title={busy ? 'Sending…' : 'Send my code'} onPress={submit} disabled={busy} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 6 }}>
        <Text variant="small">Already joined?</Text>
        <Link href="/login" asChild>
          <Pressable accessibilityRole="link">
            <Text variant="link" style={{ fontSize: 14 }}>
              Log in
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthFrame>
  );
}
