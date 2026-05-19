import { getLocalDateKey, hasDeadlinePassed } from '../src/lib/dates';

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
});
