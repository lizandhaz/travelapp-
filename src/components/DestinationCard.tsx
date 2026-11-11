import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { colors } from '@/constants/theme';
import { averageScore, type Destination } from '@/lib/data';
import { Photo } from './Photo';
import { Stamp } from './Stamp';
import { Text } from './Text';
import { Card } from './ui';

export function DestinationCard({ destination, note }: { destination: Destination; note?: string }) {
  const avg = averageScore(destination.slug);
  return (
    <Link href={`/destination/${destination.slug}`} asChild>
      <Pressable style={{ flex: 1 }}>
        <Card>
          <View>
            <Photo palette={destination.palette} style={{ height: 120, borderRadius: 0 }} />
            {avg !== null && (
              <View style={{ position: 'absolute', top: 8, right: 8 }}>
                <Stamp score={avg} size="sm" tilt={-4} />
              </View>
            )}
          </View>
          <View style={{ padding: 12 }}>
            <Text variant="heading" style={{ fontSize: 18, lineHeight: 22 }}>
              {destination.name}
            </Text>
            <Text variant="small">{destination.country}</Text>
            {note && (
              <Text variant="tiny" style={{ color: colors.airmail, marginTop: 6 }}>
                {note}
              </Text>
            )}
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}

/** Lays cards out two to a row. */
export function Grid({ children }: { children: React.ReactNode[] }) {
  const rows: React.ReactNode[][] = [];
  children.forEach((c, i) => (i % 2 === 0 ? rows.push([c]) : rows[rows.length - 1].push(c)));
  return (
    <View style={{ gap: 12 }}>
      {rows.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
          {row}
          {row.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
    </View>
  );
}
