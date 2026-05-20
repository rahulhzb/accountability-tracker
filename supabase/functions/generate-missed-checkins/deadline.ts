export type ActiveGoal = {
  id: string;
  owner_user_id: string;
  challenge_id: string | null;
  created_at: string;
  deadline_time: string;
  timezone: string;
};

export type MissedCheckInCandidate = {
  challengeId: string | null;
  goalId: string;
  localDate: string;
  userId: string;
};

type LocalDateTimeParts = {
  day: string;
  hour: string;
  minute: string;
  month: string;
  second: string;
  year: string;
};

const LOCAL_DATE_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  hour: '2-digit',
  hour12: false,
  hourCycle: 'h23',
  minute: '2-digit',
  month: '2-digit',
  second: '2-digit',
  year: 'numeric',
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

function parseDeadlineSeconds(deadlineTime: string) {
  const match = deadlineTime.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);

  if (!match) {
    throw new Error('Invalid deadline time');
  }

  const [, hourText, minuteText, secondText = '00'] = match;

  return Number(hourText) * 60 * 60 + Number(minuteText) * 60 + Number(secondText);
}

function localDateKey(parts: LocalDateTimeParts) {
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function previousLocalDateKey(parts: LocalDateTimeParts) {
  const utcDate = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  utcDate.setUTCDate(utcDate.getUTCDate() - 1);

  return utcDate.toISOString().slice(0, 10);
}

function localSeconds(parts: LocalDateTimeParts) {
  return Number(parts.hour) * 60 * 60 + Number(parts.minute) * 60 + Number(parts.second);
}

export function buildMissedCheckInCandidate(
  goal: ActiveGoal,
  now: Date,
): MissedCheckInCandidate | null {
  const localParts = partsFor(now, goal.timezone);
  const deadlineSeconds = parseDeadlineSeconds(goal.deadline_time);
  const candidateLocalDate =
    localSeconds(localParts) >= deadlineSeconds
      ? localDateKey(localParts)
      : previousLocalDateKey(localParts);
  const createdLocalDate = localDateKey(partsFor(new Date(goal.created_at), goal.timezone));

  if (candidateLocalDate < createdLocalDate) {
    return null;
  }

  return {
    challengeId: goal.challenge_id,
    goalId: goal.id,
    localDate: candidateLocalDate,
    userId: goal.owner_user_id,
  };
}

export function isDuplicateCheckInError(error: { code?: string; message?: string }) {
  return error.code === '23505' || /duplicate key/i.test(error.message ?? '');
}
