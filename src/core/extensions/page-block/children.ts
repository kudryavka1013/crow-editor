import { Node } from "@tiptap/core";

/**
 * DocTitle 基础节点
 * children
 */
export const PageBlockChildren = Node.create({
  name: "pageBlockChildren",

  group: "logicBlock",

  content: "block+",

  isolating: true,

  parseHTML() {
    return [{ tag: "div.page-block-children" }];
  },

  renderHTML() {
    return ["div", { class: "page-block-children" }, 0];
  },
});
