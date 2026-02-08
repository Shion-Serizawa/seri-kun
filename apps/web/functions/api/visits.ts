/// <reference types="@cloudflare/workers-types" />

import type { VisitsResponse } from '../../src/lib/shared/total-visits';

const VISITS_KEY = 'site:total_visits';
const VISITS_IP_KEY_PREFIX = 'visits:ip:';
const VISITS_IP_TTL_SECONDS = 60;

type ErrorResponse = { error: 'server_error' | 'rate_limited' };

interface Env {
  VISITS_KV?: KVNamespace;
  IS_DEV?: string;
  ENV?: string;
  NODE_ENV?: string;
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

async function readTotal(kv: KVNamespace): Promise<number> {
  const current = await kv.get(VISITS_KEY);
  return parseStoredVisits(current);
}

async function incrementAndReadTotal(kv: KVNamespace): Promise<number> {
  // KV has no atomic increment; this read-modify-write is acceptable for low traffic.
  const current = await readTotal(kv);
  const next = current + 1;
  await kv.put(VISITS_KEY, String(next));
  return next;
}

function requireKvBinding(env: Env): KVNamespace | null {
  return env.VISITS_KV ?? null;
}

type FunctionContext = Parameters<PagesFunction<Env>>[0];

function isDevelopment(env: Env): boolean {
  if (env.IS_DEV === '1' || env.IS_DEV === 'true') return true;
  if (env.ENV === 'development') return true;
  if (env.NODE_ENV === 'development') return true;
  return false;
}

function logServerError(context: FunctionContext, message: string, error: unknown): void {
  if (isDevelopment(context.env)) {
    context.waitUntil(Promise.resolve().then(() => console.error(message, error)));
    return;
  }

  console.error(message);
}

function getClientIp(request: Request): string | null {
  const cfConnectingIp = request.headers.get('cf-connecting-ip')?.trim();
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (!xForwardedFor) {
    return null;
  }

  const firstIp = xForwardedFor.split(',')[0]?.trim();
  return firstIp || null;
}

function toRateLimitKey(ip: string): string {
  return `${VISITS_IP_KEY_PREFIX}${encodeURIComponent(ip)}`;
}

async function isRateLimited(kv: KVNamespace, ip: string): Promise<boolean> {
  const key = toRateLimitKey(ip);
  const existing = await kv.get(key);
  if (existing !== null) {
    return true;
  }

  await kv.put(key, '1', { expirationTtl: VISITS_IP_TTL_SECONDS });
  return false;
}

export const onRequestGet: PagesFunction<Env> = async (context): Promise<Response> => {
  const kv = requireKvBinding(context.env);
  if (kv === null) {
    return createJsonResponse(500, { error: 'server_error' });
  }

  try {
    const total = await readTotal(kv);
    return createJsonResponse(200, { total });
  } catch (error: unknown) {
    logServerError(context, 'Failed to read total visits', error);
    return createJsonResponse(500, { error: 'server_error' });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context): Promise<Response> => {
  const kv = requireKvBinding(context.env);
  if (kv === null) {
    return createJsonResponse(500, { error: 'server_error' });
  }

  try {
    const clientIp = getClientIp(context.request);
    if (clientIp) {
      const limited = await isRateLimited(kv, clientIp);
      if (limited) {
        return createJsonResponse(429, { error: 'rate_limited' });
      }
    }

    const total = await incrementAndReadTotal(kv);
    return createJsonResponse(200, { total });
  } catch (error: unknown) {
    logServerError(context, 'Failed to increment total visits', error);
    return createJsonResponse(500, { error: 'server_error' });
  }
};
