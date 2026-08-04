type Env = {
  RELAY_API_KEY?: string;
  IG_ACCESS_TOKEN?: string;
  IG_USER_ID?: string;
};

type PublishPayload = {
  creation_id?: string;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const relayKey = String(context.env.RELAY_API_KEY || '');
  const providedKey = context.request.headers.get('x-api-key') || '';
  if (!relayKey || providedKey !== relayKey) {
    return json({ error: 'unauthorized' }, 401);
  }

  let body: PublishPayload;
  try {
    body = (await context.request.json()) as PublishPayload;
  } catch {
    return json({ error: 'invalid JSON body' }, 400);
  }

  const creationId = String(body.creation_id || '').trim();
  if (!creationId) {
    return json({ error: 'creation_id is required' }, 400);
  }

  const accessToken = String(context.env.IG_ACCESS_TOKEN || '').trim();
  const igUserId = String(context.env.IG_USER_ID || '').trim();

  if (!accessToken || !igUserId) {
    return json({ error: 'server is missing IG_ACCESS_TOKEN or IG_USER_ID' }, 500);
  }

  const params = new URLSearchParams({
    creation_id: creationId,
    access_token: accessToken,
  });

  const res = await fetch(`https://graph.facebook.com/v26.0/${igUserId}/media_publish`, {
    method: 'POST',
    body: params,
  });
  const data = (await res.json()) as { id?: string; error?: unknown };

  if (!res.ok || !data.id) {
    return json({ step: 'publish', creation_id: creationId, error: data }, 502);
  }

  return json({ success: true, media_id: data.id });
};
