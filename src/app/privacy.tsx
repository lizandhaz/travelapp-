import { View } from 'react-native';

import { Text } from '@/components/Text';
import { BackButton, Card, PageTitle, Screen } from '@/components/ui';
import { APP_NAME } from '@/constants/brand';
import { colors, GUTTER } from '@/constants/theme';

/**
 * The privacy policy, in plain English (plan Step J). A first draft written from what the app really does: it must be
 * checked by someone qualified, and a contact email added, before the public launch (see docs/plan.md).
 */
const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'Who we are',
    body: [`${APP_NAME} is an app for rating holidays you’ve been on and seeing where your friends loved staying. This policy explains what we keep about you, why, who can see it, and how to delete it.`],
  },
  {
    title: 'What we keep',
    body: [
      'Your account: your name, a username, your email address (to send log-in codes) and your date of birth (to check your age). Your date of birth is only ever visible to you.',
      'What you add: your trips (where, which month or the exact dates if you give them, how long, your scores, notes, where you stayed and ate, tips, who you went with and any friends you tag), your photos, your boards and the places on them, who you follow, and your likes and comments.',
      'Photos: we shrink them and remove the hidden location data (GPS) before they are stored. We never show anyone where you are right now.',
      'Place pages you look at, so your scores can match your taste. You can turn this off, or clear it, in Settings.',
      'Some settings are kept only on your phone (for example, what your scores use).',
      'For Trips near you, you can pick a departure city or let the app find one while you use Explore. Your phone matches an approximate location to a nearby city. We keep only the city and your choice of how to set it on this device. We don’t send this information to anyone. You can change or remove your city in Settings.',
    ],
  },
  {
    title: 'Who can see it',
    body: [
      'Trips and boards set to “Followers” are seen only by people you’ve accepted as followers. Trips set to “Just me” are seen only by you.',
      'People can find you by name or username so they can ask to follow you. If you’re under 18 your profile is always private, and people who don’t already follow you (or you them) can’t find you.',
      'Likes and comments show your name only to people who know you; anyone else sees “Someone”.',
      `If you’re 18 or over you can make your profile public. Then anyone on ${APP_NAME} can see the parts you choose (trips, boards, stats), while “Just me” trips stay private. You can change this in Settings.`,
      'You can tag friends on a trip, but only people you follow who follow you back. A friend you tag can see it when they can see the trip, and can remove themselves. Their name is shown only to people who know them.',
    ],
  },
  {
    title: 'Under 18s',
    body: ['You must be 13 or over to join. If you’re 13 to 17, your profile stays private and friends-only, you can’t be found by strangers, and you can block and report anyone.'],
  },
  {
    title: 'Where it’s stored',
    body: [
      'Your account and data are stored with Supabase, our database provider. We don’t sell your data, and we don’t show you adverts based on it.',
      'If you tap a link to a booking site (like Booking.com or Airbnb), that site’s own privacy policy applies there.',
    ],
  },
  {
    title: 'Blocking and reporting',
    body: ['You can block anyone, or report a person, trip or comment. Reports are read only by us; the person isn’t told who reported them. We keep reports so we can act on them, even if the account is later deleted.'],
  },
  {
    title: 'Your rights',
    body: [
      'You can see and change what you’ve added at any time, and delete trips, photos, boards and comments.',
      'You can delete your whole account in Settings → Delete account. It deletes everything straight away and can’t be undone.',
      'Under UK data protection law you can also ask for a copy of your data, or ask us to correct or delete it.',
    ],
  },
];

export default function Privacy() {
  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 14 }}>
        <BackButton />
      </View>
      <PageTitle label="Privacy">
        <Text variant="title">Privacy policy</Text>
      </PageTitle>
      <View style={{ paddingHorizontal: GUTTER, gap: 20, paddingBottom: 30 }}>
        <Card tone="cream" style={{ padding: 14 }}>
          <Text variant="small" style={{ color: colors.ink }}>
            Draft, November 2026. This will be checked and a contact email added before {APP_NAME} opens to everyone.
          </Text>
        </Card>
        {SECTIONS.map((s) => (
          <View key={s.title} style={{ gap: 8 }}>
            <Text variant="subheading" accessibilityRole="header">
              {s.title}
            </Text>
            {s.body.map((p) => (
              <Text key={p.slice(0, 24)} variant="body">
                {p}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </Screen>
  );
}
