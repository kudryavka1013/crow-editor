import type { NodeViewProps } from "@tiptap/react";
import { NodeViewContent } from "@tiptap/react";
import { useMemo } from "react";

/**
 * CodeBlock React 组件
 */
export const CodeBlockNodeView = ({
  node,
  updateAttributes,
  editor,
}: NodeViewProps) => {
  const currentLanguage = node.attrs.language || "text";

  // 从 lowlight 实例动态获取已注册的语言列表
  const languages = useMemo(() => {
    const codeBlockExt = editor.extensionManager.extensions.find(
      (ext) => ext.name === "codeBlock",
    );

    const lowlight = codeBlockExt?.options?.lowlight;

    if (!lowlight) {
      return [{ value: "text", label: "Plain Text" }];
    }

    // 获取所有已注册的语言
    const registeredLanguages = lowlight.listLanguages();

    return [
      { value: "text", label: "Plain Text" },
      ...registeredLanguages.map((lang: string) => ({
        value: lang,
        label: lang.charAt(0).toUpperCase() + lang.slice(1),
      })),
    ];
  }, [editor]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateAttributes({ language: e.target.value });
  };

  return (
    <div className="crow-codeblock">
      <div className="codeblock-header" contentEditable={false}>
        <select
          value={currentLanguage}
          onChange={handleLanguageChange}
          className="language-selector"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
      <pre>
        <code className={`language-${currentLanguage}`}>
          <NodeViewContent />
        </code>
      </pre>
    </div>
  );
};
