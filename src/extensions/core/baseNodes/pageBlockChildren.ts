import { Node } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";
import { BaseNodeType } from "../constants";
import { isCursorAtNodeStart, handleBackspaceTextAlign } from "@/lib/utils";

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
       * 在 pageBlockChildren 的子节点按 Backspace
       * 场景1: heading 节点开头按 Backspace -> 转换为 paragraph
       * 场景2: paragraph 第一个子节点开头按 Backspace -> 合并到 docTitle
       * 1. 获取第一个子节点内容
       * 2. 查找 docTitle 节点位置
       * 3. 删除 pageBlockChildren 的第一个子节点
       * 4. 将第一个子节点内容追加到 docTitle 末尾
       * 5. 设置光标到两段文本连接处
       */
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from, empty } = selection;

        // 必须在节点开头
        if (!isCursorAtNodeStart(state)) return false;
        if (!empty) return false;

        const blockNode = $from.parent;
        const parentNode = $from.node($from.depth - 1);

        // 父节点必须是 PageBlockChildren
        if (parentNode.type.name !== BaseNodeType.PageBlockChildren) {
          return false;
        }

        // 场景1: heading 转换为 paragraph
        if (blockNode.type.name === "heading") {
          // 前置判断：当对齐属性存在时，优先循环切换对齐方式 right -> center -> left
          if (handleBackspaceTextAlign(editor, blockNode)) return true;

          // 检查前一个节点是否是空的 paragraph
          const currentIndex = $from.index($from.depth - 1);
          if (currentIndex > 0) {
            const prevNode = parentNode.child(currentIndex - 1);
            // 如果前一个节点是空的 paragraph，走默认行为（删除空段落）
            if (
              prevNode.type.name === "paragraph" &&
              prevNode.content.size === 0
            ) {
              return false;
            }
          }

          const tr = state.tr;
          const pos = $from.before($from.depth);

          // 创建 paragraph 节点，保留 heading 的内容和属性（如 data-id）
          const paragraphNode = state.schema.nodes.paragraph.create(
            blockNode.attrs,
            blockNode.content
          );

          // 替换 heading 为 paragraph
          tr.replaceWith(pos, pos + blockNode.nodeSize, paragraphNode);
          tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 1)));

          editor.view.dispatch(tr);
          return true;
        }

        // 场景2: paragraph 合并到 docTitle（必须是第一个子节点）
        if (blockNode.type.name === "paragraph") {
          // 前置判断：当对齐属性存在时，优先循环切换对齐方式 right -> center -> left
          if (handleBackspaceTextAlign(editor, blockNode)) return true;

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
        }

        return false;
      },
    };
  },
});
