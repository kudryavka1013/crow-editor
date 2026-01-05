import type { EditorState } from "@tiptap/pm/state";

/**
 * 光标是否位于节点头部
 */
export function isCursorAtNodeStart(state: EditorState): boolean {
  const { $from } = state.selection;
  return $from.parentOffset === 0;
}
