import {
  getLocalDateKey,
  hasDeadlinePassed,
  hasDeadlinePassedForLocalDate,
} from '../src/lib/dates';

describe('date helpers', () => {
  it('returns a stable local date key for a timezone', () => {
    const date = new Date('2026-05-18T18:00:00.000Z');

    expect(getLocalDateKey(date, 'Asia/Kolkata')).toBe('2026-05-18');
  });

  it('uses the requested timezone when UTC and local dates differ', () => {
    const date = new Date('2026-05-18T18:45:00.000Z');

    expect(getLocalDateKey(date, 'Asia/Kolkata')).toBe('2026-05-19');
    expect(getLocalDateKey(date, 'America/Los_Angeles')).toBe('2026-05-18');
  });

  it('detects a passed deadline in the user timezone', () => {
    const now = new Date('2026-05-18T16:00:00.000Z');

    expect(hasDeadlinePassed(now, '21:00:00', 'Asia/Kolkata')).toBe(true);
  });

  it('detects a future deadline in the user timezone', () => {
    const now = new Date('2026-05-18T14:00:00.000Z');

    expect(hasDeadlinePassed(now, '21:00:00', 'Asia/Kolkata')).toBe(false);
  });

  it('treats the exact deadline second as passed', () => {
    const now = new Date('2026-05-18T15:30:00.000Z');

    expect(hasDeadlinePassed(now, '21:00:00', 'Asia/Kolkata')).toBe(true);
  });

  it('parses hour and minute deadline strings', () => {
    const now = new Date('2026-05-18T15:29:59.000Z');

    expect(hasDeadlinePassed(now, '21:00', 'Asia/Kolkata')).toBe(false);
  });

  it('rejects invalid deadline strings', () => {
    const now = new Date('2026-05-18T15:30:00.000Z');

    expect(() => hasDeadlinePassed(now, '9pm', 'Asia/Kolkata')).toThrow(
      'Invalid deadlineTime',
    );
  });

  it('treats a prior local date as past even before today deadline time', () => {
    const now = new Date('2026-05-18T19:00:00.000Z');

    expect(
      hasDeadlinePassedForLocalDate(now, '2026-05-18', '21:00:00', 'Asia/Kolkata'),
    ).toBe(true);
  });

  it('treats a future local date as not past even after today deadline time', () => {
    const now = new Date('2026-05-18T16:00:00.000Z');

    expect(
      hasDeadlinePassedForLocalDate(now, '2026-05-19', '21:00:00', 'Asia/Kolkata'),
    ).toBe(false);
  });

  it('compares deadline time when the target local date is today', () => {
    const now = new Date('2026-05-18T14:00:00.000Z');

    expect(
      hasDeadlinePassedForLocalDate(now, '2026-05-18', '21:00:00', 'Asia/Kolkata'),
    ).toBe(false);
  });

  it('rejects invalid timezone strings with an app-level error', () => {
    const now = new Date('2026-05-18T15:30:00.000Z');

    expect(() => getLocalDateKey(now, 'Not/A_Timezone')).toThrow('Invalid timeZone');
  });

  it('rejects invalid Date objects with an app-level error', () => {
    const now = new Date('not a real date');

    expect(() => getLocalDateKey(now, 'Asia/Kolkata')).toThrow('Invalid date');
  });

  it('rejects invalid local date keys', () => {
    const now = new Date('2026-05-18T15:30:00.000Z');

    expect(() =>
      hasDeadlinePassedForLocalDate(now, '05/18/2026', '21:00:00', 'Asia/Kolkata'),
    ).toThrow('Invalid localDate');
  });
});
