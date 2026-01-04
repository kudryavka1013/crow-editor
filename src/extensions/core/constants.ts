/**
 * Core 节点类型名称常量
 * 用于避免硬编码字符串，提供类型安全
 */
export const BaseNodeType = {
  DocTitle: "docTitle",
  PageBlockHeader: "pageBlockHeader",
  PageBlockChildren: "pageBlockChildren",
} as const;

/**
 * NodeType 的类型
 */
export type BaseNodeTypeName = (typeof BaseNodeType)[keyof typeof BaseNodeType];
