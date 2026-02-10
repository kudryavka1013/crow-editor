import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createReactNodeView } from "@/lib/createReactNodeView";
import { CodeBlockNodeView } from "./codeBlock";
import { mergeAttributes } from "@tiptap/core";
import { CodeSpan } from "./codeSpan";
import { all, createLowlight } from "lowlight";

const lowlight = createLowlight(all);

/**
 * 扩展 Code Block 插件
 * - 使用 react node view 渲染容器
 * - 允许使用格式化标记（粗体、斜体、颜色等）
 */
export const CrowCodeBlock = CodeBlockLowlight.configure({
  lowlight,
}).extend({
  group: "block subBlock",

  // 允许格式化
  // code: false,

  // 允许所有标记（粗体、斜体、颜色等）
  marks: '_',

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    console.log("CodeBlock props:", this);
    return createReactNodeView(CodeBlockNodeView, "crow-code-block");
  },
});
