import { ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import type { ReactElement } from "react";

/**
 * 创建 React NodeView
 * 自动包裹 NodeViewWrapper 并封装 ReactNodeViewRenderer
 *
 * @param renderContent - 渲染函数，接收 NodeViewProps，返回 JSX
 * @param className - 容器类名（可选）
 * @returns ReactNodeViewRenderer 的结果
 *
 * @example
 * ```tsx
 * export const CrowCodeBlock = CodeBlock.extend({
 *   addNodeView() {
 *     return createReactNodeView(
 *       ({ node }) => (
 *         <pre>
 *           <NodeViewContent as="code" />
 *         </pre>
 *       ),
 *       "crow-code-block"
 *     );
 *   },
 * });
 * ```
 */
export function createReactNodeView(
  renderContent: (props: NodeViewProps) => ReactElement,
  className?: string
) {
  return ReactNodeViewRenderer(
    (props: NodeViewProps) => (
      <NodeViewWrapper className={className}>
        {renderContent(props)}
      </NodeViewWrapper>
    ),
    { as: "nodeview" }
  );
}
