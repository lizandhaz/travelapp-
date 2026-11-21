import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { View, type ViewStyle } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { colors, radius } from '@/constants/theme';
import { photos, type PhotoName } from '@/lib/photos';
import { perforatedPath } from './ScoreStamp';

/** A photo (or a warm placeholder when there isn't one), filling its box. */
export function PhotoFill({ photo, uri, label }: { photo?: PhotoName | null; uri?: string | null; label?: string }) {
  const source = uri ? { uri } : photo ? photos[photo] : null;
  if (!source) {
    return (
      <LinearGradient
        colors={[colors.sand, colors.stamp]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', inset: 0 }}
        accessibilityElementsHidden
      />
    );
  }
  return (
    <Image
      source={source}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      contentFit="cover"
      transition={150}
      accessible={!!label}
      accessibilityLabel={label}
    />
  );
}

/** Dark fade at the bottom of a photo so white text on it is readable. */
export function Shade({ strength = 0.6 }: { strength?: number }) {
  return (
    <LinearGradient
      colors={['transparent', `rgba(0,0,0,${strength})`]}
      start={{ x: 0, y: 0.35 }}
      end={{ x: 0, y: 1 }}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      pointerEvents="none"
    />
  );
}

/** A rounded photo tile with optional children on top (captions, badges). */
export function PhotoTile({
  photo,
  uri,
  style,
  shade = true,
  children,
}: {
  photo?: PhotoName | null;
  uri?: string | null;
  style?: ViewStyle;
  shade?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <View style={[{ borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.sand }, style]}>
      <PhotoFill photo={photo} uri={uri} />
      {shade && <Shade />}
      {children}
    </View>
  );
}

/**
 * A photo framed like a postage stamp: white perforated edge and a dotted
 * inner border. Used for the Home hero, welcome and your trips.
 */
export function PhotoStamp({
  photo,
  uri,
  width,
  height,
  tilt = 0,
  children,
}: {
  photo?: PhotoName | null;
  uri?: string | null;
  width: number;
  height: number;
  tilt?: number;
  children?: React.ReactNode;
}) {
  const edge = Math.max(6, Math.round(width * 0.025));
  const r = Math.max(2.5, edge * 0.45);
  return (
    <View style={{ width, height, transform: [{ rotate: `${tilt}deg` }] }}>
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        <Path d={perforatedPath(width - 2, height - 2, r)} transform="translate(1,1)" fill={colors.card} stroke={colors.ink} strokeOpacity={0.1} strokeWidth={0.75} />
      </Svg>
      <View style={{ position: 'absolute', left: edge, top: edge, right: edge, bottom: edge, overflow: 'hidden', backgroundColor: colors.sand }}>
        <PhotoFill photo={photo} uri={uri} />
        <Shade />
        <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} width="100%" height="100%" pointerEvents="none">
          <Rect x={10} y={10} width={width - edge * 2 - 20} height={height - edge * 2 - 20} rx={4} fill="none" stroke={colors.onDark} strokeOpacity={0.9} strokeWidth={2} strokeDasharray="2 4" />
        </Svg>
        {children}
      </View>
    </View>
  );
}
