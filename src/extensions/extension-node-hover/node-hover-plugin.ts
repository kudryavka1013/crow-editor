import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface NodeHoverPluginOptions {
  className: string;
  mode: "all" | "deepest" | "shallowest";
  onHover?: (node: any, pos: number) => void;
  onLeave?: () => void;
}

export function NodeHoverPlugin(options: NodeHoverPluginOptions): Plugin {
  let currentHoveredPos: number | null = null;
  let currentHoveredNode: any = null;
  let currentNodePos: number | null = null;

  return new Plugin({
    key: new PluginKey("nodeHover"),
    props: {
      decorations: ({ doc }) => {
        if (currentHoveredPos === null) {
          return DecorationSet.create(doc, []);
        }

        const decorations: any[] = [];
        let maxLevels = 0;

        if (options.mode === "deepest") {
          doc.nodesBetween(currentHoveredPos, currentHoveredPos, (node, pos) => {
            if (node.isText) {
              return;
            }

            const isHovered =
              currentHoveredPos !== null &&
              currentHoveredPos >= pos &&
              currentHoveredPos <= pos + node.nodeSize - 1;

            if (!isHovered) {
              return false;
            }

            maxLevels += 1;
          });
        }

        let currentLevel = 0;

        doc.nodesBetween(currentHoveredPos, currentHoveredPos, (node, pos) => {
          if (node.isText) {
            return false;
          }

          const isHovered =
            currentHoveredPos !== null &&
            currentHoveredPos >= pos &&
            currentHoveredPos <= pos + node.nodeSize - 1;

          if (!isHovered) {
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
          const pos = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (!pos) {
            if (currentHoveredPos !== null) {
              currentHoveredPos = null;
              currentHoveredNode = null;
              options.onLeave?.();
              view.updateState(view.state);
            }
            return false;
          }

          const hoveredPos = pos.pos;

          if (hoveredPos !== currentHoveredPos) {
            currentHoveredPos = hoveredPos;

            let targetNode = null;
            let targetPos = 0;

            view.state.doc.nodesBetween(hoveredPos, hoveredPos, (node, nodePos) => {
              if (node.isText) {
                return false;
              }

              const isHovered =
                hoveredPos >= nodePos &&
                hoveredPos <= nodePos + node.nodeSize - 1;

              if (isHovered) {
                targetNode = node;
                targetPos = nodePos;
              }
            });

            if (targetNode !== currentHoveredNode) {
              currentHoveredNode = targetNode;
              currentNodePos = targetPos;
              options.onHover?.(targetNode, targetPos);
            }

            view.updateState(view.state);
          }

          return false;
        },

        mouseleave: (view) => {
          if (currentHoveredPos !== null) {
            currentHoveredPos = null;
            currentHoveredNode = null;
            currentNodePos = null;
            options.onLeave?.();
            view.updateState(view.state);
          }
          return false;
        },
      },
    },
  });
}
