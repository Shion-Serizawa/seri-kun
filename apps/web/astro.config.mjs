// @ts-check
import { defineConfig } from 'astro/config';

/**
 * @typedef {{ type: string, children?: RemarkNode[] }} RemarkNode
 * @typedef {RemarkNode & { type: 'root', children: RemarkNode[] }} RemarkRoot
 * @typedef {RemarkNode & { type: 'code', lang?: string, value: string, meta?: string }} RemarkCode
 */

/**
 * @param {string} value
 * @returns {string}
 */
export function escapeHtmlText(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/**
 * @param {string} source
 * @returns {string}
 */
export function renderMermaidHtml(source) {
  return `<div class="mermaid">${escapeHtmlText(source)}</div>`;
}

export function remarkMermaid() {
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
      Object.assign(node, {
        type: 'html',
        value: renderMermaidHtml(node.value),
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
