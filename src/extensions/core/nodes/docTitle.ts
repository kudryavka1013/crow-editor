import { Node, mergeAttributes } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";
import { BaseNodeType } from "../constants";

/**
 * 文档标题节点
 * 位于 PageBlockHeader 内的标题
 * 只能包含文本节点
 */
export const DocTitle = Node.create({
  name: BaseNodeType.DocTitle,

  content: "text*",

  /* 禁用所有 marks */
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
      /**
       * 标题内按 Enter
       * 1. 寻找 PageBlockChildren 节点位置
       * 2. 创建一个新的段落节点，将标题中光标后的内容插入节点
       * 3. 新段落插入到 PageBlockChildren 的第一个位置
       * 4. 设置光标到新段落开头
       * 5. 删除标题中光标后的内容（由于插入操作会改变位置，需要在最后进行删除）
       */
      Enter: ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;

        if ($from.parent.type.name === BaseNodeType.DocTitle) {
          // 1. 寻找 PageBlockChildren 节点位置
          let pageBlockChildrenPos: number | null = null;

          state.doc.descendants((node, pos) => {
            if (
              node.type.name === BaseNodeType.PageBlockChildren &&
              pageBlockChildrenPos === null
            ) {
              pageBlockChildrenPos = pos;
              return false;
            }
          });

          if (pageBlockChildrenPos !== null) {
            let tr = state.tr;

            // 2. 创建一个新的段落节点，将标题中光标后的内容插入节点
            const textAfterCursor = $from.parent.cut($from.parentOffset);
            const paragraphNode = state.schema.nodes.paragraph.create(
              null,
              textAfterCursor.content
            );

            // 3. 新段落插入到 PageBlockChildren 的第一个位置
            const insertPos = pageBlockChildrenPos + 1;
            tr = tr.insert(insertPos, paragraphNode);

            // 4. 设置光标到新段落开头（使用 near 自动找到最近的有效位置）
            const $insertPos = tr.doc.resolve(insertPos + 1);
            tr = tr.setSelection(TextSelection.near($insertPos));
            
            // 5. 删除标题中光标后的内容
            const deleteFrom = $from.pos;
            const deleteTo = $from.pos + textAfterCursor.content.size;
            if (textAfterCursor.content.size > 0) {
              tr = tr.delete(deleteFrom, deleteTo);
            }

            // 提交事务
            editor.view.dispatch(tr);
            return true;
          }
        }

        return false;
      },

      /**
       * 标题内按 Backspace
       * 阻止删除标题节点
       */
      Backspace: ({ editor }) => {
        const { $from } = editor.state.selection;

        // 阻止删除标题节点
        if (
          $from.parent.type.name === BaseNodeType.DocTitle &&
          $from.parentOffset === 0
        ) {
          return true;
        }

        return false;
      },
    };
  },
});
