function json(data, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
}

function text(body, { status = 200, headers = {} } = {}) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8', ...headers },
  });
}

function withCors(request, headers = {}) {
  const origin = request.headers.get('origin') || '*';
  return {
    ...headers,
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type, x-signature, x-event-name',
    'access-control-allow-credentials': 'true',
  };
}

function base64url(bytes) {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function utf8(str) {
  return new TextEncoder().encode(str);
}

async function hmacSha256(secret, msgBytes) {
  const key = await crypto.subtle.importKey('raw', utf8(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const sig = await crypto.subtle.sign('HMAC', key, msgBytes);
  return new Uint8Array(sig);
}

async function signSessionToken({ secret, payload }) {
  const header = { alg: 'HS256', typ: 'PVT' };
  const encHeader = base64url(utf8(JSON.stringify(header)));
  const encPayload = base64url(utf8(JSON.stringify(payload)));
  const toSign = utf8(`${encHeader}.${encPayload}`);
  const sig = await hmacSha256(secret, toSign);
  const encSig = base64url(sig);
  return `${encHeader}.${encPayload}.${encSig}`;
}

async function verifySessionToken({ secret, token }) {
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'bad_format' };
  const [h, p, s] = parts;
  const toSign = utf8(`${h}.${p}`);
  const sig = await hmacSha256(secret, toSign);
  if (base64url(sig) !== s) return { ok: false, reason: 'bad_sig' };
  const payload = JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/')));
  if (payload?.exp && Date.now() / 1000 > payload.exp) return { ok: false, reason: 'expired' };
  return { ok: true, payload };
}

function parseCookie(header) {
  const out = {};
  if (!header) return out;
  const parts = header.split(';');
  for (const p of parts) {
    const idx = p.indexOf('=');
    if (idx === -1) continue;
    const k = p.slice(0, idx).trim();
    const v = p.slice(idx + 1).trim();
    out[k] = v;
  }
  return out;
}

function cookie(name, value, { maxAge = 60 * 60 * 24 * 7, secure = true, sameSite = 'Lax', path = '/' } = {}) {
  const parts = [
    `${name}=${value}`,
    `Max-Age=${maxAge}`,
    `Path=${path}`,
    `SameSite=${sameSite}`,
    `HttpOnly`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

// NOTE: LemonSqueezy webhook signature specifics vary by integration version.
// This Worker supports an optional HMAC verification if you provide a secret and a signature header.
// Wire exact header+payload signing rules once checkout is connected.
async function verifyWebhookIfPossible({ env, request, rawBody }) {
  const secret = env.LEMON_WEBHOOK_SECRET;
  if (!secret) return { ok: true, skipped: true };

  const sigHeader = request.headers.get('x-signature');
  if (!sigHeader) return { ok: false, reason: 'missing_x_signature' };

  // Generic HMAC(rawBody) hex comparison. Replace with Lemon's official scheme once wired.
  const sig = await hmacSha256(secret, rawBody);
  const hex = Array.from(sig)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  if (hex !== sigHeader) return { ok: false, reason: 'bad_signature' };
  return { ok: true, skipped: false };
}

async function handleHealth(request) {
  return json(
    { ok: true, service: 'postvoid-entitlements', time: new Date().toISOString() },
    { headers: withCors(request) },
  );
}

async function handleSession(request, env) {
  const cookies = parseCookie(request.headers.get('cookie'));
  const token = cookies.pv_session;
  if (!token) return json({ ok: true, entitlements: [], tier: null }, { headers: withCors(request) });

  const secret = env.SESSION_TOKEN_SECRET;
  if (!secret) return json({ ok: false, error: 'missing_session_secret' }, { status: 500, headers: withCors(request) });

  const v = await verifySessionToken({ secret, token });
  if (!v.ok) return json({ ok: true, entitlements: [], tier: null }, { headers: withCors(request) });

  return json(
    { ok: true, entitlements: v.payload.entitlements || [], tier: v.payload.tier || null },
    { headers: withCors(request) },
  );
}

// Dev-only: grant a tier locally (for shipping while checkout URLs are placeholders).
async function handleDevGrant(request, env) {
  if ((env.ENV || 'prod') !== 'dev') return text('Not found', { status: 404, headers: withCors(request) });

  const body = await request.json().catch(() => ({}));
  const tier = body.tier ?? 0;

  const secret = env.SESSION_TOKEN_SECRET;
  if (!secret) return json({ ok: false, error: 'missing_session_secret' }, { status: 500, headers: withCors(request) });

  const payload = {
    tier,
    entitlements: [`tier:${tier}`],
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  };
  const token = await signSessionToken({ secret, payload });

  return json(
    { ok: true, tier, entitlements: payload.entitlements },
    {
      headers: {
        ...withCors(request),
        'set-cookie': cookie('pv_session', token, { secure: true }),
      },
    },
  );
}

async function handleWebhookLemon(request, env) {
  const raw = new Uint8Array(await request.arrayBuffer());
  const verify = await verifyWebhookIfPossible({ env, request, rawBody: raw });
  if (!verify.ok) return json({ ok: false, error: verify.reason }, { status: 401, headers: withCors(request) });

  const eventName = request.headers.get('x-event-name') || 'unknown';
  const body = JSON.parse(new TextDecoder().decode(raw));

  // Minimal persistence: store last N events (for debugging) and the latest tier by an external key.
  // Wire proper user identifiers once checkout URLs + redirect/claim flow is connected.
  if (env.ENTITLEMENTS_KV) {
    const id = body?.data?.id || crypto.randomUUID();
    await env.ENTITLEMENTS_KV.put(`lemon:event:${id}`, JSON.stringify({ eventName, body }), { expirationTtl: 60 * 60 * 24 * 3 });
  }

  return json({ ok: true }, { headers: withCors(request) });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: withCors(request) });

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/health') return await handleHealth(request);
    if (path === '/api/session' && request.method === 'GET') return await handleSession(request, env);

    if (path === '/api/webhooks/lemon' && request.method === 'POST') return await handleWebhookLemon(request, env);
    if (path === '/api/dev/grant' && request.method === 'POST') return await handleDevGrant(request, env);

    return text('Not found', { status: 404, headers: withCors(request) });
  },
};

