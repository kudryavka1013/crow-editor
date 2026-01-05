import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import { forwardRef, useImperativeHandle } from "react";
import StarterKit from "@tiptap/starter-kit";
import Code from "@tiptap/extension-code";
import UniqueID from "@tiptap/extension-unique-id";

import "./editor.scss";
import { CrowDocument } from "./extensions/core/document/schema.ts";
import { Selection } from "@tiptap/extensions";

export interface CrowEditorRef {
  editor: ReturnType<typeof useEditor>;
}

const CrowEditor = forwardRef<CrowEditorRef>((props, ref) => {
  const editor = useEditor({
    extensions: [
      // 自定义文档结构（包含 header、children、docTitle）
      CrowDocument,

      Selection,
      StarterKit.configure({
        code: false,
        document: false, // 禁用默认的 document
      }),

      Code.extend({
        excludes: "code",
        priority: 1001,
      }),

      UniqueID,
    ],

    // 初始内容（固定结构）
    content: {
      type: "doc",
      content: [
        {
          type: "pageBlockHeader",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "无标题文档" }],
            },
            // {
            //   type: "docTitle",
            //   content: [{ type: "text", text: "文档标题" }],
            // },
          ],
        },
        {
          type: "pageBlockChildren",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "第一个标题" }],
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "第二个标题" }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "开始输入内容..." }],
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
