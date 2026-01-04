import { Document } from "@tiptap/extension-document";
import { PageBlockHeader, PageBlockChildren } from "../nodes";
import { baseStructure } from "./baseStructure";

/**
 * 文档结构
 * 固定结构：两个 LogicBlock [pageBlockHeader, pageBlockChildren]
 * 不可删除、不可增加、顺序固定
 */
export const CrowDocument = Document.extend({
  name: "doc",

  content: "pageBlockHeader pageBlockChildren",

  addExtensions() {
    return [PageBlockHeader, PageBlockChildren];
  },

  addProseMirrorPlugins() {
    return [
      baseStructure(),
      // 未来可以添加更多 plugins
    ];
  },
});
