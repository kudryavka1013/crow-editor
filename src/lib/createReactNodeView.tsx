import { ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import type { ElementType, ReactElement } from "react";

/**
 * 获取节点的块类型标识
 */
function getBlockType(typeName: string, node: any): string {
  return typeName;
}

// https://github.com/ueberdosis/tiptap/blob/3a6492504e0c743da0628e602072c8494571125f/packages/react/src/ReactRenderer.tsx#L176

/**
 * 创建 React NodeView
 * NodeViewWrapper 作为最外层，添加 block 容器的 class 和属性
 *
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
        console.log("node", node);
        // const recordId = node.attrs["record-id"];

        // console.log("existingClass:", HTMLAttributes);
        // const combinedClass = `block doc-${typeName}-block`;

        return {
          "data-block-type": typeName,
          ...HTMLAttributes,
          // "data-record-id": record-id 也在 HTMLAttributes 里携带
          // class: combinedClass,
        };
      },
      className: `block tt-node-view`,
    },
  );
}
