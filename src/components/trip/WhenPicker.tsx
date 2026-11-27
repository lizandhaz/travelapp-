import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { Text } from '@/components/Text';
import { colors, fonts, radius } from '@/constants/theme';
import {
  currentMonth,
  addMonths,
  daysInMonth,
  dayOf,
  dayRange,
  firstWeekday,
  longMonth,
  makeDay,
  makeMonth,
  monthIndexOf,
  monthOfDay,
  MONTH_NAMES_LONG,
  nightsBetween,
  today,
  yearOf,
} from '@/lib/months';
import type { TripDates } from '@/lib/trips';

const ITEM = 44;
const VISIBLE = 5;
const FIRST_YEAR = 1950;

/**
 * "When did you go?" (owner, Nov 2026: no more multiple choice): a month and a year on two wheels you scroll (or tap),
 * like the phone's own date picker, never past this month. Underneath, "Add exact dates" opens a calendar to tap the
 * day you arrived and the day you left; then the month follows the first day and the form works out the nights.
 */
export function WhenPicker({ month, dates, onChange }: { month: string | null; dates: TripDates | null; onChange: (month: string, dates: TripDates | null) => void }) {
  const now = currentMonth();
  const shown = month ?? now;
  const [exact, setExact] = useState(!!dates);
  // Opening it picks this month straight away, so "Save date" always has something to save.
  useEffect(() => {
    if (!month) onChange(now, null);
  }, [month, now, onChange]);

  const years = Array.from({ length: yearOf(now) - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);
  // Turning a wheel to another month clears exact dates that were in the old one.
  const setMonth = (ym: string) => {
    const capped = ym > now ? now : ym;
    onChange(capped, dates && monthOfDay(dates.start) === capped ? dates : null);
  };

  return (
    <View style={{ gap: 18 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Wheel
          label="Month"
          items={MONTH_NAMES_LONG}
          index={monthIndexOf(shown)}
          disabled={(i) => makeMonth(yearOf(shown), i) > now}
          onChange={(i) => setMonth(makeMonth(yearOf(shown), i))}
          flex={1.5}
        />
        <Wheel
          label="Year"
          items={years.map(String)}
          index={yearOf(shown) - FIRST_YEAR}
          onChange={(i) => setMonth(makeMonth(FIRST_YEAR + i, monthIndexOf(shown)))}
          flex={1}
        />
      </View>

      {!exact ? (
        <Pressable
          onPress={() => setExact(true)}
          accessibilityRole="button"
          accessibilityLabel="Add exact dates, optional"
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: pressed ? colors.sageSoft : colors.card })}
        >
          <Text variant="strong" style={{ fontSize: 14 }}>
            + Add exact dates
          </Text>
          <Text variant="small">(optional)</Text>
        </Pressable>
      ) : (
        <DateRange
          month={shown}
          dates={dates}
          onChange={(d) => onChange(d ? monthOfDay(d.start) : shown, d)}
          onStartIn={(ym) => onChange(ym, null)}
          onRemove={() => {
            setExact(false);
            onChange(shown, null);
          }}
        />
      )}
    </View>
  );
}

/** One wheel: a column you scroll that settles on the middle row, or tap a row to pick it. */
function Wheel({ label, items, index, onChange, disabled, flex }: { label: string; items: string[]; index: number; onChange: (i: number) => void; disabled?: (i: number) => boolean; flex: number }) {
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [live, setLive] = useState(index);
  // Follow the value when it changes from outside (e.g. the calendar).
  const [was, setWas] = useState(index);
  if (was !== index) {
    setWas(index);
    setLive(index);
  }
  useEffect(() => {
    ref.current?.scrollTo({ y: index * ITEM, animated: true });
  }, [index]);
  useEffect(() => () => {
    if (settle.current) clearTimeout(settle.current);
  }, []);

  const pick = (i: number) => {
    let j = Math.max(0, Math.min(items.length - 1, i));
    // A month that hasn't happened yet slides back to the latest one allowed.
    while (j > 0 && disabled?.(j)) j--;
    if (j !== i) ref.current?.scrollTo({ y: j * ITEM, animated: true });
    if (j !== index) onChange(j);
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.y / ITEM);
    setLive(i);
    // Settle once it stops moving (works the same on phones and the web).
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => pick(i), 140);
  };

  return (
    <View
      style={{ flex, height: ITEM * VISIBLE, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' }}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: items[index] }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => pick(index + (e.nativeEvent.actionName === 'increment' ? 1 : -1))}
    >
      {/* The band behind the chosen row. */}
      <View pointerEvents="none" style={{ position: 'absolute', left: 6, right: 6, top: ITEM * 2, height: ITEM, borderRadius: radius.md, backgroundColor: colors.sageSoft }} />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM}
        decelerationRate="fast"
        nestedScrollEnabled
        scrollEventThrottle={16}
        onScroll={onScroll}
        contentOffset={{ x: 0, y: index * ITEM }}
        onLayout={() => ref.current?.scrollTo({ y: index * ITEM, animated: false })}
        contentContainerStyle={{ paddingVertical: ITEM * 2 }}
      >
        {items.map((it, i) => {
          const off = disabled?.(i);
          const d = Math.abs(i - live);
          return (
            <Pressable key={it} onPress={() => (off ? null : (ref.current?.scrollTo({ y: i * ITEM, animated: true }), pick(i)))} style={{ height: ITEM, alignItems: 'center', justifyContent: 'center' }} importantForAccessibility="no" accessibilityElementsHidden>
              <Text
                style={{
                  fontFamily: d === 0 ? fonts.display : fonts.displayRegular,
                  fontSize: d === 0 ? 21 : 18,
                  color: off ? colors.line : d === 0 ? colors.ink : colors.muted,
                  opacity: d === 0 ? 1 : d === 1 ? 0.75 : 0.4,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {it}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * Tap the day you arrived, then the day you left (it can run into the next month: use ›). Days after today can't be
 * picked (no trip planning). The nights are shown as you go.
 */
function DateRange({ month, dates, onChange, onStartIn, onRemove }: { month: string; dates: TripDates | null; onChange: (d: TripDates | null) => void; onStartIn: (ym: string) => void; onRemove: () => void }) {
  const [view, setView] = useState(dates ? monthOfDay(dates.start) : month);
  // A start picked, waiting for the end (not saved until both are there).
  const [start, setStart] = useState<string | null>(null);
  const last = today();
  // Turning the wheels moves the calendar too.
  const [was, setWas] = useState(month);
  if (was !== month) {
    setWas(month);
    if (!dates && !start) setView(month);
  }

  const from = start ?? dates?.start ?? null;
  const to = start ? null : (dates?.end ?? null);
  const tap = (day: string) => {
    if (start && day > start) {
      setStart(null);
      onChange({ start, end: day });
    } else {
      setStart(day);
      onStartIn(monthOfDay(day));
    }
  };

  const days = daysInMonth(view);
  const blanks = firstWeekday(view);
  const cells: (string | null)[] = [...Array(blanks).fill(null), ...Array.from({ length: days }, (_, i) => makeDay(view, i + 1))];
  const canNext = addMonths(view, 1) <= monthOfDay(last);
  const nights = from && to ? nightsBetween(from, to) : null;

  return (
    <View style={{ gap: 12, backgroundColor: colors.cream, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable onPress={() => setView(addMonths(view, -1))} disabled={yearOf(view) <= FIRST_YEAR && monthIndexOf(view) === 0} accessibilityRole="button" accessibilityLabel="Previous month" hitSlop={10} style={{ padding: 4 }}>
          <Text variant="heading" style={{ color: colors.accentText }}>
            ‹
          </Text>
        </Pressable>
        <Text variant="subheading" style={{ flex: 1, textAlign: 'center' }} accessibilityLiveRegion="polite">
          {longMonth(view)}
        </Text>
        <Pressable onPress={() => setView(addMonths(view, 1))} disabled={!canNext} accessibilityRole="button" accessibilityLabel="Next month" hitSlop={10} style={{ padding: 4, opacity: canNext ? 1 : 0.3 }}>
          <Text variant="heading" style={{ color: colors.accentText }}>
            ›
          </Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} variant="label" style={{ flex: 1, textAlign: 'center', fontSize: 10 }}>
            {w}
          </Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <View key={`b${i}`} style={{ width: `${100 / 7}%`, height: 40 }} />;
          const future = d > last;
          const isEnd = d === from || d === to;
          const inside = !!from && !!to && d > from && d < to;
          return (
            <View key={d} style={{ width: `${100 / 7}%`, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              {/* The run of days between, joined up. */}
              {(inside || (isEnd && from && to)) && (
                <View style={{ position: 'absolute', top: 4, bottom: 4, left: d === from ? '50%' : 0, right: d === to ? '50%' : 0, backgroundColor: colors.sageSoft }} />
              )}
              <Pressable
                onPress={() => tap(d)}
                disabled={future}
                accessibilityRole="button"
                accessibilityLabel={`${dayOf(d)} ${longMonth(view)}${d === from ? ', arrived' : d === to ? ', left' : ''}`}
                accessibilityState={{ disabled: future, selected: isEnd }}
                style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: isEnd ? colors.action : 'transparent' }}
              >
                <Text style={{ fontFamily: isEnd ? fonts.sansSemiBold : fonts.sans, fontSize: 15, color: future ? colors.line : isEnd ? colors.onDark : colors.ink }}>{dayOf(d)}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text variant="small" style={{ flex: 1, color: colors.ink }} accessibilityLiveRegion="polite">
          {start ? 'Now tap the day you left' : from && to ? `${dayRange(from, to)} · ${nights} ${nights === 1 ? 'night' : 'nights'}` : 'Tap the day you arrived'}
        </Text>
        <Pressable
          onPress={() => {
            setStart(null);
            onRemove();
          }}
          accessibilityRole="button"
          accessibilityLabel="Remove exact dates"
          hitSlop={8}
        >
          <Text variant="link">Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}
