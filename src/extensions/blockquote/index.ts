import Blockquote from "@tiptap/extension-blockquote";
import { mergeAttributes } from "@tiptap/core";

/**
 * 扩展 Blockquote 插件
 * 使用 div 结构替代 blockquote 标签
 */
export const CrowBlockquote = Blockquote.extend({
  // const originalRender = parentHTML?.renderHTML?.({ node, HTMLAttributes });

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
