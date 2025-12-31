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
   * 鼠标悬停时的回调函数
   */
  onHover?: (
    node: ProseMirrorNode,
    pos: number,
    allNodes: Array<{ node: ProseMirrorNode; pos: number }>
  ) => void;

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
        onHover: (state) => {
          const { node, pos, allNodes } = state;
          console.log(state)
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
