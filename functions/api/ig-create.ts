type Env = {
  RELAY_API_KEY?: string;
  IG_ACCESS_TOKEN?: string;
  IG_USER_ID?: string;
};

type CreatePayload = {
  image_url?: string;
  image_urls?: string[];
  caption?: string;
};

const GRAPH = 'https://graph.facebook.com/v26.0';

/** POST to /{ig-user-id}/media and return the container id, or an error payload. */
async function createContainer(
  igUserId: string,
  params: URLSearchParams,
): Promise<{ id?: string; error?: unknown }> {
  const res = await fetch(`${GRAPH}/${igUserId}/media`, { method: 'POST', body: params });
  const data = (await res.json()) as { id?: string; error?: unknown };
  if (!res.ok || !data.id) return { error: data };
  return { id: data.id };
}

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

  const caption = String(body.caption || '');

  // A single image_url still posts one photo; image_urls builds a carousel.
  const imageUrls = (Array.isArray(body.image_urls) ? body.image_urls : [])
    .map((u) => String(u || '').trim())
    .filter(Boolean);
  const singleUrl = String(body.image_url || '').trim();

  if (!imageUrls.length && !singleUrl) {
    return json({ error: 'image_url or image_urls is required' }, 400);
  }
  if (imageUrls.length === 1) {
    return json({ error: 'image_urls needs 2-10 items; use image_url for a single photo' }, 400);
  }
  if (imageUrls.length > 10) {
    return json({ error: 'a carousel accepts at most 10 items' }, 400);
  }

  const accessToken = String(context.env.IG_ACCESS_TOKEN || '').trim();
  const igUserId = String(context.env.IG_USER_ID || '').trim();

  if (!accessToken || !igUserId) {
    return json({ error: 'server is missing IG_ACCESS_TOKEN or IG_USER_ID' }, 500);
  }

  if (!imageUrls.length) {
    const params = new URLSearchParams({ image_url: singleUrl, access_token: accessToken });
    if (caption) params.set('caption', caption);

    const created = await createContainer(igUserId, params);
    if (!created.id) {
      return json({ step: 'create_container', error: created.error }, 502);
    }
    return json({ creation_id: created.id });
  }

  // Carousel: an item container per image, then a parent container holding them.
  const childIds: string[] = [];
  for (const url of imageUrls) {
    const params = new URLSearchParams({
      image_url: url,
      is_carousel_item: 'true',
      access_token: accessToken,
    });
    const created = await createContainer(igUserId, params);
    if (!created.id) {
      return json({ step: 'create_carousel_item', image_url: url, error: created.error }, 502);
    }
    childIds.push(created.id);
  }

  const parentParams = new URLSearchParams({
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    access_token: accessToken,
  });
  if (caption) parentParams.set('caption', caption);

  const parent = await createContainer(igUserId, parentParams);
  if (!parent.id) {
    return json({ step: 'create_carousel_container', children: childIds, error: parent.error }, 502);
  }

  return json({ creation_id: parent.id, children: childIds });
};
