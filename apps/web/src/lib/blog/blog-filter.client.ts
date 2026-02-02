import { parseSelectedTag } from './parse-selected-tag';

function listKnownTags(): string[] {
  const links = document.querySelectorAll('[data-tag-link][data-tag]');
  const tags: string[] = [];
  for (const link of links) {
    const tag = link.getAttribute('data-tag');
    if (!tag) continue;
    tags.push(tag);
  }
  return tags;
}

function setActiveTag(selectedTag: string | null): void {
  const links = document.querySelectorAll('[data-tag-link]');
  for (const link of links) {
    const tag = link.getAttribute('data-tag');
    const isActive = (tag === '' && !selectedTag) || tag === selectedTag;
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

function applyFilter(): void {
  const statusEl = document.getElementById('blog-status');
  const emptyEl = document.getElementById('blog-empty');
  if (!statusEl || !emptyEl) return;

  const knownTags = listKnownTags();
  const selectedTag = parseSelectedTag(window.location.search, knownTags);
  setActiveTag(selectedTag);

  const months = document.querySelectorAll('[data-month-group]');
  let visibleCount = 0;

  for (const monthEl of months) {
    const posts = monthEl.querySelectorAll('[data-post]');
    let monthVisible = 0;

    for (const postEl of posts) {
      const raw = postEl.getAttribute('data-tags') || '';
      const tags = raw ? raw.split(',').filter(Boolean) : [];
      const visible = !selectedTag || tags.includes(selectedTag);

      (postEl as HTMLElement).hidden = !visible;
      if (visible) monthVisible += 1;
    }

    (monthEl as HTMLElement).hidden = monthVisible === 0;
    visibleCount += monthVisible;
  }

  (emptyEl as HTMLElement).hidden = visibleCount !== 0;

  if (selectedTag) statusEl.textContent = `Tag: #${selectedTag} (${visibleCount}件)`;
  else statusEl.textContent = `${visibleCount}件`;
}

applyFilter();
window.addEventListener('popstate', applyFilter);

