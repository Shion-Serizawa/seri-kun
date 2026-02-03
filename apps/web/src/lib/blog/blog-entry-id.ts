const EXT_RE = /\.[^./]+$/;

export function toBlogRouteId(entryId: string): string {
  const lastSegment = entryId.split('/').at(-1) ?? entryId;
  return lastSegment.replace(EXT_RE, '');
}

