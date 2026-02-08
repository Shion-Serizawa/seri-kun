type VisitsResponse = { total: number };
export {};

declare global {
  interface Window {
    __seriKunTotalVisitsPromise?: Promise<number | null>;
  }
}

function isVisitsResponse(value: unknown): value is VisitsResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (!('total' in value)) {
    return false;
  }

  const total = (value as { total: unknown }).total;
  return typeof total === 'number' && Number.isFinite(total) && total >= 0;
}

function formatTotal(total: number): string {
  return new Intl.NumberFormat('en-US').format(total);
}

async function requestTotalVisits(): Promise<number | null> {
  const response = await fetch('/api/visits', {
    method: 'POST',
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

function getTotalVisitsOnce(): Promise<number | null> {
  if (!window.__seriKunTotalVisitsPromise) {
    window.__seriKunTotalVisitsPromise = requestTotalVisits().catch((error: unknown) => {
      if (import.meta.env.DEV) {
        console.debug('Failed to load total visits', error);
      }
      return null;
    });
  }
  return window.__seriKunTotalVisitsPromise;
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

  const formatted = formatTotal(total);
  for (const value of values) {
    value.textContent = formatted;
    value.setAttribute('aria-label', `Total visits ${formatted}`);
  }
}

void updateTotalVisits();
