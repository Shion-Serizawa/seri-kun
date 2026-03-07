// @ts-check
import { defineConfig } from 'astro/config';

function remarkMermaid() {
  return (/** @type {any} */ tree) => {
    /** @type {any[]} */
    const toReplace = [];
    const visit = (/** @type {any} */ node) => {
      if (node.type === 'code' && node.lang === 'mermaid') {
        toReplace.push(node);
      }
      node.children?.forEach(visit);
    };
    visit(tree);
    toReplace.forEach((node) => {
      const mermaidSource = node.value.replaceAll('\\n', '<br/>');
      Object.assign(node, {
        type: 'html',
        value: `<div class="mermaid">${mermaidSource}</div>`,
        lang: undefined,
        meta: undefined,
        children: undefined,
      });
    });
  };
}

// https://astro.build/config
export default defineConfig({
  output: 'static',
  markdown: {
    remarkPlugins: [remarkMermaid],
  },
});
