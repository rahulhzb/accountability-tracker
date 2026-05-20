import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('push notification edge functions', () => {
  it('protects send-push and forwards messages to Expo push API', () => {
    const source = readFileSync(
      join(__dirname, '..', 'supabase', 'functions', 'send-push', 'index.ts'),
      'utf8',
    );

    expect(source).toContain("Deno.env.get('PUSH_SEND_SECRET')");
    expect(source).toContain("authorization !== `Bearer ${pushSendSecret}`");
    expect(source).toContain("fetch('https://exp.host/--/api/v2/push/send'");
    expect(source).toContain('No push messages provided');
  });

  it('protects send-reminders and reads registered device tokens with service role', () => {
    const source = readFileSync(
      join(__dirname, '..', 'supabase', 'functions', 'send-reminders', 'index.ts'),
      'utf8',
    );

    expect(source).toContain("Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')");
    expect(source).toContain("Deno.env.get('REMINDER_JOB_SECRET')");
    expect(source).toContain("authorization !== `Bearer ${reminderJobSecret}`");
    expect(source).toContain(".from('device_tokens')");
    expect(source).toContain('tokens_seen');
  });
});
