import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { Star } from '@/components/Wordmark';
import { Text } from '@/components/Text';
import { BackButton, PageTitle, Screen } from '@/components/ui';
import { colors, GUTTER, radius } from '@/constants/theme';
import { photos } from '@/lib/photos';
import { postcards } from '@/lib/postcards';

// "Postcards" is what the app calls notifications (product rule 4).
export default function Postcards() {
  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 12 }}>
        <BackButton />
      </View>
      <PageTitle label="Postcards">
        <AccentTitle before="Love from" accent="friends" />
      </PageTitle>
      <View style={{ paddingHorizontal: GUTTER, gap: 2 }}>
        <Text variant="tiny" style={{ marginBottom: 10 }}>
          Preview: these are sample postcards.
        </Text>
        {postcards.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => router.push(`/postcard/${p.id}`)}
            accessibilityRole="link"
            accessibilityLabel={`Postcard from ${p.from}: ${p.line}. ${p.when}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line }}
          >
            <View style={{ width: 52, height: 52, borderRadius: radius.sm + 4, overflow: 'hidden', backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' }}>
              {p.photo ? <Image source={photos[p.photo]} style={{ width: 52, height: 52 }} contentFit="cover" /> : <Star size={20} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body" style={{ fontSize: 15, lineHeight: 21 }}>
                <Text variant="strong">{p.from}</Text> {p.line}
              </Text>
              <Text variant="tiny" style={{ marginTop: 2 }}>
                {p.when}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
