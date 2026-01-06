import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import { forwardRef, useImperativeHandle } from "react";
import StarterKit from "@tiptap/starter-kit";
import Code from "@tiptap/extension-code";
import TextAlign from "@tiptap/extension-text-align";

import "./editor.scss";
import { CrowDocument } from "./extensions/core/document/schema.ts";
import { Selection } from "@tiptap/extensions";
import { CrowParagraph } from "./extensions/paragraph/index.ts";
import {
  TextStyle,
  Color,
  BackgroundColor,
} from "@tiptap/extension-text-style";
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
      }),

      CrowParagraph,

      Code.extend({
        excludes: "code",
        priority: 1001,
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
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
              attrs: { level: 1 },
              content: [{ type: "text", text: "第一章 概述" }],
            },
            {
              type: "paragraph",
              content: [
                { type: "text", text: "这是第一章的介绍段落，属于一级标题。" },
              ],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "center" },
              content: [
                { type: "text", text: "第一章的第二段内容（居中显示）。" },
              ],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "right" },
              content: [{ type: "text", text: "右对齐的段落。" }],
            },

            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "1.1 子章节" }],
            },
            {
              type: "paragraph",
              content: [
                { type: "text", text: "这是 1.1 子章节的内容，包含 " },
                {
                  type: "text",
                  marks: [{ type: "code" }],
                  text: "inline code",
                },
                { type: "text", text: " 和 " },
                { type: "text", marks: [{ type: "strike" }], text: "删除线" },
                { type: "text", text: " 示例。" },
              ],
            },
            {
              type: "codeBlock",
              attrs: { language: "javascript" },
              content: [
                {
                  type: "text",
                  text: 'function hello() {\n  console.log("Hello World");\n}',
                },
              ],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "1.1 的第二段内容。" }],
            },

            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "1.1.1 更小的标题" }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "三级标题下的段落。" }],
            },

            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "1.2 另一个子章节" }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "1.2 包含列表示例：" }],
            },
            {
              type: "bulletList",
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "无序列表项 1" }],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "无序列表项 2" }],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "无序列表项 3" }],
                    },
                  ],
                },
              ],
            },
            {
              type: "orderedList",
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "有序列表项 1" }],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "有序列表项 2" }],
                    },
                  ],
                },
              ],
            },

            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "第二章 详细说明" }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "第二章的介绍内容。" }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "第二章的第二段。" }],
            },

            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "2.1 技术细节" }],
            },
            {
              type: "blockquote",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "这是一段引用文本，用于展示重要的说明或引用。",
                    },
                  ],
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                { type: "text", text: "技术细节包含 " },
                { type: "text", marks: [{ type: "bold" }], text: "加粗文本" },
                { type: "text", text: " 和 " },
                { type: "text", marks: [{ type: "italic" }], text: "斜体文本" },
                { type: "text", text: " 以及 " },
                {
                  type: "text",
                  marks: [{ type: "bold" }, { type: "italic" }],
                  text: "加粗斜体",
                },
                { type: "text", text: "。" },
              ],
            },
            {
              type: "paragraph",
              content: [
                { type: "text", text: "带颜色的文本：" },
                {
                  type: "text",
                  marks: [{ type: "textStyle", attrs: { color: "#ff0000" } }],
                  text: "红色文字",
                },
                { type: "text", text: "、" },
                {
                  type: "text",
                  marks: [{ type: "textStyle", attrs: { color: "#0066cc" } }],
                  text: "蓝色文字",
                },
                { type: "text", text: " 和 " },
                {
                  type: "text",
                  marks: [
                    {
                      type: "textStyle",
                      attrs: { color: "#ffffff", backgroundColor: "#ff6600" },
                    },
                  ],
                  text: "橙色背景白字",
                },
                { type: "text", text: "。" },
              ],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "center" },
              content: [{ type: "text", text: "这是一段居中的段落。" }],
            },

            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "第三章 总结" }],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "justify" },
              content: [
                {
                  type: "text",
                  text: "总结部分的内容（两端对齐）。本章将对前面的内容进行总结和归纳。",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                { type: "text", text: "最后一段包含 " },
                {
                  type: "text",
                  marks: [
                    { type: "link", attrs: { href: "https://example.com" } },
                  ],
                  text: "链接文本",
                },
                { type: "text", text: " 和 " },
                {
                  type: "text",
                  marks: [{ type: "underline" }],
                  text: "下划线文本",
                },
                { type: "text", text: "。" },
              ],
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
