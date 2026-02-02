export function parseSelectedTag(
  searchParams: string,
  knownTags: readonly string[],
): string | null {
  const params = new URLSearchParams(searchParams);
  const tag = params.get('tag');
  if (!tag) return null;
  if (!knownTags.includes(tag)) return null;
  return tag;
}

