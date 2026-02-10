import { Node } from "@tiptap/core";
import { DocTitle } from "./docTitle";
import { BaseNodeType } from "../constants";

/**
 * DocTitle 基础节点
 * header
 */
export const PageBlockHeader = Node.create({
  name: BaseNodeType.PageBlockHeader,

  group: "logicBlock",

  content: BaseNodeType.DocTitle,

  isolating: true,

  addExtensions() {
    return [DocTitle];
  },

  parseHTML() {
    return [{ tag: "div.page-block-header" }];
  },

  renderHTML() {
    return ["div", { class: "page-block-header" }, 0];
  },
});
