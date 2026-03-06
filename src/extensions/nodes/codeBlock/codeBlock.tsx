import type { NodeViewProps } from "@tiptap/react";
import { NodeViewContent } from "@tiptap/react";
import { useEffect, useState } from "react";
import { CODEBLOCK_LANGUAGES, CODEBLOCK_LANGUAGES_SET } from "./languages";
import { ArrowDownSLine, ArrowRightSLine } from "@/components/icons";

/**
 * CodeBlock React 组件
 * - highlight.js 样式参考: https://highlightjs.org/examples
 * - demo: https://highlightjs.org/demo 目前使用 vs2015
 * - https://github.com/ueberdosis/tiptap/blob/main/packages/extension-code-block/src/code-block.ts
 * 
 */
export const CodeBlockNodeView = ({
  node,
  editor,
  updateAttributes,
}: NodeViewProps) => {
  const currentLanguage = node.attrs.language || "plaintext";
  const collapsed = node.attrs.collapsed || false;
  const [copied, setCopied] = useState(false);

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

  const handleCopy = async () => {
    const code = node.textContent;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const toggleCollapse = () => {
    updateAttributes({ collapsed: !collapsed });
  };

  console.log(editor)

  return (
    <div className="crow-codeblock">
      <div className="codeblock-header" contentEditable={false}>
        <button
          onClick={toggleCollapse}
          className="collapse-button"
          title={collapsed ? "展开" : "折叠"}
        >
            {collapsed ? <ArrowRightSLine className="arrow-icon" /> : <ArrowDownSLine className="arrow-icon" />}
        </button>
        <div className="header-right">
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
          <button
            onClick={handleCopy}
            className="copy-button"
            title={copied ? "已复制!" : "复制代码"}
          >
            {copied ? "✓" : "复制"}
          </button>
        </div>
      </div>
      {!collapsed && (
        <pre>
          <code className={`language-${node.attrs.language}`}>
            <NodeViewContent />
          </code>
        </pre>
      )}
    </div>
  );
};
