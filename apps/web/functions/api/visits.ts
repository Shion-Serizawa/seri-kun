/// <reference types="@cloudflare/workers-types" />

import type { VisitsResponse } from '../../src/lib/shared/total-visits';
import {
  createInMemoryKeyValueStore,
  createVisitsStore,
  type KeyValueStore,
  type VisitsStore,
} from './visits-store';

const VISITS_IP_TTL_SECONDS = 60;

type ErrorResponse = { error: 'server_error' | 'rate_limited' | 'forbidden' };

interface Env {
  VISITS_KV?: KeyValueStore;
  IS_DEV?: string;
  ENV?: string;
  NODE_ENV?: string;
  VISITS_LOCAL_STORE?: string;
}

const localDevelopmentStore = createVisitsStore(createInMemoryKeyValueStore());

function createJsonResponse(status: number, body: VisitsResponse | ErrorResponse): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
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
  return cfConnectingIp || null;
}

function isLocalHostname(request: Request): boolean {
  const hostname = new URL(request.url).hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function resolveVisitsStore(context: FunctionContext): VisitsStore | null {
  if (context.env.VISITS_KV) {
    return createVisitsStore(context.env.VISITS_KV);
  }

  if (context.env.VISITS_LOCAL_STORE === 'memory') {
    return localDevelopmentStore;
  }

  if (isLocalHostname(context.request)) {
    return localDevelopmentStore;
  }

  return null;
}

function parseOrigin(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isSameOriginRequest(request: Request): boolean {
  const requestOrigin = new URL(request.url).origin;

  const origin = parseOrigin(request.headers.get('origin'));
  if (origin !== null) {
    return origin === requestOrigin;
  }

  const referer = parseOrigin(request.headers.get('referer'));
  if (referer !== null) {
    return referer === requestOrigin;
  }

  return false;
}

export const onRequestGet: PagesFunction<Env> = async (context): Promise<Response> => {
  const store = resolveVisitsStore(context);
  if (store === null) {
    return createJsonResponse(500, { error: 'server_error' });
  }

  try {
    const total = await store.readTotal();
    return createJsonResponse(200, { total });
  } catch (error: unknown) {
    logServerError(context, 'Failed to read total visits', error);
    return createJsonResponse(500, { error: 'server_error' });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context): Promise<Response> => {
  const store = resolveVisitsStore(context);
  if (store === null) {
    return createJsonResponse(500, { error: 'server_error' });
  }

  if (!isSameOriginRequest(context.request)) {
    return createJsonResponse(403, { error: 'forbidden' });
  }

  try {
    const clientIp = getClientIp(context.request);
    if (!clientIp) {
      return createJsonResponse(429, { error: 'rate_limited' });
    }

    const limited = await store.isRateLimited(clientIp, VISITS_IP_TTL_SECONDS);
    if (limited) {
      return createJsonResponse(429, { error: 'rate_limited' });
    }

    const total = await store.incrementTotal();
    return createJsonResponse(200, { total });
  } catch (error: unknown) {
    logServerError(context, 'Failed to increment total visits', error);
    return createJsonResponse(500, { error: 'server_error' });
  }
};
