import { formatTotal, isVisitsResponse } from './total-visits';

let totalVisitsPromise: Promise<number | null> | null = null;

async function requestVisitsWithMethod(method: 'GET' | 'POST'): Promise<number | null> {
  const response = await fetch('/api/visits', {
    method,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return null;
  }

  const parsed: unknown = await response.json();
  if (!isVisitsResponse(parsed)) {
    return null;
  }

  return parsed.total;
}

async function requestTotalVisits(): Promise<number | null> {
  const incremented = await requestVisitsWithMethod('POST');
  if (typeof incremented === 'number') {
    return incremented;
  }

  // If increment fails (e.g. rate-limited), fall back to reading the latest value.
  return requestVisitsWithMethod('GET');
}

function getTotalVisitsOnce(): Promise<number | null> {
  if (!totalVisitsPromise) {
    totalVisitsPromise = requestTotalVisits().catch((error: unknown) => {
      if (import.meta.env.DEV) {
        console.debug('Failed to load total visits', error);
      }
      return null;
    });
  }
  return totalVisitsPromise;
}

async function updateTotalVisits(): Promise<void> {
  const values = document.querySelectorAll<HTMLElement>('[data-total-visits-value]');
  if (values.length === 0) {
    return;
  }

  const total = await getTotalVisitsOnce();
  if (typeof total !== 'number') {
    return;
  }

  const locale = document.documentElement.lang || navigator.language;
  const formatted = formatTotal(total, locale);
  for (const value of values) {
    value.textContent = formatted;
    value.setAttribute('aria-label', `Total visits ${formatted}`);
  }
}

void updateTotalVisits();
