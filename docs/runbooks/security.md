# Security Model

All user data is protected by Supabase row-level security (RLS). The app uses the Supabase anon key on the phone, so the database must assume every request can be tampered with and must check ownership or membership for every row.

## Data Boundaries

- Profiles are private. A user can create, read, and update only their own `profiles` row.
- Personal goals are private. A personal goal has `goals.challenge_id = null` and is readable only by `goals.owner_user_id`.
- Challenge data is private to members. Challenges, challenge goals, feed events, and comments are readable only by users in `challenge_members`.
- Challenge settings are editable only by the challenge creator in the MVP.
- Device tokens are private. A device can register an Expo push token only for the authenticated user.

## Invite Flow

Users must not be able to join a challenge just because they guessed a `challenge_id`. Direct inserts into `challenge_members` are limited to the creator bootstrapping their own owner membership after challenge creation.

Invite joins should use `public.join_challenge_by_invite_code(invite_code)`. That function looks up the private challenge by invite code on the server side, adds the authenticated user as a member, and returns the joined challenge.

## Critical Direct-Object-Reference Checks

- A user cannot read another user's personal goals.
- A user cannot read a challenge unless they created it or are a member.
- A user cannot create a challenge goal unless they are a member of that challenge.
- A user cannot check in for another user's goal.
- A user cannot comment on a feed event unless they are a member of that event's challenge.
- A user cannot store a device token for another user.
- A user cannot directly insert themselves into an arbitrary challenge by ID.

## Mental Model

Every table asks one question before returning or changing a row: "Does `auth.uid()` own this row, or are they a member of the challenge that owns this row?" If the answer is no, Postgres behaves as if the row does not exist.
