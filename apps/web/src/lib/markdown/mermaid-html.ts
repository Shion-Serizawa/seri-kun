/**
 * Escapes text so Mermaid source can be embedded inside HTML without creating
 * markup that runs before Mermaid parses it.
 */
export function escapeHtmlText(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/**
 * Renders Mermaid source as escaped inline HTML for Astro's Markdown pipeline.
 */
export function renderMermaidHtml(source: string): string {
  return `<div class="mermaid">${escapeHtmlText(source)}</div>`;
}
