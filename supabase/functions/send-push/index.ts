const pushSendSecret = Deno.env.get('PUSH_SEND_SECRET');

if (!pushSendSecret) {
  throw new Error('Missing push send environment');
}

Deno.serve(async (request) => {
  const authorization = request.headers.get('authorization') ?? '';

  if (authorization !== `Bearer ${pushSendSecret}`) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const messages = Array.isArray(payload.messages) ? payload.messages : [];

  if (messages.length === 0) {
    return Response.json({ ok: false, error: 'No push messages provided' }, { status: 400 });
  }

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    body: JSON.stringify(messages),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const body = await response.json();

  return Response.json({ body, ok: response.ok }, { status: response.ok ? 200 : 502 });
});
