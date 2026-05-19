import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '0001_initial_schema.sql');
const migrationSql = readFileSync(migrationPath, 'utf8');

function normalizedSql() {
  return migrationSql.replace(/\s+/g, ' ').toLowerCase();
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

  it('prevents check-ins for goals owned by another user', () => {
    expect(sql).toContain('create policy "checkins owner insert"');
    expect(sql).toContain('g.owner_user_id = auth.uid()');
  });

  it('keeps comments and device tokens scoped to the authenticated user boundary', () => {
    expect(sql).toContain('create policy "comments member insert"');
    expect(sql).toContain('user_id = auth.uid()');
    expect(sql).toContain('create policy "tokens own upsert"');
  });
});
