import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 文档标题节点
 * 位于 titleBlock 内的标题
 */
export const DocTitle = Node.create({
  name: "docTitle",

  content: "text*",

  marks: "",

  addAttributes() {
    return {
      textAlign: {
        default: "left",
        parseHTML: (element) => element.style.textAlign || "left",
        renderHTML: (attributes) => {
          if (attributes.textAlign === "left") return {};
          return { style: `text-align: ${attributes.textAlign}` };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "p.mainTitle" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["p", mergeAttributes(HTMLAttributes, { class: "mainTitle" }), 0];
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { $from } = editor.state.selection;

        // 在标题内按 Enter，跳到 contentBlock 第一个位置
        if ($from.parent.type.name === "docTitle") {
          let contentBlockPos = null;
          editor.state.doc.descendants((node, pos) => {
            if (node.type.name === "contentBlock" && contentBlockPos === null) {
              contentBlockPos = pos + 1;
              return false;
            }
          });

          if (contentBlockPos !== null) {
            editor.commands.focus(contentBlockPos);
            return true;
          }
        }

        return false;
      },

      Backspace: ({ editor }) => {
        const { $from } = editor.state.selection;

        // 阻止删除标题节点
        if ($from.parent.type.name === "docTitle" && $from.parentOffset === 0) {
          return true;
        }

        return false;
      },
    };
  },
});
