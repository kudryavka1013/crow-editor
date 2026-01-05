import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import { forwardRef, useImperativeHandle } from "react";
import StarterKit from "@tiptap/starter-kit";
import Code from "@tiptap/extension-code";
import UniqueID from "@tiptap/extension-unique-id";
import TextAlign from "@tiptap/extension-text-align";

import "./editor.scss";
import { CrowDocument } from "./extensions/core/document/schema.ts";
import { Selection } from "@tiptap/extensions";
import { WrapNodeWithDiv } from "./extensions/core/wrapNodeWithDiv.ts";

export interface CrowEditorRef {
  editor: ReturnType<typeof useEditor>;
}

const CrowEditor = forwardRef<CrowEditorRef>((props, ref) => {
  const editor = useEditor({
    extensions: [
      CrowDocument,
      UniqueID.configure({
        types: ["paragraph", "heading", "docTitle"],
      }),
      Selection,
      StarterKit.configure({
        code: false,
        document: false, // 禁用默认的 document
      }),

      WrapNodeWithDiv.configure({
        types: ["paragraph", "heading"],
      }),

      Code.extend({
        excludes: "code",
        priority: 1001,
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
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
              attrs: { textAlign: "center" },
              content: [{ type: "text", text: "居中的标题" }],
            },
          ],
        },
        {
          type: "pageBlockChildren",
          content: [
            {
              type: "heading",
              attrs: { level: 2, textAlign: "center" },
              content: [{ type: "text", text: "第一个标题（居中）" }],
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "第二个标题（左对齐）" }],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "center" },
              content: [{ type: "text", text: "居中的段落内容..." }],
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
