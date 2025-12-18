/**
 * Node Hover Plugin
 *
 * 参考官方 focus 插件实现
 * https://github.com/ueberdosis/tiptap/blob/develop/packages/extensions/src/focus/focus.ts
 */

import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";

export interface NodeHoverPluginOptions {
  className: string;
  mode: "all" | "deepest" | "shallowest";
  onHover?: (node: ProseMirrorNode, pos: number, allNodes: Array<{ node: ProseMirrorNode; pos: number }>) => void;
  onLeave?: () => void;
}

export function NodeHoverPlugin(options: NodeHoverPluginOptions): Plugin {
  // 当前悬停的节点位置和节点引用
  let currentHoveredPos: number | null = null;
  let currentHoveredNode: ProseMirrorNode | null = null;

  return new Plugin({
    key: new PluginKey("nodeHover"),
    props: {
      decorations: ({ doc }) => {
        const decorations: Decoration[] = [];
        const hoveredPos = currentHoveredPos;

        // 提前返回空装饰集，避免不必要的计算
        if (hoveredPos === null) {
          return DecorationSet.create(doc, []);
        }

        // 赋值给局部常量，让 TypeScript 能够正确推断类型
        let maxLevels = 0;

        // deepest 模式下计算最深层级
        if (options.mode === "deepest") {
          doc.descendants((node, pos) => {
            if (node.isText) {
              return;
            }

            const isCurrent =
              hoveredPos >= pos && hoveredPos <= pos + node.nodeSize - 1;

            if (!isCurrent) {
              return false;
            }

            maxLevels += 1;
          });
        }

        let currentLevel = 0;

        doc.descendants((node, pos) => {
          if (node.isText) {
            return false;
          }

          const isCurrent =
            hoveredPos >= pos && hoveredPos <= pos + node.nodeSize - 1;

          if (!isCurrent) {
            return false;
          }

          currentLevel += 1;

          const outOfScope =
            (options.mode === "deepest" && maxLevels - currentLevel > 0) ||
            (options.mode === "shallowest" && currentLevel > 1);

          if (outOfScope) {
            return options.mode === "deepest";
          }

          decorations.push(
            Decoration.node(pos, pos + node.nodeSize, {
              class: options.className,
            })
          );
        });

        return DecorationSet.create(doc, decorations);
      },

      handleDOMEvents: {
        mousemove: (view, event) => {
          // 获取鼠标位置对应的文档节点位置
          const pos = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          // 鼠标移出编辑器区域
          if (!pos) {
            if (currentHoveredPos !== null) {
              currentHoveredPos = null;
              currentHoveredNode = null;
              options.onLeave?.();
              view.updateState(view.state);
            }
            return false;
          }

          // 使用 pos.pos（最接近的位置），而不是 inside
          // 这样即使在空白区域也能找到附近的节点
          const hoveredPos = pos.pos;

          // 位置相同时直接返回，避免不必要的重新渲染
          if (hoveredPos !== currentHoveredPos) {
            currentHoveredPos = hoveredPos;

            let targetNode: ProseMirrorNode | null = null;
            let targetPos = 0;
            const allNodes: Array<{ node: ProseMirrorNode; pos: number }> = [];

            // descendants 访问文档树中的所有后代节点
            view.state.doc.descendants((node, nodePos) => {
              if (node.isText) {
                return false;
              }

              const isCurrent =
                hoveredPos >= nodePos &&
                hoveredPos <= nodePos + node.nodeSize - 1;

              if (isCurrent) {
                // 收集所有匹配的节点
                allNodes.push({ node, pos: nodePos });
                // 最后一个就是最深层的节点
                targetNode = node;
                targetPos = nodePos;
              }
            });

            // 只在节点真正改变时触发回调
            if (targetNode !== currentHoveredNode) {
              currentHoveredNode = targetNode;

              // 只有找到有效节点时才触发 onHover，否则触发 onLeave
              if (targetNode) {
                options.onHover?.(targetNode, targetPos, allNodes);
              } else if (currentHoveredNode !== null) {
                options.onLeave?.();
              }
            }

            view.updateState(view.state);
          }

          return false;
        },

        mouseleave: (view) => {
          // 清理状态
          if (currentHoveredPos !== null) {
            currentHoveredPos = null;
            currentHoveredNode = null;
            options.onLeave?.();
            view.updateState(view.state);
          }
          return false;
        },
      },
    },
  });
}
