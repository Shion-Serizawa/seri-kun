import { isVisitsResponse } from './total-visits';

export interface VisitsGateway {
  incrementAndReadTotal(): Promise<number | null>;
  readTotal(): Promise<number | null>;
}

export interface HttpRequester {
  request(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

async function parseVisitsResponse(response: Response): Promise<number | null> {
  if (!response.ok) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    return null;
  }
  if (!isVisitsResponse(parsed)) {
    return null;
  }

  return parsed.total;
}

export function createHttpVisitsGateway(
  requester: HttpRequester,
  endpoint = '/api/visits',
): VisitsGateway {
  return {
    async incrementAndReadTotal(): Promise<number | null> {
      const response = await requester.request(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      });
      return parseVisitsResponse(response);
    },
    async readTotal(): Promise<number | null> {
      const response = await requester.request(endpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      return parseVisitsResponse(response);
    },
  };
}

export async function loadTotalVisits(gateway: VisitsGateway): Promise<number | null> {
  const incremented = await gateway.incrementAndReadTotal();
  if (typeof incremented === 'number') {
    return incremented;
  }

  return gateway.readTotal();
}
