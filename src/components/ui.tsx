import { router } from 'expo-router';
import { createContext, forwardRef, useContext, useState, type ComponentRef } from 'react';
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
import { BackIcon } from './Icons';
import { Text } from './Text';

/**
 * Lets a slider hold the page still while you drag it (owner, Nov 2026: dragging the price slider moved the page).
 * `useScrollLock()(true)` when the drag starts, `(false)` when it ends. Does nothing outside a Screen.
 */
const ScrollLock = createContext<(locked: boolean) => void>(() => {});
export const useScrollLock = () => useContext(ScrollLock);

/** Scrolling screen with safe-area padding at the top and room for the tab bar below. */
export const Screen = forwardRef<ComponentRef<typeof ScrollView>, ScrollViewProps & { tabBar?: boolean; contentStyle?: ViewStyle; noTopInset?: boolean }>(
  function Screen({ children, tabBar = false, contentStyle, noTopInset = false, ...props }, ref) {
    const insets = useSafeAreaInsets();
    const [locked, setLocked] = useState(false);
    return (
      // The provider sits outside the ScrollView: inside, it would be the ScrollView's only child, and a screen's
      // stickyHeaderIndices={[0]} would pin the whole page (owner, Nov 2026: Explore stopped scrolling).
      <ScrollLock.Provider value={setLocked}>
      <ScrollView
        ref={ref}
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[{ paddingTop: noTopInset ? 0 : insets.top, paddingBottom: (tabBar ? 120 : 48) + insets.bottom }, contentStyle]}
        keyboardShouldPersistTaps="handled"
        // iPhone: scroll so a focused text box isn't hidden behind the keyboard.
        automaticallyAdjustKeyboardInsets
        {...props}
        scrollEnabled={!locked && (props.scrollEnabled ?? true)}
      >
        {children}
      </ScrollView>
      </ScrollLock.Provider>
    );
  },
);

/** Small uppercase label above a big heading. */
export function PageTitle({ label, children, right }: { label?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={{ paddingHorizontal: GUTTER, paddingTop: 20, paddingBottom: 18, flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
      <View style={{ flex: 1, gap: 6 }}>
        {label && <Text variant="label">{label}</Text>}
        {children}
      </View>
      {right}
    </View>
  );
}

/** Section heading with an optional "See all" link on the right. */
export function SectionHeader({ children, action, onAction }: { children: React.ReactNode; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: GUTTER, marginBottom: 12 }}>
      <View style={{ flexShrink: 1 }}>{typeof children === 'string' ? <Text variant="heading" accessibilityRole="header">{children}</Text> : children}</View>
      {action && (
        <Pressable onPress={onAction} accessibilityRole="link" hitSlop={10}>
          <Text variant="link">{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

/** Round white icon button (search, postcards, settings, back). */
export function IconCircle({
  children,
  onPress,
  label,
  badge = 0,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  label: string;
  badge?: number;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={badge ? `${label}, ${badge} new` : label}
      hitSlop={6}
      style={({ pressed }) => [styles.iconCircle, pressed && { opacity: 0.8 }, style]}
    >
      {children}
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={{ fontFamily: fonts.sansBold, fontSize: 10, color: colors.card }}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function BackButton({ onPhoto = false }: { onPhoto?: boolean }) {
  return (
    <IconCircle label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={onPhoto ? { borderWidth: 0 } : undefined}>
      <BackIcon color={colors.ink} />
    </IconCircle>
  );
}

type ButtonKind = 'dark' | 'accent' | 'outline';

export function Button({
  title,
  kind = 'dark',
  size = 'md',
  style,
  disabled,
  icon,
  ...props
}: PressableProps & { title: string; kind?: ButtonKind; size?: 'md' | 'lg' | 'sm'; style?: ViewStyle; /** Shown before the title (draw it in the button's text colour). */ icon?: React.ReactNode }) {
  const bg = kind === 'dark' ? colors.olive : kind === 'accent' ? colors.action : colors.card;
  const fg = kind === 'outline' ? colors.ink : colors.onDark;
  const pad = size === 'lg' ? 18 : size === 'sm' ? 9 : 14;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: radius.pill,
          paddingVertical: pad,
          paddingHorizontal: size === 'sm' ? 16 : 22,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          borderWidth: kind === 'outline' ? 1 : 0,
          borderColor: colors.line,
          opacity: disabled ? 0.6 : pressed ? 0.88 : 1,
        },
        style,
      ]}
      {...props}
    >
      {icon}
      <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: size === 'lg' ? 18 : size === 'sm' ? 14 : 16, color: fg }}>{title}</Text>
    </Pressable>
  );
}

export const Input = forwardRef<ComponentRef<typeof TextInput>, TextInputProps & { icon?: React.ReactNode }>(function Input(
  { style, icon, ...props },
  ref,
) {
  return (
    <View style={[styles.inputWrap, props.multiline && { alignItems: 'flex-start' }]}>
      {icon}
      <TextInput ref={ref} placeholderTextColor="rgba(100,104,88,0.75)" style={[styles.input, style]} {...props} />
    </View>
  );
});

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
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
  accessibilityLabel,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: selected ? colors.action : colors.line,
        backgroundColor: selected ? colors.action : colors.card,
        paddingHorizontal: 16,
        paddingVertical: 9,
      }}
    >
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: selected ? colors.onDark : colors.ink }}>{label}</Text>
    </Pressable>
  );
}

/** Two or three options in a white pill, the chosen one in navy ("For you / Friends"). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly (readonly [T, string])[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <View accessibilityRole="tablist" accessibilityLabel={label} style={styles.segmented}>
      {options.map(([id, text]) => {
        const on = value === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(id)}
            style={{ flex: 1, borderRadius: radius.pill, paddingVertical: 11, backgroundColor: on ? colors.action : 'transparent' }}
          >
            <Text style={{ textAlign: 'center', fontFamily: fonts.sansSemiBold, fontSize: 15, color: on ? colors.onDark : colors.muted }}>{text}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Soft colour fills from the palette, for cards and bands. */
export type Tone = 'white' | 'cream' | 'blush' | 'sage' | 'sky';
export const TONES: Tone[] = ['blush', 'sage', 'sky'];
export const toneFill = (tone: Tone) =>
  tone === 'cream' ? colors.cream : tone === 'blush' ? colors.blushSoft : tone === 'sage' ? colors.sageSoft : tone === 'sky' ? colors.skySoft : colors.card;

export function Card({ children, style, tone = 'white' }: { children: React.ReactNode; style?: ViewStyle; tone?: Tone }) {
  return <View style={[styles.card, tone !== 'white' && { backgroundColor: toneFill(tone), borderColor: tone === 'cream' ? colors.line : 'transparent' }, style]}>{children}</View>;
}

export function Notice({ tone = 'error', children }: { tone?: 'error' | 'info'; children: React.ReactNode }) {
  return (
    <View
      accessibilityRole="alert"
      style={{
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: tone === 'error' ? 'rgba(196,122,92,0.4)' : colors.line,
        backgroundColor: tone === 'error' ? 'rgba(231,185,178,0.22)' : colors.card,
        padding: 14,
        gap: 2,
      }}
    >
      {children}
    </View>
  );
}

/** A problem message, with Supabase's own wording in small print underneath (helps spot setup issues). */
/**
 * A page that couldn't load (overnight audit, Nov 2026): back, what went wrong ("Couldn't connect…"), and Try again.
 * Used where a failed connection used to look like "not found".
 */
export function LoadFailed({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 14, gap: 16 }}>
        <BackButton />
        <Text variant="body" accessibilityRole="alert">
          {message}
        </Text>
        <Button title="Try again" kind="outline" onPress={onRetry} style={{ alignSelf: 'flex-start' }} />
      </View>
    </Screen>
  );
}

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

export const styles = StyleSheet.create({
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontFamily: fonts.sans,
    fontSize: 17,
    color: colors.ink,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  segmented: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    padding: 4,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accentDeep,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  gutter: { paddingHorizontal: GUTTER },
});

/** A small "Example" tag for sample content (owner, Nov 2026: make clear what's made up while COVA is in testing). */
export function ExampleTag({ onPhoto = false }: { onPhoto?: boolean }) {
  return (
    <View
      accessibilityLabel="Example"
      style={{ alignSelf: 'center', borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 1, backgroundColor: onPhoto ? 'rgba(255,255,255,0.22)' : colors.sand }}
    >
      <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 10, letterSpacing: 0.6, color: onPhoto ? colors.onDark : colors.muted }}>EXAMPLE</Text>
    </View>
  );
}
