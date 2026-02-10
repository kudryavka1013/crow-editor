import Blockquote from "@tiptap/extension-blockquote";
import { mergeAttributes } from "@tiptap/core";

/**
 * 扩展 Blockquote 插件
 * - 使用 div 结构替代 blockquote 标签
 * - https://github.com/ueberdosis/tiptap/blob/main/packages/extension-blockquote/src/blockquote.tsx
 */
export const CrowBlockquote = Blockquote.extend({
  content: "subBlock+",

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "crow-blockquote",
      }),
      ["div", { class: "quote-container-block-children" }, 0],
    ];
  },
});
