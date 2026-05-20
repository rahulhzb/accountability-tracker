import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const reminderJobSecret = Deno.env.get('REMINDER_JOB_SECRET');

if (!supabaseUrl || !serviceRoleKey || !reminderJobSecret) {
  throw new Error('Missing reminder service environment');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (request) => {
  const authorization = request.headers.get('authorization') ?? '';

  if (authorization !== `Bearer ${reminderJobSecret}`) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { data: tokens, error } = await supabase
    .from('device_tokens')
    .select('id, user_id, expo_push_token, platform, last_seen_at');

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({
    ok: true,
    tokens_seen: tokens?.length ?? 0,
  });
});
