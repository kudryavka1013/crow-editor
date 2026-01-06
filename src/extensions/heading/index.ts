import Heading from "@tiptap/extension-heading";
import { mergeAttributes } from "@tiptap/core";

/**
 * 扩展 Heading 插件
 * 使用 div + span 结构替代 p 标签
 */
export const CrowHeading = Heading.extend({
  // const originalRender = parentHTML?.renderHTML?.({ node, HTMLAttributes });

  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level);
    const level = hasLevel ? node.attrs.level : this.options.levels[0];

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "crow-heading",
        level,
      }),
      [
        "div",
        { class: "text-block-content-container" },
        // ["span", { class: "crow-list-str" },'123'],  // 测试序号
        ["span", { class: "text-block-heading-content" }, 0],
      ],
    ];
  },
});
