import { formatTotal } from './total-visits';
import { createHttpVisitsGateway, loadTotalVisits } from './visits-gateway';
import { createLocalStorageVisitsGateway, resolveBrowserLocalStorage } from './visits-gateway.local';

let totalVisitsPromise: Promise<number | null> | null = null;
const gateway = createHttpVisitsGateway({
  request(input, init) {
    return fetch(input, init);
  },
});

async function requestTotalVisits(): Promise<number | null> {
  let total: number | null = null;
  try {
    total = await loadTotalVisits(gateway);
  } catch {
    total = null;
  }
  if (typeof total === 'number') {
    return total;
  }

  if (!import.meta.env.DEV) {
    return null;
  }

  const localStorage = resolveBrowserLocalStorage();
  if (!localStorage) {
    return null;
  }

  try {
    return await loadTotalVisits(createLocalStorageVisitsGateway(localStorage));
  } catch {
    return null;
  }
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

export async function updateTotalVisits(): Promise<void> {
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
