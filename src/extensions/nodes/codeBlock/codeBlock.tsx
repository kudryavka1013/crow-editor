import type { NodeViewProps } from "@tiptap/react";
import { NodeViewContent } from "@tiptap/react";
import { useEffect, useState } from "react";
import { Select } from "@/components/UI/Select";
import { CODEBLOCK_LANGUAGES, CODEBLOCK_LANGUAGES_SET } from "./languages";
import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiCheckLine,
  RiFileCopyLine,
} from "@remixicon/react";
import { Button } from "@/components/UI/Button";

/**
 * CodeBlock React 组件
 * - highlight.js 样式参考: https://highlightjs.org/examples
 * - demo: https://highlightjs.org/demo 目前使用 vs2015
 * - https://github.com/ueberdosis/tiptap/blob/main/packages/extension-code-block/src/code-block.ts
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

  console.log(editor);

  return (
    <div className="crow-codeblock">
      <div className="codeblock-header" contentEditable={false}>
        <Button
          onClick={toggleCollapse}
          // className="collapse-button"
          title={collapsed ? "展开" : "折叠"}
        >
          {collapsed ? (
            <RiArrowRightSLine size={16} />
          ) : (
            <RiArrowDownSLine size={16} />
          )}
        </Button>
        <div className="header-right">
          <Select
            value={node.attrs.language}
            onChange={(e) => updateAttributes({ language: (e.target as HTMLSelectElement).value })}
          >
            {CODEBLOCK_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </Select>
          <Button
            onClick={handleCopy}
            className="copy-button"
            title={copied ? "已复制!" : "复制代码"}
          >
            {copied ? <RiCheckLine size={16} /> : <RiFileCopyLine size={16} />}
          </Button>
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
