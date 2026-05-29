import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '0001_initial_schema.sql');
const migrationSql = readFileSync(migrationPath, 'utf8');

function normalizedSql() {
  return migrationSql.replace(/\s+/g, ' ').toLowerCase();
}

function policySql(policyName: string) {
  const sql = normalizedSql();
  const marker = `create policy "${policyName}"`;
  const start = sql.indexOf(marker);
  expect(start).toBeGreaterThanOrEqual(0);

  const nextPolicy = sql.indexOf(' create policy "', start + marker.length);
  return nextPolicy === -1 ? sql.slice(start) : sql.slice(start, nextPolicy);
}

describe('row level security migration', () => {
  const sql = normalizedSql();

  it('enables RLS on every app-owned table', () => {
    const tables = [
      'profiles',
      'challenges',
      'challenge_members',
      'goals',
      'check_ins',
      'feed_events',
      'comments',
      'device_tokens',
      'recovery_actions',
    ];

    for (const table of tables) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it('prevents a non-member from reading a private challenge', () => {
    expect(sql).toContain('create policy "challenges member or creator read"');
    expect(sql).toContain('public.is_challenge_member(id)');
  });

  it('prevents a user from reading another user personal goals', () => {
    expect(sql).toContain('create policy "goals owner or challenge member read"');
    expect(sql).toContain('owner_user_id = auth.uid()');
    expect(sql).toContain('challenge_id is not null and public.is_challenge_member(challenge_id)');
  });

  it('allows a challenge member to read group feed events', () => {
    expect(sql).toContain('create policy "feed member read"');
    expect(sql).toContain('public.is_challenge_member(challenge_id)');
  });

  it('prevents direct challenge membership inserts by guessed challenge id', () => {
    expect(sql).not.toContain('create policy "members self join"');
    expect(sql).toContain('create policy "members creator bootstrap insert"');
    expect(sql).toContain('role = \'owner\'');
    expect(sql).toContain('create or replace function public.join_challenge_by_invite_code');
  });

  it('creates private challenges and owner membership in one database function', () => {
    expect(sql).toContain('create or replace function public.create_private_challenge');
    expect(sql).toContain('insert into public.profiles');
    expect(sql).toContain('insert into public.challenges');
    expect(sql).toContain('insert into public.challenge_members');
    expect(sql).toContain("values (target_challenge.id, auth.uid(), 'owner')");
  });

  it('bootstraps a missing profile before invite joins', () => {
    expect(sql).toContain('create or replace function public.join_challenge_by_invite_code');
    expect(sql).toContain('insert into public.profiles');
    expect(sql).toContain('on conflict (id) do nothing');
  });

  it('creates goals through a profile-bootstrapping database function', () => {
    expect(sql).toContain('create or replace function public.create_goal');
    expect(sql).toContain('insert into public.profiles');
    expect(sql).toContain('insert into public.goals');
    expect(sql).toContain('owner_user_id, challenge_id, title, deadline_time, timezone');
    expect(sql).toContain('auth.uid()');
  });

  it('requires normalized invite codes with enough entropy for MVP invites', () => {
    expect(sql).toContain("invite_code text not null unique check (invite_code ~ '^[a-z0-9]{8,16}$')");
    expect(sql).toContain('where invite_code = upper(trim(target_invite_code))');
  });

  it('prevents check-ins for goals owned by another user', () => {
    const policy = policySql('checkins owner insert');
    expect(policy).toContain('user_id = auth.uid()');
    expect(policy).toContain('g.owner_user_id = auth.uid()');
  });

  it('allows owners to update today check-ins through upsert only for their own goals', () => {
    const policy = policySql('checkins owner update');
    expect(policy).toContain('user_id = auth.uid()');
    expect(policy).toContain('g.owner_user_id = auth.uid()');
  });

  it('allows feed event inserts only for consistent member-owned check-ins', () => {
    const policy = policySql('feed member insert consistent checkin event');
    expect(policy).toContain('actor_user_id = auth.uid()');
    expect(policy).toContain('public.is_challenge_member(challenge_id)');
    expect(policy).toContain('check_in_id is not null');
    expect(policy).toContain('ci.user_id = auth.uid()');
    expect(policy).toContain('g.challenge_id = feed_events.challenge_id');
    expect(policy).toContain("ci.status = 'done' and feed_events.event_type = 'check_in_done'");
  });

  it('prevents duplicate feed events for the same check-in event type', () => {
    expect(sql).toContain(
      'create unique index feed_events_checkin_type_unique_idx on public.feed_events(check_in_id, event_type)',
    );
  });

  it('keeps comments and device tokens scoped to the authenticated user boundary', () => {
    const commentsPolicy = policySql('comments member insert');
    const tokensPolicy = policySql('tokens own upsert');
    expect(commentsPolicy).toContain('user_id = auth.uid()');
    expect(commentsPolicy).toContain('public.is_challenge_member(fe.challenge_id)');
    expect(tokensPolicy).toContain('user_id = auth.uid()');
  });

  it('indexes challenge memberships by user for my-challenges queries', () => {
    expect(sql).toContain('create index challenge_members_user_idx on public.challenge_members(user_id)');
  });

  it('models missed-deadline recovery actions for challenge misses', () => {
    expect(sql).toContain("create type public.missed_rule as enum ('visible_only', 'recovery_note', 'fun_penalty')");
    expect(sql).toContain("create type public.recovery_action_status as enum ('pending', 'completed')");
    expect(sql).toContain('missed_rule public.missed_rule not null default \'visible_only\'');
    expect(sql).toContain("create table public.recovery_actions");
    expect(sql).toContain('challenge_id uuid not null references public.challenges(id) on delete cascade');
    expect(sql).toContain('check_in_id uuid not null references public.check_ins(id) on delete cascade');
    expect(sql).toContain('assigned_user_id uuid not null references public.profiles(id) on delete cascade');
    expect(sql).toContain('template text not null check (char_length(template) between 1 and 160)');
    expect(sql).toContain('status public.recovery_action_status not null default \'pending\'');
    expect(sql).toContain('note text null check (note is null or char_length(note) <= 500)');
    expect(sql).toContain('completed_at timestamptz null');
  });

  it('adds recovery lifecycle feed event types', () => {
    expect(sql).toContain(
      "create type public.feed_event_type as enum ('check_in_done', 'check_in_skipped', 'check_in_missed', 'comment_created', 'recovery_assigned', 'recovery_completed')",
    );
  });

  it('scopes recovery action reads and completion updates to safe boundaries', () => {
    const readPolicy = policySql('recovery member read');
    const updatePolicy = policySql('recovery assigned user complete');
    const insertPolicy = policySql('recovery service role insert');

    expect(readPolicy).toContain('public.is_challenge_member(challenge_id)');
    expect(updatePolicy).toContain('assigned_user_id = auth.uid()');
    expect(updatePolicy).toContain("status = 'completed'");
    expect(insertPolicy).toContain("auth.role() = 'service_role'");
  });
});
