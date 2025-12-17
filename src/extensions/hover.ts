import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

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
}

export const Hover = Extension.create<HoverOptions>({
  name: "hover",

  addOptions() {
    return {
      className: "is-hovered",
      mode: "deepest",
      onHover: undefined,
      onLeave: undefined,
    };
  },

  addProseMirrorPlugins() {
    // 保存当前鼠标悬停的位置（文档中的数字位置）
    let currentHoveredPos: number | null = null;
    // 保存当前悬停的节点对象，用于判断节点是否发生变化
    let currentHoveredNode: any = null;

    return [
      new Plugin({
        key: new PluginKey("hover"),
        props: {
          /**
           * decorations 函数用于给文档节点添加视觉装饰（比如高亮样式）
           * 它会在编辑器状态更新时被调用，返回需要应用的装饰集合
           */
          decorations: ({ doc }) => {
            // 如果没有悬停位置，返回空的装饰集
            if (currentHoveredPos === null) {
              return DecorationSet.create(doc, []);
            }

            const decorations: any[] = [];
            let maxLevels = 0; // 记录最大嵌套层级

            // 【第一步】如果是 deepest 模式，需要先遍历一遍文档，计算最大深度
            // 这样才能知道哪个节点是"最深层"的
            if (this.options.mode === "deepest") {
              doc.nodesBetween(currentHoveredPos, currentHoveredPos, (node, pos) => {
                // 跳过文本节点，只处理块级节点（段落、标题等）
                if (node.isText) {
                  return;
                }
                
                // 判断当前鼠标位置是否在这个节点范围内
                // pos 是节点开始位置，pos + node.nodeSize - 1 是节点结束位置
                const isHovered =
                  currentHoveredPos !== null &&
                  currentHoveredPos >= pos &&
                  currentHoveredPos <= pos + node.nodeSize - 1;

                // 如果不在范围内，停止向下遍历
                if (!isHovered) {
                  return false;
                }

                // 在范围内，层级 +1
                maxLevels += 1;
              });
            }

            let currentLevel = 0; // 当前遍历到的层级

            // 【第二步】再次遍历文档，确定哪些节点需要添加装饰（高亮样式）
            doc.nodesBetween(currentHoveredPos, currentHoveredPos, (node, pos) => {
              // 跳过文本节点
              if (node.isText) {
                return false;
              }

              // 判断鼠标是否在这个节点范围内
              const isHovered =
                currentHoveredPos !== null &&
                currentHoveredPos >= pos &&
                currentHoveredPos <= pos + node.nodeSize - 1;

              // 如果不在范围内，停止向下遍历
              if (!isHovered) {
                return false;
              }

              currentLevel += 1; // 层级 +1

              // 【核心逻辑】判断当前节点是否应该被高亮
              // - deepest 模式：只有最深层的节点才高亮（maxLevels - currentLevel === 0）
              // - shallowest 模式：只有最浅层的节点才高亮（currentLevel === 1）
              // - all 模式：所有层级都高亮（outOfScope 永远为 false）
              const outOfScope =
                (this.options.mode === "deepest" && maxLevels - currentLevel > 0) ||
                (this.options.mode === "shallowest" && currentLevel > 1);

              if (outOfScope) {
                // 如果超出范围，deepest 模式继续向下找更深的节点，其他模式停止
                return this.options.mode === "deepest";
              }

              // 给符合条件的节点添加装饰（CSS 类名）
              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: this.options.className,
                })
              );
            });

            // 返回装饰集合，编辑器会自动将样式应用到对应的 DOM 节点上
            return DecorationSet.create(doc, decorations);
          },

          /**
           * handleDOMEvents 处理原生 DOM 事件
           */
          handleDOMEvents: {
            /**
             * 鼠标移动事件处理
             */
            mousemove: (view, event) => {
              // 根据鼠标的屏幕坐标，获取对应的文档位置
              const pos = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              if (!pos) {
                // 如果获取不到位置（鼠标移出编辑器区域）
                if (currentHoveredPos !== null) {
                  // 清空状态
                  currentHoveredPos = null;
                  currentHoveredNode = null;
                  this.options.onLeave?.(); // 触发离开回调
                  view.updateState(view.state); // 更新视图，移除高亮
                }
                return false;
              }

              const hoveredPos = pos.pos; // 获取文档中的数字位置
              
              // 只有当位置发生变化时才处理
              if (hoveredPos !== currentHoveredPos) {
                currentHoveredPos = hoveredPos;
                
                // 【寻找悬停的节点】
                // $pos 是 ProseMirror 的位置解析对象，包含了位置的上下文信息
                const $pos = view.state.doc.resolve(hoveredPos);
                let targetNode = null; // 目标节点
                let targetPos = 0; // 目标节点的位置
                let maxDepth = 0; // 最大深度（用于调试）

                // 遍历文档，找到包含当前位置的所有节点
                view.state.doc.nodesBetween(hoveredPos, hoveredPos, (node, nodePos) => {
                  if (node.isText) {
                    return false;
                  }

                  // 判断当前位置是否在节点范围内
                  const isHovered =
                    hoveredPos >= nodePos &&
                    hoveredPos <= nodePos + node.nodeSize - 1;

                  if (isHovered) {
                    maxDepth += 1;
                    // 不断更新 targetNode，最后保存的就是最深层的节点
                    targetNode = node;
                    targetPos = nodePos;
                  }
                });

                // 如果节点发生变化，触发悬停回调
                if (targetNode !== currentHoveredNode) {
                  currentHoveredNode = targetNode;
                  this.options.onHover?.(targetNode, targetPos);
                }

                // 更新视图，应用新的装饰（高亮效果）
                view.updateState(view.state);
              }

              return false; // 返回 false 表示不阻止事件传播
            },

            /**
             * 鼠标离开编辑器区域时的处理
             */
            mouseleave: (view) => {
              if (currentHoveredPos !== null) {
                // 清空所有状态
                currentHoveredPos = null;
                currentHoveredNode = null;
                this.options.onLeave?.(); // 触发离开回调
                view.updateState(view.state); // 更新视图，移除高亮
              }
              return false;
            },
          },
        },
      }),
    ];
  },
});
