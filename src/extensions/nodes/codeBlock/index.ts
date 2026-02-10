import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createReactNodeView } from "@/lib/createReactNodeView";
import { CodeBlockNodeView } from "./codeBlock";
import { mergeAttributes } from "@tiptap/core";
import { createLowlight } from "lowlight";
import { grammars } from "./languages";

const lowlight = createLowlight(grammars);

/**
 * 扩展 Code Block 插件
 * - 使用 react node view 渲染容器
 * - 支持语法高亮
 */
export const CrowCodeBlock = CodeBlockLowlight.configure({
  lowlight,
  defaultLanguage: "plaintext",
}).extend({
  group: "block subBlock",

  // 确保 language 属性被正确序列化
  // addAttributes() {
  //   return {
  //     ...this.parent?.(),
  //     language: {
  //       default: "plaintext",
  //       // parseHTML: (element) => element.getAttribute("data-language"),
  //       // renderHTML: (attributes) => {
  //       //   return {
  //       //     // "data-language": attributes.language,
  //       //     // class: `language-${attributes.language}`,
  //       //   };
  //       // },
  //     },
  //   };
  // },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return createReactNodeView(CodeBlockNodeView, "crow-code-block");
  },
});
