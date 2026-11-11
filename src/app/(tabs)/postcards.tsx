import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Text } from '@/components/Text';
import { Header, Screen } from '@/components/ui';
import { colors, GUTTER } from '@/constants/theme';
import { formatDay, getPerson, postcards } from '@/lib/data';

// "Postcards" is what Postcard calls notifications.
export default function Postcards() {
  return (
    <Screen tabBar>
      <Header title="Postcards" kicker="Your post" />
      <View style={{ paddingHorizontal: GUTTER, gap: 8 }}>
        {postcards.map((p) => {
          const from = p.from ? getPerson(p.from) : undefined;
          return (
            <Link key={p.id} href={p.href as never} asChild>
              <Pressable
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: p.unread ? 'rgba(181,57,42,0.3)' : colors.sand,
                  backgroundColor: p.unread ? colors.card : 'rgba(255,251,244,0.6)',
                }}
              >
                {from ? (
                  <Avatar person={from} />
                ) : (
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.sand,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text variant="heading" style={{ color: colors.postbox }}>
                      ✉
                    </Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontSize: 14, lineHeight: 20 }}>
                    {from && <Text variant="strong">{from.name} </Text>}
                    {p.text}
                  </Text>
                  <Text variant="tiny" style={{ marginTop: 2 }}>
                    {formatDay(p.sentAt)}
                  </Text>
                </View>
                {p.unread && (
                  <View
                    accessibilityLabel="Unread"
                    style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.postbox, marginTop: 6 }}
                  />
                )}
              </Pressable>
            </Link>
          );
        })}
      </View>
    </Screen>
  );
}
