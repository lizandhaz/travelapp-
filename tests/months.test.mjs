// Exact trip dates (owner, Nov 2026): nights between two days, calendar layout and how a range reads. Run with: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { dayRange, daysInMonth, firstWeekday, nightsBetween } from '../src/lib/months.ts';

test('nights between arriving and leaving, across months, years and a leap day', () => {
  assert.equal(nightsBetween('2026-08-10', '2026-08-17'), 7);
  assert.equal(nightsBetween('2026-08-28', '2026-09-03'), 6);
  assert.equal(nightsBetween('2025-12-28', '2026-01-04'), 7);
  assert.equal(nightsBetween('2024-02-28', '2024-03-01'), 2);
  assert.equal(nightsBetween('2026-03-28', '2026-03-30'), 2, 'clocks going forward change nothing');
});

test('calendar: days in a month and the weekday the 1st falls on (Monday first)', () => {
  assert.equal(daysInMonth('2024-02'), 29);
  assert.equal(daysInMonth('2026-02'), 28);
  assert.equal(firstWeekday('2026-11'), 6); // 1 Nov 2026 is a Sunday
  assert.equal(firstWeekday('2026-06'), 0); // 1 Jun 2026 is a Monday
});

test('a range reads naturally', () => {
  assert.equal(dayRange('2026-08-10', '2026-08-17'), '10–17 Aug 2026');
  assert.equal(dayRange('2026-08-28', '2026-09-03'), '28 Aug – 3 Sep 2026');
  assert.equal(dayRange('2025-12-28', '2026-01-04'), '28 Dec 2025 – 4 Jan 2026');
});
