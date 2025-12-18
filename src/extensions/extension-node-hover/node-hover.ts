import { Extension } from "@tiptap/core";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { NodeHoverPlugin } from "./node-hover-plugin";

export interface HoverOptions {
  /**
   * 鼠标悬停时添加到节点的类名
   * @default 'is-hovered'
   */
  className: string;

  /**
   * 悬停节点的确定模式
   * - all: 标记所有被悬停的节点（从最外层到最内层）
   * - deepest: 只标记最深层的节点
   * - shallowest: 只标记最浅层的节点
   * @default 'deepest'
   */
  mode: "all" | "deepest" | "shallowest";

  /**
   * 鼠标悬停时的回调函数
   */
  onHover?: (node: ProseMirrorNode, pos: number, allNodes: Array<{ node: ProseMirrorNode; pos: number }>) => void;

  /**
   * 鼠标离开时的回调函数
   */
  onLeave?: () => void;
}

export const NodeHover = Extension.create<HoverOptions>({
  name: "nodeHover",

  addOptions() {
    return {
      className: "is-hovered",
      mode: "deepest",
      onHover: undefined,
      onLeave: undefined,
      showButton: false,
      onButtonClick: undefined,
    };
  },

  addStorage() {
    return {
      hoveredNode: null as ProseMirrorNode | null,
      hoveredPos: null as number | null,
      allHoveredNodes: [] as Array<{ node: ProseMirrorNode; pos: number }>,
    };
  },

  addProseMirrorPlugins() {
    return [
      NodeHoverPlugin({
        className: this.options.className,
        mode: this.options.mode,
        onHover: (node, pos, allNodes) => {
          // 更新 storage
          this.storage.hoveredNode = node;
          this.storage.hoveredPos = pos;
          this.storage.allHoveredNodes = allNodes;
          // 调用用户提供的回调
          this.options.onHover?.(node, pos, allNodes);
        },
        onLeave: () => {
          // 清空 storage
          this.storage.hoveredNode = null;
          this.storage.hoveredPos = null;
          this.storage.allHoveredNodes = [];
          // 调用用户提供的回调
          this.options.onLeave?.();
        },
      }),
    ];
  },
});
