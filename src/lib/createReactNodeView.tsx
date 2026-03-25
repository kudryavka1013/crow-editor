import { ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import type { ReactElement } from "react";
import classnames from "classnames";


/**
 * 创建 React NodeView
 * NodeViewWrapper 作为最外层，添加 block 容器的 class 和属性
 * - https://github.com/ueberdosis/tiptap/blob/3a6492504e0c743da0628e602072c8494571125f/packages/react/src/ReactRenderer.tsx
 * @param renderContent - 渲染函数，接收 NodeViewProps，返回 JSX
 * @param className - 内容区域类名（可选）
 * @returns ReactNodeViewRenderer 的结果
 */
export function createReactNodeView(
  renderContent: (props: NodeViewProps) => ReactElement,
  className?: string,
) {
  return ReactNodeViewRenderer(
    (props: NodeViewProps) => {
      return <NodeViewWrapper>{renderContent(props)}</NodeViewWrapper>;
    },
    {
      as: "div",
      attrs: ({ node, HTMLAttributes }) => {
        const typeName = node.type.name;
        // const recordId = node.attrs["record-id"];

        return {
          "data-block-type": typeName,
          ...HTMLAttributes,
          // "data-record-id": record-id 已经在 HTMLAttributes 里携带
        };
      },
      className: classnames("tt-node-view", "block", className),
    },
  );
}
