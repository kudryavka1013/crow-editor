import { Document } from "@tiptap/extension-document";

/**
 * 文档结构
 * 固定结构：两个 LogicBlock [pageBlockHeader, pageBlockChildren]
 * 不可删除、不可增加、顺序固定
 */
export const CrowDocument = Document.extend({
  name: "doc",

  // 固定两个 logicBlock：第一个是 header，第二个是 children
  content: "pageBlockHeader pageBlockChildren",
});
