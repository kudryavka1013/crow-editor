import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import { forwardRef, useImperativeHandle } from "react";
import StarterKit from "@tiptap/starter-kit";
import Code from "@tiptap/extension-code";
import TextAlign from "@tiptap/extension-text-align";
import { Selection } from "@tiptap/extensions";
import {
  TextStyle,
  Color,
  BackgroundColor,
} from "@tiptap/extension-text-style";
import { CrowDocument } from "./extensions/core";
import {
  CrowParagraph,
  CrowHeading,
  CrowBlockquote,
  CrowCodeBlock,
  // CodeSpan,
} from "./extensions/nodes";
import "./editor.scss";
// import css from 'highlight.js/lib/languages/css'
// import js from 'highlight.js/lib/languages/javascript'
// import ts from 'highlight.js/lib/languages/typescript'
// import html from 'highlight.js/lib/languages/xml'

// create a lowlight instance with all languages loaded
// const lowlight = createLowlight(all)

// This is only an example, all supported languages are already loaded above
// but you can also register only specific languages to reduce bundle-size
// lowlight.register('html', html)
// lowlight.register('css', css)
// lowlight.register('js', js)
// lowlight.register('ts', ts)

export interface CrowEditorRef {
  editor: ReturnType<typeof useEditor>;
}

const CrowEditor = forwardRef<CrowEditorRef>((props, ref) => {
  const editor = useEditor({
    extensions: [
      CrowDocument,

      Selection,
      StarterKit.configure({
        code: false,
        document: false, // 禁用默认的 document
        paragraph: false, // 禁用默认的 paragraph
        heading: false, // 禁用默认的 heading
        blockquote: false,
        codeBlock: false,
      }),

      CrowParagraph,
      CrowHeading,
      CrowBlockquote,
      // CodeSpan,
      CrowCodeBlock,

      Code.extend({
        excludes: "code",
        priority: 1001,
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      // Blockquote,
      TextStyle,
      Color,
      BackgroundColor,
    ],

    // 初始内容（固定结构）
    content: {
      type: "doc",
      content: [
        {
          type: "pageBlockHeader",
          content: [
            {
              type: "docTitle",
              content: [{ type: "text", text: "文档标题 - 测试折叠与虚拟化" }],
            },
          ],
        },
        {
          type: "pageBlockChildren",
          content: [
            {
              type: "heading",
              attrs: { level: 1, textAlign: "right" },
              content: [{ type: "text", text: "第一章 概述" }],
            },
            {
              type: "paragraph",
              content: [
                { type: "text", text: "这是第一章的介绍段落，属于一级标题。" },
              ],
            },
            {
              type: "codeBlock",
              attrs: { language: "plaintext" },
              content: [
                {
                  type: "text",
                  text: 'function hello() {\n  console.log("Hello World");\n}',
                  // marks: [{ type: "underline" }],
                },
              ],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "1.1 的第二段内容。" }],
            },
          ],
        },
      ],
    },

    editorProps: {
      // attributes: {
      //   class: "crow-editor-content",
      // },
    },
  });

  useImperativeHandle(ref, () => ({
    editor,
  }));

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className="crow-editor-wrapper">
        {/* Debug Toolbar */}
        <div
          style={{
            padding: "10px",
            borderBottom: "1px solid #ccc",
            background: "#f5f5f5",
          }}
        >
          <button
            onClick={() => {
              console.log("=== Editor Content ===");
              console.log("JSON:", editor?.getJSON());
              console.log("HTML:", editor?.getHTML());
              console.log("Text:", editor?.getText());
            }}
            style={{
              padding: "8px 16px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            输出编辑器内容
          </button>
        </div>

        {/* <Toolbar variant="floating">
          <ToolbarGroup>
            <Button data-style="ghost">
              <BoldIcon className="tiptap-button-icon" />
            </Button>
            <Button data-style="ghost">
              <ItalicIcon className="tiptap-button-icon" />
            </Button>
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <Button data-style="ghost">Format</Button>
          </ToolbarGroup>

          <Spacer />

          <ToolbarGroup>
            <Button data-style="primary">Save</Button>
          </ToolbarGroup>
        </Toolbar> */}
        <EditorContent editor={editor} className="crow-editor" />
      </div>
    </EditorContext.Provider>
  );
});

CrowEditor.displayName = "CrowEditor";

export default CrowEditor;
