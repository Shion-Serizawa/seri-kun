export type VisitsResponse = { total: number };

export function isVisitsResponse(value: unknown): value is VisitsResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (!('total' in value)) {
    return false;
  }

  const total = (value as { total: unknown }).total;
  return typeof total === 'number' && Number.isFinite(total) && total >= 0;
}

export function formatTotal(total: number, locale?: string): string {
  return new Intl.NumberFormat(locale).format(total);
}
