type Env = {
  RELAY_API_KEY?: string;
  IG_ACCESS_TOKEN?: string;
  IG_USER_ID?: string;
};

type CreatePayload = {
  image_url?: string;
  caption?: string;
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

  let body: CreatePayload;
  try {
    body = (await context.request.json()) as CreatePayload;
  } catch {
    return json({ error: 'invalid JSON body' }, 400);
  }

  const imageUrl = String(body.image_url || '').trim();
  const caption = String(body.caption || '');

  if (!imageUrl) {
    return json({ error: 'image_url is required' }, 400);
  }

  const accessToken = String(context.env.IG_ACCESS_TOKEN || '').trim();
  const igUserId = String(context.env.IG_USER_ID || '').trim();

  if (!accessToken || !igUserId) {
    return json({ error: 'server is missing IG_ACCESS_TOKEN or IG_USER_ID' }, 500);
  }

  const params = new URLSearchParams({
    image_url: imageUrl,
    access_token: accessToken,
  });
  if (caption) params.set('caption', caption);

  const res = await fetch(`https://graph.facebook.com/v26.0/${igUserId}/media`, {
    method: 'POST',
    body: params,
  });
  const data = (await res.json()) as { id?: string; error?: unknown };

  if (!res.ok || !data.id) {
    return json({ step: 'create_container', error: data }, 502);
  }

  return json({ creation_id: data.id });
};
