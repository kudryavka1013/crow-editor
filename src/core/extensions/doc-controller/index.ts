import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

/**
 * 文档结构控制器
 * 确保文档结构固定为 doc → logicBlock{2}
 */
export const DocController = Extension.create({
  name: "docController",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("docController"),

        appendTransaction(transactions, oldState, newState) {
          const tr = newState.tr;
          let modified = false;

          const doc = newState.doc;

          // 确保文档有且只有 2 个 logicBlock
          if (doc.childCount !== 2) {
            console.warn("文档结构异常：必须包含 2 个 logicBlock");
            return null;
          }

          // 检查是否都是 logicBlock
          const firstChild = doc.firstChild;
          const lastChild = doc.lastChild;

          if (
            firstChild?.type.name !== "pageBlockHeader" ||
            lastChild?.type.name !== "pageBlockChildren"
          ) {
            console.warn("文档结构异常：第一个必须是 pageBlockHeader，第二个必须是 pageBlockChildren");
            return null;
          }

          // 检查 pageBlockHeader 内容
          if (firstChild) {
            // 确保只有一个 docTitle
            if (firstChild.childCount === 0) {
              // 如果为空，插入 docTitle
              const docTitle = newState.schema.nodes.docTitle.create(null, newState.schema.text("无标题"));
              tr.insert(1, docTitle);
              modified = true;
            } else if (firstChild.childCount > 1 || firstChild.firstChild?.type.name !== "docTitle") {
              // 如果有多个节点或第一个不是 docTitle，清理并重建
              const docTitleNode = Array.from({ length: firstChild.childCount })
                .map((_, i) => firstChild.child(i))
                .find(node => node.type.name === "docTitle");

              if (docTitleNode) {
                // 保留 docTitle，删除其他
                tr.replaceWith(1, firstChild.nodeSize - 1, docTitleNode);
                modified = true;
              } else {
                // 没有 docTitle，创建一个
                const docTitle = newState.schema.nodes.docTitle.create(null, newState.schema.text("无标题"));
                tr.replaceWith(1, firstChild.nodeSize - 1, docTitle);
                modified = true;
              }
            }
          }

          // 确保 pageBlockChildren 至少有一个节点
          if (lastChild && lastChild.childCount === 0) {
            const paragraph = newState.schema.nodes.paragraph.create();
            const pos = doc.firstChild!.nodeSize + 1;
            tr.insert(pos, paragraph);
            modified = true;
          }

          return modified ? tr : null;
        },
      }),
    ];
  },
});
