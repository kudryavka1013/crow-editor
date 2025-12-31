/**
 * Node Hover Plugin
 *
 * 参考官方 focus 插件实现
 * https://github.com/ueberdosis/tiptap/blob/develop/packages/extensions/src/focus/focus.ts
 */

import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";

/**
 * Hover 状态数据
 */
export interface HoverState {
  /** 当前悬停的节点 */
  node: ProseMirrorNode;
  /** 节点在文档中的位置 */
  pos: number;
  /** 节点大小 */
  nodeSize: number;
  /** 所有父级节点（从外到内） */
  allNodes: Array<{ node: ProseMirrorNode; pos: number }>;
  /** 鼠标坐标 */
  mouseCoords: { x: number; y: number };
}

export interface NodeHoverPluginOptions {
  /** 高亮样式类名 */
  className: string;
  /** 不可高亮的节点类型黑名单（如 ['doc', 'text']） */
  excludeNodes?: string[];
  /** hover 回调 */
  onHover?: (state: HoverState) => void;
  /** 离开回调 */
  onLeave?: () => void;
}

export const nodeHoverPluginKey = new PluginKey<HoverState | null>("nodeHover");

export function NodeHoverPlugin(
  options: NodeHoverPluginOptions
): Plugin<HoverState | null> {
  // 默认排除 doc 和 text 节点
  const excludeNodes = new Set(options.excludeNodes || ["doc", "text"]);

  return new Plugin<HoverState | null>({
    key: nodeHoverPluginKey,

    state: {
      init() {
        return null;
      },
      apply(tr, oldState) {
        // 从 meta 中获取新状态
        const meta = tr.getMeta(nodeHoverPluginKey);
        if (meta !== undefined) {
          return meta;
        }
        return oldState;
      },
    },

    props: {
      decorations: (state) => {
        const decorations: Decoration[] = [];
        const hoverState = nodeHoverPluginKey.getState(state);

        // 没有 hover 状态时返回空
        if (!hoverState) {
          return DecorationSet.create(state.doc, []);
        }

        // 只高亮当前节点（最接近的可操作节点）
        decorations.push(
          Decoration.node(
            hoverState.pos,
            hoverState.pos + hoverState.nodeSize,
            {
              class: options.className,
            }
          )
        );

        return DecorationSet.create(state.doc, decorations);
      },

      handleDOMEvents: {
        mousemove: (view, event) => {
          // 获取鼠标位置对应的文档节点位置
          const pos = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          // 防御性检查，通常不会触发
          if (!pos) {
            return false;
          }

          /**
           * pos.pos 某个距离鼠标最接近的节点位置，在编辑器范围内空白区域也能找到附近的节点
           * pos.inside 鼠标所在位置的节点位置，一定在某个节点内部，没有时为 -1
           * 节点位置：每个节点（包括字符）在文档中都有一个唯一的位置索引
           *
           * 使用 inside 进行严格检查，避免在节点边界/空白处误判
           */
          const hoveredPos = pos.inside >= 0 ? pos.inside : pos.pos;

          let targetNode: ProseMirrorNode | null = null;
          let targetPos = 0;
          const allNodes: Array<{ node: ProseMirrorNode; pos: number }> = [];

          // descendants 访问文档树中的所有后代节点
          view.state.doc.descendants((node, nodePos, parent, index) => {
            console.log("遍历节点:", node, nodePos,parent,index);
            // 跳过文本节点
            if (node.isText) {
              return false;
            }

            // 检查是否在黑名单中
            if (excludeNodes.has(node.type.name)) {
              return true; // 继续遍历子节点
            }

            // 检查鼠标是否在节点范围内
            const isCurrent =
              hoveredPos >= nodePos && hoveredPos < nodePos + node.nodeSize;

            if (isCurrent) {
              // 收集所有匹配的节点
              allNodes.push({ node, pos: nodePos });
              // 最后一个就是最接近的可操作节点
              targetNode = node;
              targetPos = nodePos;
            }
          });

          // 如果没找到节点（鼠标在空白/边界处），尝试查找同一行的节点
          if (!targetNode && pos.inside === -1) {
            const mouseY = event.clientY;
            const mouseX = event.clientX;
            let candidateNode: ProseMirrorNode | null = null;
            let candidatePos = 0;
            let minDistance = Infinity;

            // 获取空白位置前后的最外层节点（doc 的直接子节点）
            let prevNode: ProseMirrorNode | null = null;
            let prevNodePos = 0;
            let nextNode: ProseMirrorNode | null = null;
            let nextNodePos = 0;

            view.state.doc.forEach((node, offset) => {
              const nodePos = offset;
              const nodeEnd = offset + node.nodeSize;

              if (nodeEnd <= pos.pos) {
                // 在当前位置之前的节点
                prevNode = node;
                prevNodePos = nodePos;
              } else if (nodePos >= pos.pos && !nextNode) {
                // 在当前位置之后的第一个节点
                nextNode = node;
                nextNodePos = nodePos;
              }
            });

            console.log("空白位置前后节点:", {
              prev: prevNode
                ? { type: prevNode.type.name, pos: prevNodePos }
                : null,
              next: nextNode
                ? { type: nextNode.type.name, pos: nextNodePos }
                : null,
              mousePos: pos.pos,
            });

            view.state.doc.descendants((node, nodePos) => {
              if (node.isText || excludeNodes.has(node.type.name)) {
                return;
              }

              // 获取节点的 DOM 坐标
              const coords = view.coordsAtPos(nodePos);
              const nodeDom = view.nodeDOM(nodePos) as HTMLElement;

              if (coords && nodeDom) {
                const nodeRect = nodeDom.getBoundingClientRect();

                // 获取 margin 值（包含在检测范围内）
                const computedStyle = window.getComputedStyle(nodeDom);
                const marginTop = parseFloat(computedStyle.marginTop) || 0;
                const marginBottom =
                  parseFloat(computedStyle.marginBottom) || 0;

                // 扩展检测范围：包含 margin
                const top = nodeRect.top - marginTop;
                const bottom = nodeRect.bottom + marginBottom;

                // 检查鼠标 Y 坐标是否在节点范围内（同一行，包含 margin）
                const inSameRow = mouseY >= top && mouseY <= bottom;

                if (inSameRow) {
                  // 计算鼠标到节点中心的总距离（优先考虑 Y 轴距离）
                  const centerY = (nodeRect.top + nodeRect.bottom) / 2;
                  const centerX = (nodeRect.left + nodeRect.right) / 2;

                  const distanceY = Math.abs(mouseY - centerY);
                  const distanceX = Math.abs(mouseX - centerX);

                  // 优先考虑 Y 轴距离，避免选到下一行
                  const distance = distanceY * 2 + distanceX;

                  // 选择距离最近的节点
                  if (distance < minDistance) {
                    minDistance = distance;
                    candidateNode = node;
                    candidatePos = nodePos;
                  }
                }
              }
            });

            // 如果找到同行的候选节点，使用它
            if (candidateNode) {
              targetNode = candidateNode;
              targetPos = candidatePos;

              // 重新收集父级节点
              allNodes.length = 0;
              view.state.doc.descendants((node, nodePos) => {
                if (node.isText || excludeNodes.has(node.type.name)) {
                  return;
                }

                const isCurrent =
                  candidatePos >= nodePos &&
                  candidatePos < nodePos + node.nodeSize;

                if (isCurrent) {
                  allNodes.push({ node, pos: nodePos });
                }
              });
            }
          }

          // 构建新状态
          const newState: HoverState | null = targetNode
            ? {
                node: targetNode,
                pos: targetPos,
                nodeSize: targetNode.nodeSize,
                allNodes,
                mouseCoords: { x: event.clientX, y: event.clientY },
              }
            : null;

          const oldState = nodeHoverPluginKey.getState(view.state);

          // 只在状态真正改变时更新
          const stateChanged =
            (!oldState && newState) ||
            (oldState && !newState) ||
            (oldState && newState && oldState.pos !== newState.pos);

          if (stateChanged) {
            const tr = view.state.tr.setMeta(nodeHoverPluginKey, newState);
            view.dispatch(tr);

            // 触发回调
            if (newState) {
              options.onHover?.(newState);
            } else {
              options.onLeave?.();
            }
          }

          return false;
        },

        mouseleave: (view) => {
          // 清理状态
          const oldState = nodeHoverPluginKey.getState(view.state);
          if (oldState) {
            const tr = view.state.tr.setMeta(nodeHoverPluginKey, null);
            view.dispatch(tr);
            options.onLeave?.();
          }
          return false;
        },
      },
    },
  });
}
