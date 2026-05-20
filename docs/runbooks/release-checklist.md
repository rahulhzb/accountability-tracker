# Release Checklist

## Functional

- Sign up with email.
- Create profile.
- Create challenge.
- Join challenge by invite code.
- Create challenge goal.
- Create personal goal.
- Submit done check-in.
- Submit skipped check-in.
- Missed-check-in job creates missed status.
- Group feed shows completed, skipped, and missed entries.
- Comment on feed item.
- Push token registers on a real device.
- Reminder notification sends.
- Missed-check-in notification sends.

## Security

- Non-member cannot read private challenge.
- User cannot read another user's personal tracker.
- Non-member cannot comment on challenge feed.
- Service-role Edge Functions require bearer secrets.
- Device tokens remain scoped to the authenticated user.

## Operational

- Deadline job can be run manually.
- Push failures are logged.
- Environment variables documented.
- Supabase migrations have been applied to the target project.
- Real-device QA covers onboarding, challenge creation, check-in, feed, comments, and push.
