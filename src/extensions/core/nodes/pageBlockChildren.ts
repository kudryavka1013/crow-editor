import { Node } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";
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
      /**
       * 在 pageBlockChildren 的第一个子节点按 Backspace
       * 1. 获取第一个子节点内容
       * 2. 查找 docTitle 节点位置
       * 3. 删除 pageBlockChildren 的第一个子节点
       * 4. 将第一个子节点内容追加到 docTitle 末尾
       * 5. 设置光标到两段文本连接处
       */
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;

        // 必须在段落开头
        if ($from.parentOffset !== 0) return false;

        // 必须是段落节点
        const blockNode = $from.parent;
        if (blockNode.type.name !== "paragraph") return false;

        // 段落的父节点必须是 PageBlockChildren
        const parentNode = $from.node($from.depth - 1);
        if (parentNode.type.name !== BaseNodeType.PageBlockChildren) {
          return false;
        }

        // 必须是第一个子节点
        if ($from.index($from.depth - 1) !== 0) return false;

        // 1. 获取第一个节点的文本内容
        const firstNodeText = blockNode.textContent;

        // 2. 查找 docTitle 节点
        let docTitlePos: number | undefined;
        let docTitleNode: typeof state.doc | undefined;
        state.doc.descendants((node, pos) => {
          if (
            node.type.name === BaseNodeType.DocTitle &&
            docTitlePos === undefined
          ) {
            docTitlePos = pos;
            docTitleNode = node;
            return false;
          }
        });

        if (docTitlePos === undefined || !docTitleNode) return false;

        const tr = state.tr;

        // 3. 计算 docTitle 内容末尾位置
        const docTitleEndPos = docTitlePos + docTitleNode.nodeSize - 1;

        // 4. 先删除 pageBlockChildren 的第一个子节点（删除操作在后面，不影响 docTitle 位置）
        const firstNodePos = $from.before($from.depth);
        const firstNodeEndPos = $from.after($from.depth);
        tr.delete(firstNodePos, firstNodeEndPos);

        // 5. 将第一个子节点内容追加到 docTitle 末尾
        if (firstNodeText.length > 0) {
          tr.insertText(firstNodeText, docTitleEndPos);
        }

        // 6. 设置光标到两段文本连接处
        tr.setSelection(TextSelection.near(tr.doc.resolve(docTitleEndPos)));

        editor.view.dispatch(tr);
        return true;
      },
    };
  },
});
