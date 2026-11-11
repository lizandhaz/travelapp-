import { useRef, type ComponentRef } from 'react';
import { TextInput, View } from 'react-native';

import { Field, Input } from './ui';

export type Dob = { day: string; month: string; year: string };

/** "YYYY-MM-DD", or "" if incomplete. */
export function dobToIso({ day, month, year }: Dob) {
  if (!day || !month || year.length !== 4) return '';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/** Day / month / year boxes: simple, works the same on every phone. */
export function DateOfBirth({ value, onChange }: { value: Dob; onChange: (v: Dob) => void }) {
  const monthRef = useRef<ComponentRef<typeof TextInput>>(null);
  const yearRef = useRef<ComponentRef<typeof TextInput>>(null);
  const digits = (s: string) => s.replace(/\D/g, '');

  return (
    <Field
      label="Date of birth"
      hint="Only you can see this. You need to be 13 or over to join. Under 18? Your profile stays private, just for friends."
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Input
          value={value.day}
          onChangeText={(t) => {
            const day = digits(t).slice(0, 2);
            onChange({ ...value, day });
            if (day.length === 2) monthRef.current?.focus();
          }}
          placeholder="DD"
          keyboardType="number-pad"
          accessibilityLabel="Day of birth"
          style={{ flex: 1, textAlign: 'center' }}
        />
        <Input
          ref={monthRef}
          value={value.month}
          onChangeText={(t) => {
            const month = digits(t).slice(0, 2);
            onChange({ ...value, month });
            if (month.length === 2) yearRef.current?.focus();
          }}
          placeholder="MM"
          keyboardType="number-pad"
          accessibilityLabel="Month of birth"
          style={{ flex: 1, textAlign: 'center' }}
        />
        <Input
          ref={yearRef}
          value={value.year}
          onChangeText={(t) => onChange({ ...value, year: digits(t).slice(0, 4) })}
          placeholder="YYYY"
          keyboardType="number-pad"
          accessibilityLabel="Year of birth"
          style={{ flex: 1.6, textAlign: 'center' }}
        />
      </View>
    </Field>
  );
}
