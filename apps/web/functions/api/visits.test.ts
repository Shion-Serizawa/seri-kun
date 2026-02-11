import { describe, expect, it, vi } from 'vitest';

import { onRequestGet, onRequestPost } from './visits';

type HandlerContext = Parameters<typeof onRequestGet>[0];

class MockKvNamespace implements KVNamespace {
  private readonly store = new Map<string, string>();
  private failGet = false;
  private failPut = false;

  set(key: string, value: string): void {
    this.store.set(key, value);
  }

  setFailGet(enabled: boolean): void {
    this.failGet = enabled;
  }

  setFailPut(enabled: boolean): void {
    this.failPut = enabled;
  }

  async get(key: string): Promise<string | null> {
    if (this.failGet) {
      throw new Error('get failed');
    }
    return this.store.get(key) ?? null;
  }

  async put(key: string, value: string): Promise<void> {
    if (this.failPut) {
      throw new Error('put failed');
    }
    this.store.set(key, value);
  }

  async getWithMetadata(
    key: string,
  ): Promise<KVNamespaceGetWithMetadataResult<unknown, string> | null> {
    const value = this.store.get(key) ?? null;
    if (value === null) {
      return null;
    }
    return { value, metadata: null };
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async list(): Promise<KVNamespaceListResult<unknown, string>> {
    return { keys: [], list_complete: true, cursor: '' };
  }
}

function createContext(options?: {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  kv?: KVNamespace;
  env?: Record<string, string | undefined>;
}): HandlerContext {
  const request = new Request('https://example.com/api/visits', {
    method: options?.method ?? 'GET',
    headers: options?.headers,
  });

  return {
    request,
    env: { VISITS_KV: options?.kv, ...options?.env },
    params: {},
    data: {},
    waitUntil: vi.fn(),
    next: vi.fn(),
  } as unknown as HandlerContext;
}

describe('/api/visits function', () => {
  it('GET returns total from KV', async () => {
    const kv = new MockKvNamespace();
    kv.set('site:total_visits', '12');

    const response = await onRequestGet(createContext({ method: 'GET', kv }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ total: 12 });
  });

  it('GET returns 500 when KV binding is missing', async () => {
    const response = await onRequestGet(createContext({ method: 'GET' }));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'server_error' });
  });

  it('POST increments total and returns new value', async () => {
    const kv = new MockKvNamespace();
    kv.set('site:total_visits', '3');

    const response = await onRequestPost(
      createContext({
        method: 'POST',
        kv,
        headers: { 'cf-connecting-ip': '203.0.113.11', origin: 'https://example.com' },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ total: 4 });
    await expect(kv.get('site:total_visits')).resolves.toBe('4');
  });

  it('POST returns 429 when rate limit key already exists for IP', async () => {
    const kv = new MockKvNamespace();
    kv.set('visits:ip:203.0.113.12', '1');

    const response = await onRequestPost(
      createContext({
        method: 'POST',
        kv,
        headers: { 'cf-connecting-ip': '203.0.113.12', origin: 'https://example.com' },
      }),
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ error: 'rate_limited' });
  });

  it('POST returns 429 when client IP is missing', async () => {
    const kv = new MockKvNamespace();

    const response = await onRequestPost(
      createContext({ method: 'POST', kv, headers: { origin: 'https://example.com' } }),
    );
    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ error: 'rate_limited' });
  });

  it('POST returns 403 for cross-origin requests', async () => {
    const kv = new MockKvNamespace();

    const response = await onRequestPost(
      createContext({
        method: 'POST',
        kv,
        headers: { 'cf-connecting-ip': '203.0.113.14', origin: 'https://attacker.example' },
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'forbidden' });
  });

  it('POST returns 500 when KV access throws', async () => {
    const kv = new MockKvNamespace();
    kv.setFailGet(true);

    const response = await onRequestPost(
      createContext({
        method: 'POST',
        kv,
        headers: { 'cf-connecting-ip': '203.0.113.13', origin: 'https://example.com' },
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'server_error' });
  });
});
