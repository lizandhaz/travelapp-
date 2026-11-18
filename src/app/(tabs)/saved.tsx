import { Image } from 'expo-image';
import { View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { Text } from '@/components/Text';
import { Button, PageTitle, Screen } from '@/components/ui';
import { colors, GUTTER, radius } from '@/constants/theme';
import { photos } from '@/lib/photos';
import { boards, type Board } from '@/lib/sample';

/** Saved: your boards. Sample for now; saving for real comes in plan Step D. */
export default function Saved() {
  return (
    <Screen tabBar>
      <PageTitle label="Saved" right={<Button title="+ New board" size="sm" disabled accessibilityHint="Coming soon" />}>
        <AccentTitle before="Your" accent="lists" />
      </PageTitle>
      <View style={{ paddingHorizontal: GUTTER, gap: 14 }}>
        <Text variant="heading" accessibilityRole="header">
          Your boards
        </Text>
        <Text variant="tiny">Preview: these are sample boards. Saving places to your own boards is coming soon.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
          {boards.map((b) => (
            <BoardCard key={b.name} board={b} />
          ))}
          <View
            style={{
              width: '47%',
              aspectRatio: 1,
              borderRadius: radius.lg,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: colors.line,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Text variant="heading" style={{ color: colors.muted }}>
              +
            </Text>
            <Text variant="small">New board</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

function BoardCard({ board }: { board: Board }) {
  const [a, b, c] = board.photos;
  return (
    <View style={{ width: '47%' }} accessible accessibilityLabel={`${board.name}, ${board.meta}`}>
      <View style={{ aspectRatio: 1, borderRadius: radius.lg, overflow: 'hidden', flexDirection: 'row', gap: 2 }}>
        <Image source={photos[a]} style={{ flex: 2 }} contentFit="cover" />
        <View style={{ flex: 1, gap: 2 }}>
          {b && <Image source={photos[b]} style={{ flex: 1 }} contentFit="cover" />}
          {c && <Image source={photos[c]} style={{ flex: 1 }} contentFit="cover" />}
        </View>
      </View>
      <Text variant="strong" style={{ marginTop: 8 }}>
        {board.name}
      </Text>
      <Text variant="tiny">{board.meta}</Text>
    </View>
  );
}
