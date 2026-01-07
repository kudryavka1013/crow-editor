import CodeBlock from "@tiptap/extension-code-block";
import { createReactNodeView } from "@/lib/createReactNodeView";
import { CodeBlockNodeView } from "./codeBlock";

/**
 * 扩展 Code Block 插件
 * - 使用 react node view 渲染容器
 */
export const CrowCodeBlock = CodeBlock.extend({
  group: "block subBlock",

  addNodeView() {
    return createReactNodeView(CodeBlockNodeView, "crow-code-block");
  },
});
