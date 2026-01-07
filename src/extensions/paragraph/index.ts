import Paragraph from "@tiptap/extension-paragraph";
import { mergeAttributes } from "@tiptap/core";

/**
 * 扩展 Paragraph 插件
 * - 使用 div + span 结构替代 p 标签
 * - https://github.com/ueberdosis/tiptap/blob/main/packages/extension-paragraph/src/paragraph.ts
 */
export const CrowParagraph = Paragraph.extend({
  // group: 'block',
  group: "block subBlock",

  renderHTML({ HTMLAttributes }) {
    // 使用 div + div + span 三层结构
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "crow-paragraph",
      }),
      [
        "div",
        { class: "text-block-content-container" },
        // ["span", { class: "crow-list-str" },'123'],  // 测试序号
        ["span", { class: "text-block-paragraph-content" }, 0],
      ],
    ];
  },
});
