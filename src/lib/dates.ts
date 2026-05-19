type LocalDateTimeParts = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
};

const LOCAL_DATE_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  hourCycle: 'h23',
};

function partsFor(date: Date, timeZone: string): LocalDateTimeParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    ...LOCAL_DATE_TIME_FORMAT_OPTIONS,
    timeZone,
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  return parts as LocalDateTimeParts;
}

function secondsSinceMidnight(hours: number, minutes: number, seconds: number) {
  return hours * 60 * 60 + minutes * 60 + seconds;
}

function parseDeadlineTime(deadlineTime: string) {
  const match = deadlineTime.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);

  if (!match) {
    throw new Error('Invalid deadlineTime. Use HH:mm or HH:mm:ss in 24-hour time.');
  }

  const [, hourText, minuteText, secondText = '00'] = match;
  const hours = Number(hourText);
  const minutes = Number(minuteText);
  const seconds = Number(secondText);

  if (hours > 23 || minutes > 59 || seconds > 59) {
    throw new Error('Invalid deadlineTime. Use HH:mm or HH:mm:ss in 24-hour time.');
  }

  return secondsSinceMidnight(hours, minutes, seconds);
}

export function getLocalDateKey(date: Date, timeZone: string): string {
  const parts = partsFor(date, timeZone);

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function hasDeadlinePassed(
  now: Date,
  deadlineTime: string,
  timeZone: string,
): boolean {
  const parts = partsFor(now, timeZone);
  const currentSeconds = secondsSinceMidnight(
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return currentSeconds >= parseDeadlineTime(deadlineTime);
}
