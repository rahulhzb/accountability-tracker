# Audience-Ready MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the current functional MVP into an audience-ready consumer MVP with stronger activation, social accountability, missed-deadline recovery, streaks, calendar history, group leaderboard, and release-grade QA.

**Architecture:** Keep the current Expo + Supabase architecture. Extend the existing challenge-first model rather than creating separate product systems. Build each feature as a small vertical slice: schema/RLS when needed, API helper, screen UI, tests, simulator QA, commit.

**Tech Stack:** Expo React Native, TypeScript, Expo Router, Supabase Auth/Postgres/RLS/Edge Functions, Expo Notifications, Jest, React Native Testing Library.

---

## Product Thesis

The current product supports the mechanics of accountability, but not enough of the emotional and social loop. Before audience testing, the app must make it obvious how a user starts, invites friends, sees group momentum, recovers from misses, and feels rewarded for consistency.

The revised positioning:

> Build streaks with friends, recover from misses, and make accountability visible.

## Priority Definitions

- **P0:** Required before audience testing.
- **P1:** Strongly recommended before audience testing if timeline allows.
- **P2:** Post-audience-test or monetization-stage.

## Current Baseline

Already implemented:

- Email auth.
- Private challenges.
- Invite-code join.
- Personal and challenge goals.
- Daily check-ins.
- Feed and comments.
- Missed-check-in Edge Function foundation.
- Push notification foundation.
- Consumer-grade design system baseline.
- App typecheck and Jest gates.

Known remaining release risks:

- Onboarding is weak.
- Invite sharing is manual.
- Challenge detail is not yet the main social hub.
- Misses do not trigger a recovery loop.
- No calendar/history view.
- No streak tracking or reward moments.
- No group leaderboard.
- Goal management is incomplete.
- Push notification flow is not productized or real-device validated.

---

## File Structure

Likely new files:

- `app/onboarding.tsx`: first-run onboarding and primary activation choice.
- `app/settings.tsx`: account, notification preferences, sign out.
- `app/goals/[goalId].tsx`: goal detail, calendar, streaks, edit/archive entry point.
- `app/challenges/[challengeId]/invite.tsx`: invite code/share surface if nested route is preferred.
- `src/features/profile/api.ts`: profile read/update helpers.
- `src/features/members/api.ts`: challenge member list and group stats helpers.
- `src/features/recovery/api.ts`: recovery action helpers.
- `src/features/stats/streaks.ts`: pure streak/stat calculation.
- `src/features/stats/api.ts`: check-in history and leaderboard data queries.
- `src/features/notifications/preferences.ts`: notification preference helpers.
- `components/calendar-grid.tsx`: reusable monthly status calendar.
- `components/leaderboard-card.tsx`: group leaderboard UI.
- `components/recovery-card.tsx`: missed-deadline recovery UI.
- `tests/profile-api.test.ts`
- `tests/onboarding-screen.test.tsx`
- `tests/members-api.test.ts`
- `tests/recovery-api.test.ts`
- `tests/streaks.test.ts`
- `tests/goal-detail-screen.test.tsx`
- `tests/leaderboard.test.ts`
- `tests/settings-screen.test.tsx`

Likely modified files:

- `supabase/migrations/0001_initial_schema.sql`
- `supabase/functions/generate-missed-checkins/index.ts`
- `supabase/functions/send-reminders/index.ts`
- `src/features/auth/auth-context.tsx`
- `src/features/challenges/api.ts`
- `src/features/goals/api.ts`
- `src/features/check-ins/api.ts`
- `src/features/feed/api.ts`
- `src/features/home/api.ts`
- `src/lib/notifications.ts`
- `app/_layout.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/challenges.tsx`
- `app/(tabs)/personal.tsx`
- `app/challenges/[challengeId].tsx`
- `app/check-ins/[goalId].tsx`
- `docs/runbooks/release-checklist.md`
- `docs/runbooks/notifications.md`
- `README.md`

---

## Phase 1: Activation Onboarding (P0)

**Outcome:** A new user knows what to do first and is guided into the challenge-first loop.

### Task 1.1: Profile Setup API

**Files:**
- Create: `src/features/profile/api.ts`
- Test: `tests/profile-api.test.ts`

- [ ] Add `getProfile(userId)` and `updateProfile({ userId, displayName, timezone })`.
- [ ] Validate display name is non-empty before update.
- [ ] Test profile update trims display name and writes timezone.
- [ ] Run: `/Applications/Codex.app/Contents/Resources/node node_modules/.bin/jest --watchAll=false --runTestsByPath tests/profile-api.test.ts`
- [ ] Commit: `feat: add profile setup api`

### Task 1.2: Onboarding Screen

**Files:**
- Create: `app/onboarding.tsx`
- Modify: `app/_layout.tsx`
- Test: `tests/onboarding-screen.test.tsx`

- [ ] Add first-run screen asking for display name and timezone.
- [ ] Add three primary choices after profile save: create challenge, join challenge, start personal tracker.
- [ ] Make `Create a friend challenge` visually recommended.
- [ ] Redirect signed-in users without profile completion to `/onboarding`.
- [ ] Test routing and CTA destinations.
- [ ] Run focused screen tests.
- [ ] Commit: `feat: add activation onboarding`

### Task 1.3: Guided Empty States

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/(tabs)/challenges.tsx`
- Modify: `app/(tabs)/personal.tsx`
- Test: existing screen tests

- [ ] Replace passive empty text with action cards.
- [ ] Today empty state should recommend creating or joining a challenge.
- [ ] Challenges empty state should show create and join actions.
- [ ] Personal empty state should frame personal goals as optional fallback.
- [ ] Run focused screen tests.
- [ ] Commit: `feat: improve activation empty states`

---

## Phase 2: Invite And Group Formation (P0)

**Outcome:** Creating a group naturally leads to inviting friends.

### Task 2.1: Challenge Members API

**Files:**
- Create: `src/features/members/api.ts`
- Test: `tests/members-api.test.ts`

- [x] Add `listChallengeMembers(challengeId)`.
- [x] Return member user id, role, joined date, and profile display name/timezone.
- [x] Test query shape and error handling.
- [x] Commit: `feat: add challenge members api`

### Task 2.2: Member List On Challenge Detail

**Files:**
- Modify: `app/challenges/[challengeId].tsx`
- Test: `tests/challenge-feed-screen.test.tsx`

- [x] Show members section with owner/member labels.
- [x] Show “Waiting for friends” when only one member exists.
- [x] Add “Invite friends” CTA near member section.
- [x] Preserve existing feed/comment tests.
- [x] Commit: `feat: show challenge members`

### Task 2.3: Invite Share Surface

**Files:**
- Modify: `src/features/challenges/api.ts`
- Modify: `app/challenges/[challengeId].tsx`
- Optional create: `app/challenges/[challengeId]/invite.tsx`
- Test: `tests/challenges-screens.test.tsx`

- [x] Display invite code prominently.
- [x] Add copy/share action using React Native Share where available.
- [x] Add fallback copy text when native share is unavailable.
- [x] Test invite CTA is visible and invokes share helper.
- [x] Commit: `feat: add friend invite flow`

---

## Phase 3: Challenge Detail As Core Surface (P0)

**Outcome:** Challenge detail becomes the primary group accountability hub.

### Task 3.1: Challenge Overview Data

**Files:**
- Modify: `src/features/challenges/api.ts`
- Modify: `src/features/home/api.ts`
- Test: `tests/challenges-api.test.ts`

- [ ] Add challenge detail aggregate helper returning challenge, members, user goals, recent feed.
- [ ] Keep existing list APIs for simpler screens.
- [ ] Test aggregate helper composes expected queries.
- [ ] Commit: `feat: add challenge detail aggregate`

### Task 3.2: Challenge Detail Layout Upgrade

**Files:**
- Modify: `app/challenges/[challengeId].tsx`
- Test: `tests/challenge-feed-screen.test.tsx`

- [ ] Reorganize sections in this order: challenge header, today’s group commitments, members, feed.
- [ ] Make user check-in action prominent for their own active goals.
- [ ] Make add-goal secondary once a goal exists.
- [ ] Show better feed copy such as “Completed” with goal title and date; if profile data is available, show actor name.
- [ ] Commit: `feat: upgrade challenge detail hub`

---

## Phase 4: Miss Recovery And Fun Consequences (P0)

**Outcome:** Missing a deadline creates a recovery loop, not just a static failure event.

### Task 4.1: Recovery Schema And RLS

**Files:**
- Modify: `supabase/migrations/0001_initial_schema.sql`
- Test: `tests/rls.test.ts`

- [ ] Add `missed_rule` to `challenges` with values `visible_only`, `recovery_note`, `fun_penalty`.
- [ ] Add `recovery_actions` table with `challenge_id`, `check_in_id`, `assigned_user_id`, `template`, `status`, `note`, `completed_at`.
- [ ] Add feed event types for recovery assigned/completed.
- [ ] Add RLS: members can read; assigned user can update completion; service role can create.
- [ ] Test policies by schema assertions.
- [ ] Commit: `feat: add recovery action model`

### Task 4.2: Recovery Creation From Missed Job

**Files:**
- Modify: `supabase/functions/generate-missed-checkins/index.ts`
- Test: `tests/deadline-jobs.test.ts`

- [ ] When missed check-in is generated for a challenge with recovery rule, create pending recovery action.
- [ ] For `visible_only`, create no recovery action.
- [ ] Add feed event for recovery assignment.
- [ ] Test missed check-in creates recovery action only for configured challenges.
- [ ] Commit: `feat: create recovery actions for misses`

### Task 4.3: Recovery UI

**Files:**
- Create: `src/features/recovery/api.ts`
- Create: `components/recovery-card.tsx`
- Modify: `app/challenges/[challengeId].tsx`
- Test: `tests/recovery-api.test.ts`, `tests/challenge-feed-screen.test.tsx`

- [ ] List pending recovery actions for the challenge.
- [ ] Show recovery card for assigned user.
- [ ] Support completing recovery with optional note.
- [ ] Add feed event after recovery completion.
- [ ] Commit: `feat: add miss recovery flow`

### Task 4.4: Safe Fun Penalty Templates

**Files:**
- Modify: `src/features/recovery/api.ts`
- Modify: `app/challenges/new.tsx`
- Modify: `app/challenges/[challengeId].tsx`
- Test: `tests/recovery-api.test.ts`

- [ ] Add safe templates: recovery note, 20 pushups, comeback pledge, encourage-the-group note.
- [ ] Let challenge creator select missed-deadline rule.
- [ ] Do not add money penalties, public humiliation, or open-ended punishments in MVP.
- [ ] Commit: `feat: add safe missed-deadline rules`

---

## Phase 5: Calendar, Streaks, And Rewards (P0)

**Outcome:** Users can see progress over time and feel rewarded for consistency.

### Task 5.1: Streak Calculation

**Files:**
- Create: `src/features/stats/streaks.ts`
- Test: `tests/streaks.test.ts`

- [ ] Implement `calculateGoalStats(checkIns)` returning current streak, best streak, total done, total missed.
- [ ] Rule: `done` increments streak.
- [ ] Rule: `missed` breaks streak.
- [ ] Rule: `skipped` does not increment; for MVP it does not break streak.
- [ ] Test all rules, including gaps in dates.
- [ ] Commit: `feat: add streak calculation`

### Task 5.2: Check-In History API

**Files:**
- Create: `src/features/stats/api.ts`
- Test: `tests/stats-api.test.ts`

- [ ] Add `listGoalCheckInsForMonth(goalId, monthStart, monthEnd)`.
- [ ] Add `loadGoalStats(goalId)`.
- [ ] Enforce user access through existing RLS, not client-side trust.
- [ ] Commit: `feat: add goal history api`

### Task 5.3: Goal Detail And Calendar View

**Files:**
- Create: `app/goals/[goalId].tsx`
- Create: `components/calendar-grid.tsx`
- Modify: goal cards in Today/Personal/Challenge to open goal detail or check-in based on action area.
- Test: `tests/goal-detail-screen.test.tsx`

- [ ] Add monthly calendar grid.
- [ ] Show done/skipped/missed/pending day markers.
- [ ] Show current streak, best streak, total done, total missed.
- [ ] Tap day to show status/note.
- [ ] Commit: `feat: add goal calendar and streaks`

### Task 5.4: Streak Rewards

**Files:**
- Modify: `src/features/feed/api.ts`
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/challenges/[challengeId].tsx`
- Test: `tests/feed.test.ts`, `tests/home-screen.test.tsx`

- [ ] Add badge thresholds: 3, 7, 14, 30 days.
- [ ] Show streak chip on goal cards.
- [ ] Add feed celebration for challenge-goal streak milestones.
- [ ] Commit: `feat: add streak rewards`

---

## Phase 6: Group Momentum Leaderboard (P1)

**Outcome:** Groups get a friendly weekly momentum board without creating toxic competition.

### Task 6.1: Leaderboard Scoring

**Files:**
- Create: `src/features/stats/leaderboard.ts`
- Test: `tests/leaderboard.test.ts`

- [ ] Score weekly consistency: done = 1, skipped = 0.5, missed = 0, completed recovery = 0.5.
- [ ] Return label: `On fire`, `Consistent`, `Comeback mode`, `Needs comeback`.
- [ ] Sort by weekly score, then current streak.
- [ ] Commit: `feat: add leaderboard scoring`

### Task 6.2: Challenge Leaderboard API And UI

**Files:**
- Modify: `src/features/stats/api.ts`
- Create: `components/leaderboard-card.tsx`
- Modify: `app/challenges/[challengeId].tsx`
- Test: `tests/leaderboard.test.ts`, `tests/challenge-feed-screen.test.tsx`

- [ ] Query member weekly check-ins for a challenge.
- [ ] Compute leaderboard client-side with pure scoring function.
- [ ] Show leaderboard section on challenge detail.
- [ ] Avoid harsh bottom-user language.
- [ ] Commit: `feat: add group momentum leaderboard`

---

## Phase 7: Goal Management (P0)

**Outcome:** Users can correct, pause, and archive goals without database/manual cleanup.

### Task 7.1: Goal Update API

**Files:**
- Modify: `src/features/goals/api.ts`
- Test: `tests/goals-api.test.ts`

- [ ] Add `updateGoal({ goalId, title, deadlineTime })`.
- [ ] Add `archiveGoal(goalId)`.
- [ ] Add `pauseGoal(goalId)` and `resumeGoal(goalId)`.
- [ ] Test query shape and validation.
- [ ] Commit: `feat: add goal management api`

### Task 7.2: Goal Edit UI

**Files:**
- Modify: `app/goals/[goalId].tsx`
- Test: `tests/goal-detail-screen.test.tsx`

- [ ] Add edit title/deadline controls.
- [ ] Add pause/archive actions with confirmation alerts.
- [ ] After archive, return to previous relevant screen.
- [ ] Commit: `feat: add goal edit and archive UI`

---

## Phase 8: Check-In Experience Upgrade (P1)

**Outcome:** Check-in feels intentional and context-aware.

### Task 8.1: Check-In Context

**Files:**
- Modify: `src/features/goals/api.ts`
- Modify: `app/check-ins/[goalId].tsx`
- Test: `tests/personal-screens.test.tsx`

- [ ] Load goal title and deadline on check-in screen.
- [ ] Show whether check-in is before or after deadline.
- [ ] Show existing status if updating today’s check-in.
- [ ] Commit: `feat: improve check-in context`

### Task 8.2: Check-In Success State

**Files:**
- Modify: `app/check-ins/[goalId].tsx`
- Test: `tests/personal-screens.test.tsx`

- [ ] After submit, show short confirmation state.
- [ ] Route challenge goals back to challenge detail.
- [ ] Route personal goals back to Today or Personal.
- [ ] Commit: `feat: add check-in confirmation flow`

---

## Phase 9: Notifications Productization (P0)

**Outcome:** Push notification capability becomes a user-facing, consent-aware product flow.

### Task 9.1: Notification Permission Timing

**Files:**
- Modify: `src/lib/notifications.ts`
- Modify: `app/challenges/new.tsx`
- Modify: `app/check-ins/[goalId].tsx`
- Test: `tests/notifications.test.ts`

- [ ] Prompt after first goal creation or first check-in, not at random app start.
- [ ] Explain: “We’ll remind you before your deadline.”
- [ ] Store declined state in profile preferences.
- [ ] Commit: `feat: productize notification opt-in`

### Task 9.2: Notification Settings

**Files:**
- Create: `app/settings.tsx`
- Modify: `src/features/profile/api.ts`
- Test: `tests/settings-screen.test.tsx`

- [ ] Add reminder, missed, and comment notification toggles.
- [ ] Add sign out.
- [ ] Add privacy explanation.
- [ ] Commit: `feat: add account and notification settings`

### Task 9.3: Real Device Push QA

**Files:**
- Modify: `docs/runbooks/notifications.md`
- Modify: `docs/runbooks/release-checklist.md`

- [ ] Document real-device QA steps.
- [ ] Validate push token registration on device.
- [ ] Validate reminder notification.
- [ ] Validate missed-check-in notification.
- [ ] Validate comment notification.
- [ ] Commit: `docs: add real device push qa results`

---

## Phase 10: Final Release QA And Security (P0)

**Outcome:** The audience build is functionally, visually, and security reviewed.

### Task 10.1: Full Simulator QA

**Files:**
- Modify only files required by bugs found.
- Update: `docs/runbooks/release-checklist.md`

- [ ] Sign up.
- [ ] Complete onboarding.
- [ ] Create challenge.
- [ ] Invite/join challenge.
- [ ] Create challenge goal.
- [ ] Create personal goal.
- [ ] Submit done check-in.
- [ ] Submit skipped check-in.
- [ ] Generate or simulate missed check-in.
- [ ] Complete recovery action.
- [ ] View calendar/streaks.
- [ ] View leaderboard.
- [ ] Comment on feed.
- [ ] Commit any fixes atomically.

### Task 10.2: Security Review

**Files:**
- Modify only files required by findings.
- Update: `docs/runbooks/security.md`

- [ ] Verify personal goals remain private.
- [ ] Verify non-members cannot read challenge details, feed, recovery, leaderboard.
- [ ] Verify only assigned user can complete recovery action.
- [ ] Verify Edge Functions require bearer secrets.
- [ ] Verify service-role key is not present in repo or client env.
- [ ] Commit any fixes atomically.

### Task 10.3: Final Gates

Run:

```bash
/Applications/Codex.app/Contents/Resources/node node_modules/.bin/tsc --noEmit -p tsconfig.app.json
/Applications/Codex.app/Contents/Resources/node node_modules/.bin/jest --watchAll=false
git status --short
```

Expected:

- Typecheck exits 0.
- Jest exits 0.
- Only intentionally ignored/uncommitted local files remain.

Commit:

```bash
git add docs/runbooks/release-checklist.md docs/runbooks/security.md README.md
git commit -m "docs: mark audience ready mvp qa"
```

---

## Explicit Non-Goals Before Audience Testing

- Public groups.
- Global leaderboard.
- Money wagers or cash penalties.
- Public sharing of misses.
- Full chat.
- Photo/video proof.
- AI coaching.
- Paid subscriptions.
- App Store release automation.

---

## Execution Recommendation

Use subagent-driven implementation for this plan because tasks are mostly independent vertical slices:

1. Profile/onboarding worker.
2. Invite/members worker.
3. Recovery worker.
4. Calendar/streaks worker.
5. Leaderboard worker.
6. Notification/settings worker.
7. QA/security reviewer.

Keep commits small. Run focused tests after every task and full gates after every phase.
