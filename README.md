# Accountability Tracker

Native mobile accountability app for private friend challenges and personal daily tracking.

## Product Direction

The MVP is challenge-first. Users create or join private invite-only friend challenges, add daily goals, check in before configurable deadlines, and see completed, skipped, or missed activity in a group feed. Personal tracking is included as a supporting mode using the same goal and check-in system.

## Approved Stack

- React Native with Expo
- Supabase Auth
- Supabase Postgres
- Supabase Realtime where useful
- Expo push notifications

## Current Artifacts

- Design spec: [docs/specs/2026-05-17-accountability-tracker-design.md](docs/specs/2026-05-17-accountability-tracker-design.md)
- Implementation plan: [docs/superpowers/plans/2026-05-18-accountability-tracker-complete-mvp.md](docs/superpowers/plans/2026-05-18-accountability-tracker-complete-mvp.md)
- Release checklist: [docs/runbooks/release-checklist.md](docs/runbooks/release-checklist.md)

## Development

1. Copy `.env.example` to `.env`.
2. Fill in Supabase and Expo values.
3. Run `npm install`.
4. Run `npm start`.
5. Run `npm test`.

## Current Status

The MVP foundation is implemented through auth, private challenges, personal goals, check-ins, group feed/comments, missed-check-in automation, push notification foundation, and Today navigation.
