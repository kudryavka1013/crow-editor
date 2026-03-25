import type { EditorState } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";

/**
 * 光标是否位于节点头部
 */
export function isCursorAtNodeStart(state: EditorState): boolean {
  const { $from } = state.selection;
  return $from.parentOffset === 0;
}

/**
 * 在节点开头按 Backspace 时，优先循环切换文本对齐方式
 * right -> center -> left，到 left（或无对齐）时返回 false 继续走后续逻辑
 */
export function handleBackspaceTextAlign(
  editor: Editor,
  node: PMNode,
): boolean {
  const textAlign = node.attrs?.textAlign;
  if (textAlign === "right") {
    editor.chain().setTextAlign("center").run();
    return true;
  }
  if (textAlign === "center") {
    editor.chain().setTextAlign("left").run();
    return true;
  }
  return false;
}
