import type { NodeViewProps } from "@tiptap/react";
import { NodeViewContent } from "@tiptap/react";

/**
 * CodeBlock React 组件
 */
export const CodeBlockNodeView = ({ node }: NodeViewProps) => {
  return (
    <div className="crow-codeblock">
      <div>test</div>
      <pre>
        <code className={`language-${node.attrs.language || "text"}`}>
          <NodeViewContent />
        </code>
      </pre>
    </div>
  );
};
