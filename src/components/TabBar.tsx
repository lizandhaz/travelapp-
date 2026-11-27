import type { TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef, type ComponentRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/constants/theme';
import { CompassIcon, HeartIcon, HomeIcon, PersonIcon, PlusIcon } from './Icons';
import { Text } from './Text';

type Icon = (p: { color: string }) => React.ReactElement;

/**
 * The tabs: Home, Explore, the "+" (Add a trip), Saved, You.
 * Expo Router needs <TabTrigger>s written directly inside <TabList> in the
 * layout file, so src/app/(tabs)/_layout.tsx renders them; this file only
 * provides the look.
 */
export const TABS: { name: string; href: '/' | '/explore' | '/add' | '/saved' | '/profile'; label: string; Icon: Icon }[] = [
  { name: 'index', href: '/', label: 'Home', Icon: HomeIcon },
  { name: 'explore', href: '/explore', label: 'Explore', Icon: CompassIcon },
  { name: 'add', href: '/add', label: 'Add a trip', Icon: PlusIcon },
  { name: 'saved', href: '/saved', label: 'Saved', Icon: HeartIcon },
  { name: 'profile', href: '/profile', label: 'You', Icon: PersonIcon },
];

export function useTabBarStyle() {
  const insets = useSafeAreaInsets();
  return [styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }];
}

export const TabButton = forwardRef<ComponentRef<typeof Pressable>, TabTriggerSlotProps & { label: string; Icon: Icon; primary?: boolean }>(
  function TabButton({ label, Icon, primary, isFocused, ...props }, ref) {
    const color = isFocused ? colors.action : colors.muted;
    return (
      <Pressable
        ref={ref}
        {...props}
        accessibilityRole="tab"
        accessibilityState={{ selected: !!isFocused }}
        accessibilityLabel={label}
        style={styles.tab}
      >
        {primary ? (
          <View style={styles.primary}>
            <PlusIcon color={colors.onDark} size={24} strokeWidth={2.4} />
          </View>
        ) : (
          <>
            <Icon color={color} />
            <Text style={{ fontFamily: isFocused ? fonts.sansSemiBold : fonts.sansMedium, fontSize: 11, color, marginTop: 3 }}>{label}</Text>
          </>
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
    backgroundColor: 'rgba(242,237,226,0.97)',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  primary: {
    marginTop: -22,
    marginBottom: 4,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.action,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.bg,
    shadowColor: colors.action,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
