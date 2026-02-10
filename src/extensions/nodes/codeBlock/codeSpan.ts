import { Node, mergeAttributes } from "@tiptap/core";

/**
 * CodeSpan 节点 - 作为 CodeBlock 的子节点
 * - 代表代码块中的一行
 * - 只允许纯文本内容
 */
export const CodeSpan = Node.create({
  name: "codeSpan",

  // 只包含文本，不允许嵌套其他节点
  content: "text*",

  // 不允许任何标记（格式）
  marks: '_',

  // 属于 block 组，可以作为块级节点
  group: "block",

  // 标记为代码节点
  code: true,

  // 定义节点
  defining: true,

  // 解析 HTML
  parseHTML() {
    return [
      {
        tag: "div.code-span",
        preserveWhitespace: "full", // 保留所有空格
      },
    ];
  },

  // 渲染 HTML
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class: "code-line",
      }),
      0, // 0 表示内容插槽
    ];
  },

  // 键盘快捷键
  addKeyboardShortcuts() {
    return {
      // Enter: 创建新的 codeSpan
      Enter: () => {
        const { state } = this.editor;
        const { $from } = state.selection;

        // 检查是否在 codeSpan 中
        if ($from.parent.type.name !== this.name) {
          return false;
        }

        // 在当前 codeSpan 后插入新的 codeSpan
        return this.editor.commands.command(({ tr }) => {
          const pos = $from.after();
          const node = this.type.create();
          tr.insert(pos, node);
          tr.setSelection(
            this.editor.state.selection.constructor.near(
              tr.doc.resolve(pos + 1)
            )
          );
          return true;
        });
      },

      // Backspace: 如果在行首，删除空行或合并到上一行
      Backspace: () => {
        const { state } = this.editor;
        const { $from, empty } = state.selection;

        if (!empty || $from.parent.type.name !== this.name) {
          return false;
        }

        // 如果在行首
        if ($from.parentOffset === 0) {
          // 如果是空行，删除整行
          if ($from.parent.textContent.length === 0) {
            return this.editor.commands.deleteNode(this.name);
          }

          // TODO: 合并到上一行的逻辑
        }

        return false;
      },
    };
  },
});

