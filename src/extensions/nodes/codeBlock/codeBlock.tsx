import type { NodeViewProps } from "@tiptap/react";
import { NodeViewContent } from "@tiptap/react";
import { useEffect } from "react";
import { LANGUAGES, LANGUAGES_SET } from "./languages";

/**
 * CodeBlock React 组件
 */
export const CodeBlockNodeView = ({
  node,
  updateAttributes,
}: NodeViewProps) => {
  const currentLanguage = node.attrs.language || "plaintext";

  // 检查语言是否合法，不合法则重置为 plaintext
  useEffect(() => {
    if (!LANGUAGES_SET.has(currentLanguage)) {
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
          {LANGUAGES.map((lang) => (
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
