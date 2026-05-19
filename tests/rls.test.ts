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

  it('requires normalized invite codes with enough entropy for MVP invites', () => {
    expect(sql).toContain("invite_code text not null unique check (invite_code ~ '^[a-z0-9]{8,16}$')");
    expect(sql).toContain('where invite_code = upper(trim(target_invite_code))');
  });

  it('prevents check-ins for goals owned by another user', () => {
    const policy = policySql('checkins owner insert');
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
});
