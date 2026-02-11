import Heading from "@tiptap/extension-heading";
import { mergeAttributes } from "@tiptap/core";
import { wrapBlockNode } from "@/lib/wrapBlockNode";

/**
 * 扩展 Heading 插件
 * - 使用 div + span 结构替代 p 标签
 * - https://github.com/ueberdosis/tiptap/blob/main/packages/extension-heading/src/heading.ts
 */
export const CrowHeading = Heading.extend({
  group: "block subBlock",

  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level);
    const level = hasLevel ? node.attrs.level : this.options.levels[0];

    return wrapBlockNode(
      "heading",
      [
        `h${level}`,
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          class: "crow-heading",
          "data-record-id": undefined,
          level,
        }),
        [
          "div",
          { class: "text-block-content-container" },
          ["span", { class: "text-block-heading-content" }, 0],
        ],
      ],
      node.attrs,
    );
  },
});
