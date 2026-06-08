import { describe, expect, it } from 'vitest';

import { renderMermaidHtml } from './mermaid-html';

describe('renderMermaidHtml', () => {
  it('keeps Mermaid line breaks as text instead of converting them to HTML breaks', () => {
    const html = renderMermaidHtml('flowchart TB\n  A --> B');

    expect(html).toContain('flowchart TB\n  A --&gt; B');
    expect(html).not.toContain('flowchart TB<br');
  });

  it('escapes HTML syntax while preserving Mermaid label HTML as text for the parser', () => {
    const html = renderMermaidHtml('A["ローカル開発<br/>pnpm dev"] --> B');

    expect(html).toBe('<div class="mermaid">A["ローカル開発&lt;br/&gt;pnpm dev"] --&gt; B</div>');
  });
});
