// @ts-check
import { defineConfig } from 'astro/config';

/**
 * @typedef {{ type: string, children?: RemarkNode[] }} RemarkNode
 * @typedef {RemarkNode & { type: 'root', children: RemarkNode[] }} RemarkRoot
 * @typedef {RemarkNode & { type: 'code', lang?: string, value: string, meta?: string }} RemarkCode
 */

function remarkMermaid() {
  /**
   * @param {RemarkRoot} tree
   */
  return (tree) => {
    /** @type {RemarkCode[]} */
    const toReplace = [];
    /**
     * @param {RemarkNode} node
     */
    const visit = (node) => {
      if (node.type === 'code') {
        const codeNode = /** @type {RemarkCode} */ (node);
        if (codeNode.lang === 'mermaid') {
          toReplace.push(codeNode);
        }
      }
      if ('children' in node && Array.isArray(node.children)) {
        /** @type {RemarkNode[]} */
        const children = node.children;
        children.forEach(visit);
      }
    };
    visit(tree);
    /**
     * @param {RemarkCode} node
     */
    toReplace.forEach((node) => {
      const mermaidSource = node.value.replaceAll('\n', '<br/>');
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
  site: 'https://seri-blog.pages.dev',
  output: 'static',
  markdown: {
    remarkPlugins: [remarkMermaid],
  },
});
