create type public.goal_status as enum ('active', 'paused', 'archived');
create type public.check_in_status as enum ('done', 'skipped', 'missed');
create type public.member_role as enum ('owner', 'member');
create type public.missed_rule as enum ('visible_only', 'recovery_note', 'fun_penalty');
create type public.recovery_action_status as enum ('pending', 'completed');
create type public.feed_event_type as enum ('check_in_done', 'check_in_skipped', 'check_in_missed', 'comment_created', 'recovery_assigned', 'recovery_completed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  timezone text not null default 'UTC',
  notification_preferences jsonb not null default '{"reminders":true,"misses":true,"comments":true}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '' check (char_length(description) <= 500),
  created_by uuid not null references public.profiles(id) on delete cascade,
  invite_code text not null unique check (invite_code ~ '^[A-Z0-9]{8,16}$'),
  start_date date not null default current_date,
  end_date date null,
  privacy text not null default 'private' check (privacy = 'private'),
  missed_rule public.missed_rule not null default 'visible_only',
  created_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create table public.challenge_members (
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid null references public.challenges(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  cadence text not null default 'daily' check (cadence = 'daily'),
  deadline_time time not null,
  timezone text not null default 'UTC',
  status public.goal_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  local_date date not null,
  status public.check_in_status not null,
  note text null check (note is null or char_length(note) <= 500),
  submitted_at timestamptz null,
  auto_marked_missed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (goal_id, local_date)
);

create table public.feed_events (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  actor_user_id uuid not null references public.profiles(id) on delete cascade,
  check_in_id uuid null references public.check_ins(id) on delete cascade,
  event_type public.feed_event_type not null,
  created_at timestamptz not null default now()
);

create table public.recovery_actions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  check_in_id uuid not null references public.check_ins(id) on delete cascade,
  assigned_user_id uuid not null references public.profiles(id) on delete cascade,
  template text not null check (char_length(template) between 1 and 160),
  status public.recovery_action_status not null default 'pending',
  note text null check (note is null or char_length(note) <= 500),
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  unique (check_in_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  feed_event_id uuid not null references public.feed_events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create table public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expo_push_token text not null,
  platform text not null check (platform in ('ios', 'android', 'web', 'unknown')),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

create index goals_owner_status_idx on public.goals(owner_user_id, status);
create index challenge_members_user_idx on public.challenge_members(user_id);
create index goals_challenge_idx on public.goals(challenge_id) where challenge_id is not null;
create index check_ins_user_date_idx on public.check_ins(user_id, local_date desc);
create index feed_events_challenge_created_idx on public.feed_events(challenge_id, created_at desc);
create unique index feed_events_checkin_type_unique_idx on public.feed_events(check_in_id, event_type);
create index recovery_actions_challenge_status_idx on public.recovery_actions(challenge_id, status);
create index recovery_actions_assigned_status_idx on public.recovery_actions(assigned_user_id, status);
create index comments_feed_created_idx on public.comments(feed_event_id, created_at asc);
create index device_tokens_user_idx on public.device_tokens(user_id);

alter table public.profiles enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_members enable row level security;
alter table public.goals enable row level security;
alter table public.check_ins enable row level security;
alter table public.feed_events enable row level security;
alter table public.recovery_actions enable row level security;
alter table public.comments enable row level security;
alter table public.device_tokens enable row level security;

create or replace function public.is_challenge_member(target_challenge_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.challenge_members
    where challenge_id = target_challenge_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.create_private_challenge(
  target_name text,
  target_description text,
  target_invite_code text
)
returns public.challenges
language plpgsql
security definer
set search_path = public
as $$
declare
  target_challenge public.challenges;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.profiles (id, display_name)
  values (
    auth.uid(),
    coalesce(nullif(split_part(auth.jwt() ->> 'email', '@', 1), ''), 'Friend')
  )
  on conflict (id) do nothing;

  insert into public.challenges (name, description, created_by, invite_code)
  values (
    trim(target_name),
    trim(target_description),
    auth.uid(),
    upper(trim(target_invite_code))
  )
  returning *
  into target_challenge;

  insert into public.challenge_members (challenge_id, user_id, role)
  values (target_challenge.id, auth.uid(), 'owner');

  return target_challenge;
end;
$$;

create or replace function public.join_challenge_by_invite_code(target_invite_code text)
returns public.challenges
language plpgsql
security definer
set search_path = public
as $$
declare
  target_challenge public.challenges;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.profiles (id, display_name)
  values (
    auth.uid(),
    coalesce(nullif(split_part(auth.jwt() ->> 'email', '@', 1), ''), 'Friend')
  )
  on conflict (id) do nothing;

  select *
  into target_challenge
  from public.challenges
  where invite_code = upper(trim(target_invite_code));

  if target_challenge.id is null then
    raise exception 'Challenge invite not found';
  end if;

  insert into public.challenge_members (challenge_id, user_id, role)
  values (target_challenge.id, auth.uid(), 'member')
  on conflict (challenge_id, user_id) do nothing;

  return target_challenge;
end;
$$;

create or replace function public.create_goal(
  target_challenge_id uuid,
  target_title text,
  target_deadline_time time,
  target_timezone text
)
returns public.goals
language plpgsql
security definer
set search_path = public
as $$
declare
  target_goal public.goals;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if target_challenge_id is not null and not public.is_challenge_member(target_challenge_id) then
    raise exception 'Challenge membership required';
  end if;

  insert into public.profiles (id, display_name)
  values (
    auth.uid(),
    coalesce(nullif(split_part(auth.jwt() ->> 'email', '@', 1), ''), 'Friend')
  )
  on conflict (id) do nothing;

  insert into public.goals (owner_user_id, challenge_id, title, deadline_time, timezone)
  values (
    auth.uid(),
    target_challenge_id,
    trim(target_title),
    target_deadline_time,
    target_timezone
  )
  returning *
  into target_goal;

  return target_goal;
end;
$$;

create policy "profiles own read" on public.profiles for select using (id = auth.uid());
create policy "profiles own insert" on public.profiles for insert with check (id = auth.uid());
create policy "profiles own update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "challenges member or creator read" on public.challenges for select using (
  created_by = auth.uid() or public.is_challenge_member(id)
);
create policy "challenges owner insert" on public.challenges for insert with check (created_by = auth.uid());
create policy "challenges owner update" on public.challenges for update using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy "members member read" on public.challenge_members for select using (public.is_challenge_member(challenge_id));
create policy "members creator bootstrap insert" on public.challenge_members for insert with check (
  user_id = auth.uid()
  and role = 'owner'
  and exists (
    select 1
    from public.challenges c
    where c.id = challenge_members.challenge_id
      and c.created_by = auth.uid()
  )
);

create policy "goals owner or challenge member read" on public.goals for select using (
  owner_user_id = auth.uid() or (challenge_id is not null and public.is_challenge_member(challenge_id))
);
create policy "goals owner insert" on public.goals for insert with check (
  owner_user_id = auth.uid()
  and (challenge_id is null or public.is_challenge_member(challenge_id))
);
create policy "goals owner update" on public.goals for update using (owner_user_id = auth.uid()) with check (
  owner_user_id = auth.uid()
  and (challenge_id is null or public.is_challenge_member(challenge_id))
);

create policy "checkins owner or challenge member read" on public.check_ins for select using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.goals g
    where g.id = check_ins.goal_id
      and g.challenge_id is not null
      and public.is_challenge_member(g.challenge_id)
  )
);
create policy "checkins owner insert" on public.check_ins for insert with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.goals g
    where g.id = check_ins.goal_id
      and g.owner_user_id = auth.uid()
  )
);
create policy "checkins owner update" on public.check_ins for update using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.goals g
    where g.id = check_ins.goal_id
      and g.owner_user_id = auth.uid()
  )
) with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.goals g
    where g.id = check_ins.goal_id
      and g.owner_user_id = auth.uid()
  )
);

create policy "feed member read" on public.feed_events for select using (public.is_challenge_member(challenge_id));
create policy "feed member insert consistent checkin event" on public.feed_events for insert with check (
  actor_user_id = auth.uid()
  and public.is_challenge_member(challenge_id)
  and check_in_id is not null
  and exists (
    select 1
    from public.check_ins ci
    join public.goals g on g.id = ci.goal_id
    where ci.id = feed_events.check_in_id
      and ci.user_id = auth.uid()
      and g.challenge_id = feed_events.challenge_id
      and (
        (ci.status = 'done' and feed_events.event_type = 'check_in_done')
        or (ci.status = 'skipped' and feed_events.event_type = 'check_in_skipped')
        or (ci.status = 'missed' and feed_events.event_type = 'check_in_missed')
      )
  )
);
create policy "recovery member read" on public.recovery_actions for select using (
  public.is_challenge_member(challenge_id)
);
create policy "recovery assigned user complete" on public.recovery_actions for update using (
  assigned_user_id = auth.uid()
  and public.is_challenge_member(challenge_id)
) with check (
  assigned_user_id = auth.uid()
  and public.is_challenge_member(challenge_id)
  and status = 'completed'
);
create policy "recovery service role insert" on public.recovery_actions for insert with check (
  auth.role() = 'service_role'
);
create policy "comments member read" on public.comments for select using (
  exists (
    select 1
    from public.feed_events fe
    where fe.id = comments.feed_event_id
      and public.is_challenge_member(fe.challenge_id)
  )
);
create policy "comments member insert" on public.comments for insert with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.feed_events fe
    where fe.id = comments.feed_event_id
      and public.is_challenge_member(fe.challenge_id)
  )
);

create policy "tokens own upsert" on public.device_tokens for all using (user_id = auth.uid()) with check (user_id = auth.uid());
