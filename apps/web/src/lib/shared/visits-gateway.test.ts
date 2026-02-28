import { describe, expect, it, vi } from 'vitest';

import { createHttpVisitsGateway, loadTotalVisits, type VisitsGateway } from './visits-gateway';

describe('loadTotalVisits', () => {
  it('returns incremented value when increment succeeds', async () => {
    const gateway: VisitsGateway = {
      incrementAndReadTotal: vi.fn().mockResolvedValue(42),
      readTotal: vi.fn().mockResolvedValue(10),
    };

    await expect(loadTotalVisits(gateway)).resolves.toBe(42);
    expect(gateway.incrementAndReadTotal).toHaveBeenCalledTimes(1);
    expect(gateway.readTotal).not.toHaveBeenCalled();
  });

  it('falls back to read when increment fails', async () => {
    const gateway: VisitsGateway = {
      incrementAndReadTotal: vi.fn().mockResolvedValue(null),
      readTotal: vi.fn().mockResolvedValue(11),
    };

    await expect(loadTotalVisits(gateway)).resolves.toBe(11);
    expect(gateway.incrementAndReadTotal).toHaveBeenCalledTimes(1);
    expect(gateway.readTotal).toHaveBeenCalledTimes(1);
  });
});

describe('createHttpVisitsGateway', () => {
  it('parses valid responses from POST and GET', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ total: 3 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ total: 4 }), { status: 200 }));
    const gateway = createHttpVisitsGateway({ request });

    await expect(gateway.incrementAndReadTotal()).resolves.toBe(3);
    await expect(gateway.readTotal()).resolves.toBe(4);
    expect(request).toHaveBeenNthCalledWith(
      1,
      '/api/visits',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      '/api/visits',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('returns null when response is not ok or malformed', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(new Response('forbidden', { status: 403 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ total: 'invalid' }), { status: 200 }));
    const gateway = createHttpVisitsGateway({ request });

    await expect(gateway.incrementAndReadTotal()).resolves.toBeNull();
    await expect(gateway.readTotal()).resolves.toBeNull();
  });
});
