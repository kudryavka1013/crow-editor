import { Extension } from "@tiptap/core";
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
  onHover?: (node: any, pos: number) => void;

  /**
   * 鼠标离开时的回调函数
   */
  onLeave?: () => void;

  /**
   * 是否在 hover 节点左上角显示按钮
   * @default false
   */
  showButton?: boolean;

  /**
   * 按钮点击的回调函数
   */
  onButtonClick?: (node: any, pos: number) => void;
}

export const Hover = Extension.create<HoverOptions>({
  name: "hover",

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

  addProseMirrorPlugins() {
    return [
      NodeHoverPlugin({
        className: this.options.className,
        mode: this.options.mode,
        onHover: this.options.onHover,
        onLeave: this.options.onLeave,
      }),
    ];
  },
});
