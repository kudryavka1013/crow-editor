import { Node } from "@tiptap/core";

/**
 * DocTitle 基础节点
 * header
 */
export const PageBlockHeader = Node.create({
  name: "pageBlockHeader",

  group: "logicBlock",

  content: "docTitle",

  isolating: true,

  parseHTML() {
    return [{ tag: "div.page-block-header" }];
  },

  renderHTML() {
    return ["div", { class: "page-block-header" }, 0];
  },
});
