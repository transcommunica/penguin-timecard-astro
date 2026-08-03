type Env = {
  RELAY_API_KEY?: string;
  IG_ACCESS_TOKEN?: string;
  IG_USER_ID?: string;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequestGet = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const relayKey = String(context.env.RELAY_API_KEY || '');
  const providedKey = context.request.headers.get('x-api-key') || '';
  if (!relayKey || providedKey !== relayKey) {
    return json({ error: 'unauthorized' }, 401);
  }

  const url = new URL(context.request.url);
  const mediaId = url.searchParams.get('media_id');
  const accessToken = String(context.env.IG_ACCESS_TOKEN || '').trim();
  const igUserId = String(context.env.IG_USER_ID || '').trim();

  if (!accessToken || !igUserId) {
    return json({ error: 'server is missing IG_ACCESS_TOKEN or IG_USER_ID' }, 500);
  }

  if (mediaId) {
    const params = new URLSearchParams({
      fields: 'id,permalink,timestamp,media_type,media_url,username,is_comment_enabled',
      access_token: accessToken,
    });
    const res = await fetch(`https://graph.facebook.com/v26.0/${mediaId}?${params.toString()}`);
    const data = await res.json();
    return json({ status: res.status, data });
  }

  const params = new URLSearchParams({
    fields: 'id,username,media_count,media{id,permalink,timestamp,media_type,caption}',
    access_token: accessToken,
  });
  const res = await fetch(`https://graph.facebook.com/v26.0/${igUserId}?${params.toString()}`);
  const data = await res.json();
  return json({ status: res.status, data });
};
