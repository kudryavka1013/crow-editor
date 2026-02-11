import type { NodeViewProps } from "@tiptap/react";
import { NodeViewContent } from "@tiptap/react";
import { useEffect } from "react";
import { CODEBLOCK_LANGUAGES, CODEBLOCK_LANGUAGES_SET } from "./languages";

/**
 * CodeBlock React 组件
 * - highlight.js 样式参考: https://highlightjs.org/examples
 * - demo: https://highlightjs.org/demo 目前使用 vs2015
 */
export const CodeBlockNodeView = ({
  node,
  updateAttributes,
}: NodeViewProps) => {
  const currentLanguage = node.attrs.language || "plaintext";

  // 检查语言是否合法，不合法则重置为 plaintext
  useEffect(() => {
    if (!CODEBLOCK_LANGUAGES_SET.has(currentLanguage)) {
      console.warn("invalid language", currentLanguage);
      updateAttributes({ language: "plaintext" });
    }
  }, [currentLanguage, updateAttributes]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateAttributes({ language: e.target.value });
  };

  return (
    <div className="crow-codeblock">
      <div className="codeblock-header" contentEditable={false}>
        <select
          value={node.attrs.language}
          onChange={handleLanguageChange}
          className="language-selector"
        >
          {CODEBLOCK_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
      <pre>
        <code className={`language-${node.attrs.language}`}>
          <NodeViewContent />
        </code>
      </pre>
    </div>
  );
};
