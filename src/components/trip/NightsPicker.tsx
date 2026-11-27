import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Text } from '@/components/Text';
import { colors, fonts, radius } from '@/constants/theme';

const MAX = 365;
/** A friendly word under the number. */
const about = (n: number) => (n === 7 ? 'one week' : n === 14 ? 'two weeks' : n === 21 ? 'three weeks' : n === 28 ? 'four weeks' : null);

/**
 * "How long did you stay?" (owner, Nov 2026: no preset buckets): a big number with − and + either side. Tap to change
 * by one, hold to run through them quickly, or tap the number to type it (up to 365). Starts on a week. With exact
 * dates the number is worked out from them (`fromDates`) and the buttons rest.
 */
export function NightsPicker({ value, onChange, fromDates }: { value: number | null; onChange: (n: number) => void; /** e.g. "10–17 Aug 2026": the nights come from these dates. */ fromDates?: string | null }) {
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');
  const n = value ?? 7;
  // The latest number, for holding − or + (the timer runs between renders).
  const latest = useRef(n);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    latest.current = n;
  }, [n]);

  function step(by: number) {
    const next = Math.max(1, Math.min(MAX, latest.current + by));
    latest.current = next;
    onChange(next);
  }
  // Hold − or + to keep going, getting quicker.
  function hold(by: number) {
    let delay = 380;
    const tick = () => {
      step(by);
      delay = Math.max(60, delay * 0.8);
      timer.current = setTimeout(tick, delay);
    };
    timer.current = setTimeout(tick, delay);
  }
  function stop() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }

  // Opening it picks a week, so "Save nights" always saves something.
  useEffect(() => {
    if (value == null && !fromDates) onChange(7);
  }, [value, fromDates, onChange]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const locked = !!fromDates;
  const button = (by: number, label: string, sign: string) => (
    <Pressable
      onPress={() => step(by)}
      onLongPress={() => hold(by)}
      onPressOut={stop}
      delayLongPress={350}
      disabled={locked || (by < 0 ? n <= 1 : n >= MAX)}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => ({
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: pressed ? colors.sageSoft : colors.card,
        opacity: locked || (by < 0 ? n <= 1 : n >= MAX) ? 0.35 : 1,
      })}
    >
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 28, lineHeight: 32, color: colors.ink }}>{sign}</Text>
    </Pressable>
  );

  return (
    <View style={{ gap: 14 }}>
      <View
        accessible={!typing}
        accessibilityRole="adjustable"
        accessibilityLabel="Nights"
        accessibilityValue={{ text: `${n} ${n === 1 ? 'night' : 'nights'}` }}
        accessibilityActions={locked ? [] : [{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.cream, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 16, paddingVertical: 18 }}
      >
        {button(-1, 'One night fewer', '−')}
        <Pressable
          disabled={locked}
          onPress={() => {
            setText(String(n));
            setTyping(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Type the number of nights"
          style={{ alignItems: 'center', minWidth: 120 }}
        >
          {typing ? (
            <TextInput
              value={text}
              onChangeText={(t) => {
                const digits = t.replace(/\D/g, '').slice(0, 3);
                setText(digits);
                if (digits && Number(digits) >= 1) onChange(Math.min(MAX, Number(digits)));
              }}
              onBlur={() => setTyping(false)}
              onSubmitEditing={() => setTyping(false)}
              keyboardType="number-pad"
              returnKeyType="done"
              autoFocus
              selectTextOnFocus
              accessibilityLabel="Number of nights"
              style={{ fontFamily: fonts.display, fontSize: 52, lineHeight: 60, color: colors.ink, textAlign: 'center', minWidth: 110, padding: 0, borderBottomWidth: 2, borderBottomColor: colors.accent }}
            />
          ) : (
            <Text style={{ fontFamily: fonts.display, fontSize: 52, lineHeight: 60, color: colors.ink, fontVariant: ['tabular-nums'] }}>{n}</Text>
          )}
          <Text variant="small" style={{ color: colors.ink }}>
            {n === 1 ? 'night' : 'nights'}
            {about(n) ? ` · ${about(n)}` : ''}
          </Text>
        </Pressable>
        {button(1, 'One night more', '+')}
      </View>
      <Text variant="tiny" style={{ textAlign: 'center' }}>
        {locked ? `Worked out from your dates, ${fromDates}. Change them under “When did you go?”.` : 'Tap the number to type it, or hold − or + to go faster.'}
      </Text>
    </View>
  );
}
