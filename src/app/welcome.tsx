import { Link } from 'expo-router';
import { View } from 'react-native';

import { AuthFrame } from '@/components/AuthFrame';
import { Postmark } from '@/components/Postmark';
import { Stamp } from '@/components/Stamp';
import { Text } from '@/components/Text';
import { Button } from '@/components/ui';
import { colors } from '@/constants/theme';

const STEPS = [
  ["Rate it when you're home.", 'Destination and stay, out of 10. We never share live location.'],
  ['See what friends loved.', 'The Friends feed shows every trip your people have rated.'],
  ['Get picks for you.', 'The more you rate, the better your For you suggestions.'],
];

export default function Welcome() {
  return (
    <AuthFrame>
      <View style={{ position: 'absolute', right: 0, top: -4 }}>
        <Stamp score={9} tilt={6} />
      </View>
      <Text variant="hero" style={{ marginTop: 40 }}>
        Holidays, rated by friends you <Text variant="hero" style={{ color: colors.postbox, fontFamily: 'Fraunces-Italic' }}>actually</Text> trust.
      </Text>
      <Text variant="bodySoft" style={{ marginTop: 16, fontSize: 18, lineHeight: 26 }}>
        Your friends rate where they went and where they stayed, out of 10. Add photos, food picks and top tips. No
        strangers, no sponsored reviews.
      </Text>
      <View style={{ marginTop: 24 }}>
        <Postmark place="Wish you were here" date="Postcard" />
      </View>
      <View style={{ gap: 12, marginTop: 28 }}>
        <Link href="/signup" asChild>
          <Button title="Join Postcard" />
        </Link>
        <Link href="/login" asChild>
          <Button title="I already have an account" kind="secondary" />
        </Link>
      </View>
      <View style={{ gap: 16, marginTop: 40 }}>
        {STEPS.map(([title, body], i) => (
          <View key={title} style={{ flexDirection: 'row', gap: 12 }}>
            <Text variant="heading" style={{ color: colors.postbox }}>
              {i + 1}
            </Text>
            <Text variant="body" style={{ flex: 1, fontSize: 15 }}>
              <Text variant="strong">{title}</Text> {body}
            </Text>
          </View>
        ))}
      </View>
      <Text variant="tiny" style={{ marginTop: 32 }}>
        Postcard is for ages 13 and over. Public profiles are for over-18s only.
      </Text>
    </AuthFrame>
  );
}
