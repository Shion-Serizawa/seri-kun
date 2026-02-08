const VISITS_KEY = 'site:total_visits';

type VisitsResponse = { total: number };
type ErrorResponse = { error: 'server_error' };

interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

interface Env {
  VISITS_KV?: KVNamespaceLike;
}

interface FunctionContext {
  env: Env;
}

function createJsonResponse(status: number, body: VisitsResponse | ErrorResponse): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function parseStoredVisits(raw: string | null): number {
  if (raw === null) {
    return 0;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

async function readTotal(kv: KVNamespaceLike): Promise<number> {
  const current = await kv.get(VISITS_KEY);
  return parseStoredVisits(current);
}

async function incrementAndReadTotal(kv: KVNamespaceLike): Promise<number> {
  // KV has no atomic increment; this read-modify-write is acceptable for low traffic.
  const current = await readTotal(kv);
  const next = current + 1;
  await kv.put(VISITS_KEY, String(next));
  return next;
}

function requireKvBinding(context: FunctionContext): KVNamespaceLike | null {
  return context.env.VISITS_KV ?? null;
}

export async function onRequestGet(context: FunctionContext): Promise<Response> {
  const kv = requireKvBinding(context);
  if (kv === null) {
    return createJsonResponse(500, { error: 'server_error' });
  }

  const total = await readTotal(kv);
  return createJsonResponse(200, { total });
}

export async function onRequestPost(context: FunctionContext): Promise<Response> {
  const kv = requireKvBinding(context);
  if (kv === null) {
    return createJsonResponse(500, { error: 'server_error' });
  }

  const total = await incrementAndReadTotal(kv);
  return createJsonResponse(200, { total });
}
