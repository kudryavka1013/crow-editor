import { Node } from "@tiptap/core";
import { BaseNodeType } from "../constants";

/**
 * DocTitle 基础节点
 * children
 */
export const PageBlockChildren = Node.create({
  name: BaseNodeType.PageBlockChildren,

  group: "logicBlock",

  content: "block+",

  isolating: true,

  parseHTML() {
    return [{ tag: "div.page-block-children" }];
  },

  renderHTML() {
    return ["div", { class: "page-block-children" }, 0];
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;

        // 检查是否在 pageBlockChildren 的第一个子节点
        if ($from.depth >= 2) {
          const pageBlockChildren = $from.node($from.depth - 1);
          const blockNode = $from.parent;

          // 确认在 pageBlockChildren 内的第一个节点，且必须是 paragraph
          if (
            pageBlockChildren.type.name === BaseNodeType.PageBlockChildren &&
            blockNode.type.name === "paragraph" && // 必须是段落
            $from.index($from.depth - 1) === 0 && // 是第一个子节点
            $from.parentOffset === 0 // 光标在节点开头
          ) {
            // 获取第一个节点的文本内容
            const firstNodeText = blockNode.textContent;

            // 查找 docTitle 节点
            let docTitlePos: number | null = null;
            let docTitleNode = null;
            state.doc.descendants((node, pos) => {
              if (node.type.name === BaseNodeType.DocTitle && docTitlePos === null) {
                docTitlePos = pos;
                docTitleNode = node;
                return false;
              }
            });

            if (docTitlePos !== null && docTitleNode) {
              const tr = state.tr;

              // 计算 docTitle 原内容末尾位置（两段文本的连接点）
              const docTitleEndPos = docTitlePos + docTitleNode.nodeSize - 1;

              // 将文本追加到 docTitle 末尾
              if (firstNodeText.length > 0) {
                tr.insertText(firstNodeText, docTitleEndPos);
              }

              // 删除第一个节点
              const firstNodePos = $from.before($from.depth);
              const firstNodeEndPos = $from.after($from.depth);
              tr.delete(firstNodePos, firstNodeEndPos);

              // 设置光标到两段文本中间（原 docTitle 内容末尾）
              tr.setSelection(
                state.selection.constructor.near(tr.doc.resolve(docTitleEndPos))
              );

              editor.view.dispatch(tr);
              return true;
            }
          }
        }

        return false;
      },
    };
  },
});
