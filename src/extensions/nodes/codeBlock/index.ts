import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createReactNodeView } from "@/lib/createReactNodeView";
import { CodeBlockNodeView } from "./codeBlock";
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

  addAttributes() {
    return {
      ...this.parent?.(),
      collapsed: {
        default: false,
        parseHTML: (element) =>
          element.getAttribute("data-collapsed") === "true",
        renderHTML: (attributes) => {
          return {
            "data-collapsed": attributes.collapsed,
          };
        },
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "pre",
        preserveWhitespace: "full",
      },
      {
        tag: "code",
        preserveWhitespace: "full",
      },
    ];
  },

  /** 使用默认插件的格式，复制时写入的格式
   * 结构见 https://github.com/ueberdosis/tiptap/blob/main/packages/extension-code-block/src/code-block.ts#L141-L153
   */

  // renderHTML({ HTMLAttributes }) {
  //   return ["code", mergeAttributes(HTMLAttributes), 0];
  // },

  addNodeView() {
    return createReactNodeView(CodeBlockNodeView, "doc-codeBlock-block");
  },
});
