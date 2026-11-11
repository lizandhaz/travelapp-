import type { TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef, type ComponentRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/constants/theme';
import { CompassIcon, EnvelopeIcon, HomeIcon, PersonIcon, PlusIcon } from './Icons';
import { Text } from './Text';

type Icon = (p: { color: string }) => React.ReactElement;

/**
 * The tab definitions. Expo Router needs <TabTrigger>s written directly inside
 * <TabList> in the layout file, so src/app/(tabs)/_layout.tsx renders them;
 * this file only provides the look.
 */
export const TABS: { name: string; href: '/' | '/explore' | '/log' | '/postcards' | '/profile'; label: string; Icon: Icon }[] = [
  { name: 'index', href: '/', label: 'Home', Icon: HomeIcon },
  { name: 'explore', href: '/explore', label: 'Explore', Icon: CompassIcon },
  { name: 'log', href: '/log', label: 'Log', Icon: PlusIcon },
  { name: 'postcards', href: '/postcards', label: 'Postcards', Icon: EnvelopeIcon },
  { name: 'profile', href: '/profile', label: 'You', Icon: PersonIcon },
];

export function useTabBarStyle() {
  const insets = useSafeAreaInsets();
  return [styles.bar, { paddingBottom: Math.max(insets.bottom, 6) }];
}

export const TabButton = forwardRef<ComponentRef<typeof Pressable>, TabTriggerSlotProps & { label: string; Icon: Icon; primary?: boolean; badge?: number }>(
  function TabButton({ label, Icon, primary, badge = 0, isFocused, ...props }, ref) {
    const color = isFocused ? colors.postbox : colors.inkSoft;
    return (
      <Pressable
        ref={ref}
        {...props}
        accessibilityRole="tab"
        accessibilityState={{ selected: !!isFocused }}
        accessibilityLabel={badge ? `${label}, ${badge} unread` : label}
        style={styles.tab}
      >
        {primary ? (
          <View style={styles.primary}>
            <Icon color={colors.card} />
          </View>
        ) : (
          <Icon color={color} />
        )}
        <Text style={{ fontFamily: fonts.sansMedium, fontSize: 11, color, marginTop: 2 }}>{label}</Text>
        {badge > 0 && (
          <View style={styles.badge}>
            <Text style={{ fontFamily: fonts.sansBold, fontSize: 10, color: colors.card }}>{badge}</Text>
          </View>
        )}
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,251,244,0.97)',
    borderTopWidth: 1,
    borderTopColor: colors.sand,
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  primary: {
    marginTop: -24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.postbox,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.paper,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: '28%',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.postbox,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
});
