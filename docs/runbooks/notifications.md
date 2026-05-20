# Notifications

MVP notification types:

- Goal reminder one hour before deadline.
- Missed check-in notification to challenge members.
- Comment notification to feed item owner.

Failure handling:

- Expired Expo tokens should be removed when Expo returns a device-not-registered response.
- Push send failures must be logged with notification type, target user, and Expo response.
- Notification failures should not block check-in or feed writes.

Client setup:

- `registerPushToken(userId)` requests permission on a real device only.
- Registered Expo tokens are stored in `device_tokens` with `(user_id, expo_push_token)` upsert behavior.
- `EXPO_PUBLIC_EAS_PROJECT_ID` must be set for development builds.

Function secrets:

- `PUSH_SEND_SECRET` protects `send-push`.
- `REMINDER_JOB_SECRET` protects `send-reminders`.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are required by `send-reminders`.

Function invocation must include the matching bearer token:

```text
Authorization: Bearer <SECRET>
```
