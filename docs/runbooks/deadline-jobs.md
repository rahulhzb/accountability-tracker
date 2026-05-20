# Deadline Jobs

`generate-missed-checkins` runs on a schedule and creates missed check-ins for active goals whose local deadline has passed and whose local date has no check-in.

The job must be retry-safe. The database unique constraint on `(goal_id, local_date)` prevents duplicate missed rows.

Operational checks:

- If the job runs late, it should still generate misses for goals whose deadline passed.
- If the job runs twice, duplicate check-ins should not be created.
- If a user submits while the job runs, the unique constraint chooses one record and the loser must log the conflict.

Local run:

```bash
npx supabase functions serve generate-missed-checkins
```

Required environment:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEADLINE_JOB_SECRET`

Invocation must include:

```text
Authorization: Bearer <DEADLINE_JOB_SECRET>
```
