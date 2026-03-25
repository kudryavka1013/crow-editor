import Paragraph from "@tiptap/extension-paragraph";
import { mergeAttributes } from "@tiptap/core";
import { wrapBlockNode } from "@/lib/wrapBlockNode";

/**
 * 扩展 Paragraph 插件
 * - 使用 div + span 结构替代 p 标签
 * - https://github.com/ueberdosis/tiptap/blob/main/packages/extension-paragraph/src/paragraph.ts
 */
export const CrowParagraph = Paragraph.extend({
  group: "block subBlock",

  renderHTML({ node, HTMLAttributes }) {
    // 使用 wrapBlockNode 统一添加外层容器
    return wrapBlockNode(
      "paragraph",
      [
        "div",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          class: "crow-paragraph",
          "data-record-id": undefined
        }),
        [
          "div",
          { class: "text-block-content-container" },
          ["span", { class: "text-block-paragraph-content" }, 0],
        ],
      ],
      node.attrs
    );
  },
});
