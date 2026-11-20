import { View } from 'react-native';

import { colors, GUTTER } from '@/constants/theme';
import type { Person } from '@/lib/data';
import { Airmail } from './Airmail';
import { Avatar } from './Avatar';
import { Text } from './Text';
import { BackLink, Card } from './ui';

export type ProfileStats = { count: number; countries: number; avg: string };

/** A profile page: header, three stats, optional extras, then a list of trips. */
export function ProfileView({
  person,
  isMe = false,
  stats,
  countLabel = 'Trips',
  listTitle,
  list,
  children,
  footer,
}: {
  person: Person;
  isMe?: boolean;
  stats: ProfileStats;
  countLabel?: string;
  listTitle: string;
  list: React.ReactNode;
  /** Shown just under the stats, above the list. */
  children?: React.ReactNode;
  /** Shown after the list (e.g. settings). */
  footer?: React.ReactNode;
}) {
  return (
    <View>
      <Airmail height={8} />
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 20, paddingBottom: 16, alignItems: 'center' }}>
        {!isMe && (
          <View style={{ alignSelf: 'flex-start' }}>
            <BackLink />
          </View>
        )}
        <Avatar person={person} size="lg" />
        <Text variant="title" style={{ marginTop: 12, textAlign: 'center' }}>
          {person.name}
        </Text>
        <Text variant="small">
          @{person.handle}
          {person.homeTown ? ` · ${person.homeTown}` : ''}
        </Text>
        {!!person.bio && (
          <Text variant="quote" style={{ marginTop: 12, textAlign: 'center', maxWidth: 300 }}>
            {person.bio}
          </Text>
        )}
        {!isMe && (
          <View
            style={{
              marginTop: 12,
              backgroundColor: 'rgba(62,124,122,0.15)',
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}
          >
            <Text variant="tiny" style={{ color: colors.sea, fontWeight: '600' }}>
              {person.isFriend ? 'Friends' : 'Add friend'}
            </Text>
          </View>
        )}
      </View>

      <Card style={{ marginHorizontal: GUTTER, flexDirection: 'row' }}>
        <Stat label={countLabel} value={stats.count} />
        <Stat label="Countries" value={stats.countries} border />
        <Stat label="Avg score" value={stats.avg} border />
      </Card>

      {children}

      <View style={{ paddingHorizontal: GUTTER, marginTop: 32, gap: 16 }}>
        <Text variant="heading">{listTitle}</Text>
        {list}
      </View>
      {footer}
    </View>
  );
}

function Stat({ label, value, border }: { label: string; value: string | number; border?: boolean }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderLeftWidth: border ? 1 : 0,
        borderLeftColor: colors.sand,
      }}
    >
      <Text variant="kicker" style={{ color: colors.inkSoft, fontSize: 10, letterSpacing: 1.2 }}>
        {label}
      </Text>
      <Text variant="title" style={{ fontSize: 24, lineHeight: 30 }}>
        {value}
      </Text>
    </View>
  );
}
