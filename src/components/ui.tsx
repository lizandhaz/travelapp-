import { router } from 'expo-router';
import { forwardRef, type ComponentRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type PressableProps,
  type ScrollViewProps,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import { Text } from './Text';

/** Scrolling screen with safe-area padding at the top and room for the tab bar below. */
export const Screen = forwardRef<ComponentRef<typeof ScrollView>, ScrollViewProps & { tabBar?: boolean; contentStyle?: ViewStyle }>(function Screen(
  { children, tabBar = false, contentStyle, ...props },
  ref,
) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      ref={ref}
      style={{ flex: 1, backgroundColor: colors.paper }}
      contentContainerStyle={[{ paddingTop: insets.top, paddingBottom: (tabBar ? 110 : 40) + insets.bottom }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      {children}
    </ScrollView>
  );
});

/** Title block at the top of a screen, with an optional back link and something on the right. */
export function Header({
  title,
  kicker,
  back,
  right,
}: {
  title: string;
  kicker?: string;
  back?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={{ paddingHorizontal: GUTTER, paddingTop: 20, paddingBottom: 16 }}>
      {back && <BackLink label={back} />}
      {kicker && <Text variant="kicker">{kicker}</Text>}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <Text variant="title" style={{ flexShrink: 1 }}>
          {title}
        </Text>
        {right}
      </View>
    </View>
  );
}

export function BackLink({ label = 'Back' }: { label?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      hitSlop={12}
      style={{ marginBottom: 12, alignSelf: 'flex-start' }}
    >
      <Text variant="link">← {label}</Text>
    </Pressable>
  );
}

export function Button({
  title,
  kind = 'primary',
  style,
  disabled,
  ...props
}: PressableProps & { title: string; kind?: 'primary' | 'secondary' | 'dark'; style?: ViewStyle }) {
  const bg = kind === 'primary' ? colors.postbox : kind === 'dark' ? colors.ink : 'transparent';
  const fg = kind === 'secondary' ? colors.ink : colors.card;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: radius.md,
          paddingVertical: 14,
          paddingHorizontal: 18,
          alignItems: 'center',
          borderWidth: kind === 'secondary' ? 1 : 0,
          borderColor: colors.ink,
          opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
        },
        style,
      ]}
      {...props}
    >
      <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 17, color: fg }}>{title}</Text>
    </Pressable>
  );
}

export const Input = forwardRef<ComponentRef<typeof TextInput>, TextInputProps>(function Input({ style, ...props }, ref) {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor="rgba(91,100,120,0.6)"
      style={[styles.input, style]}
      {...props}
    />
  );
});

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text variant="label">{label}</Text>
      {children}
      {hint && <Text variant="tiny">{hint}</Text>}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: selected ? colors.ink : colors.sand,
        backgroundColor: selected ? colors.ink : colors.card,
        paddingHorizontal: 12,
        paddingVertical: 7,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.sansMedium,
          fontSize: 14,
          color: selected ? colors.card : colors.inkSoft,
          textTransform: 'capitalize',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Notice({ tone = 'error', children }: { tone?: 'error' | 'info'; children: React.ReactNode }) {
  return (
    <View
      accessibilityRole="alert"
      style={{
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: tone === 'error' ? 'rgba(181,57,42,0.4)' : 'rgba(226,164,59,0.5)',
        backgroundColor: tone === 'error' ? 'rgba(181,57,42,0.08)' : 'rgba(226,164,59,0.15)',
        padding: 12,
      }}
    >
      {children}
    </View>
  );
}

export const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.ink,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  gutter: { paddingHorizontal: GUTTER },
});

/** A problem message, with Supabase's own wording in small print underneath (helps spot setup issues). */
export function ErrorNotice({ error }: { error: { message: string; detail?: string } | null }) {
  if (!error) return null;
  return (
    <Notice>
      <Text variant="body" style={{ fontSize: 14 }}>
        {error.message}
      </Text>
      {!!error.detail && (
        <Text variant="tiny" style={{ marginTop: 6 }} selectable>
          Details: {error.detail}
        </Text>
      )}
    </Notice>
  );
}
