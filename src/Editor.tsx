import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import { forwardRef, useImperativeHandle } from "react";
import StarterKit from "@tiptap/starter-kit";
import Code from "@tiptap/extension-code";
import UniqueID from "@tiptap/extension-unique-id";
import { Focus } from "@tiptap/extensions";
import { NodeHover } from "./extensions/extension-node-hover/node-hover";
import { TableKit } from "@tiptap/extension-table";
import { FloatingDragger } from "./ui/floating-menu";

// import {
//   Toolbar,
//   ToolbarGroup,
//   ToolbarSeparator,
// } from "@/components/tiptap-ui-primitive/toolbar";
// import { Separator } from "@/components/tiptap-ui-primitive/separator";
// import { Button } from "./components/tiptap-ui-primitive/button";
// import { Spacer } from "./components/tiptap-ui-primitive/spacer";

import "./editor.scss";
import { DragHandle } from "./extensions/extension-drag-handle/drag-handle-react";

export interface CrowEditorRef {
  editor: ReturnType<typeof useEditor>;
}

const CrowEditor = forwardRef<CrowEditorRef>((props, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        code: false,
      }),
      // excludes some marks/nodes from being inside a code block
      Code.extend({
        excludes: "code",
        priority: 1001,
      }),
      TableKit.configure({
        table: {
          resizable: true,
        },
      }),
      UniqueID.configure({
        attributeName: "id",
        types: [
          "heading",
          "paragraph",
          "codeBlock",
          "blockquote",
          "bulletList",
          "orderedList",
          "listItem",
          "table",
          "tableRow",
          "tableCell",
          "tableHeader",
        ],
      }),
      Focus,
      NodeHover.configure({
        className: "is-hovered",
        mode: "all",
        onHover: (node, pos, allNodes) => {
          console.log("鼠标悬停在节点上:", {
            type: node?.type?.name || "未知",
            pos,
            node,
            allNodes: allNodes.map((n) => ({
              type: n.node.type.name,
              pos: n.pos,
            })),
          });
        },
        onLeave: () => {
          console.log("鼠标离开节点");
        },
      }),
    ],
    editorProps: {
      handleDOMEvents: {
        dragstart(view, event) {
          const target = event.target as HTMLElement;
          if (target.closest(".drag-handle")) {
            return false;
          }
          event.preventDefault();
          return true;
        },
        dragover(view, event) {
          event.preventDefault();
          event.dataTransfer!.dropEffect = "move";
          return false;
        },
        drop(view, event) {
          event.preventDefault();

          const dragDataStr = event.dataTransfer?.getData(
            "application/x-crow-node"
          );
          if (!dragDataStr) {
            return false;
          }

          try {
            const dragData = JSON.parse(dragDataStr);
            const { pos: sourcePos, nodeSize } = dragData;

            // 获取放置位置
            const dropPos = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            if (!dropPos) {
              return false;
            }

            const { tr, doc } = view.state;
            const sourceNode = doc.nodeAt(sourcePos);

            if (!sourceNode) {
              console.error("源节点不存在");
              return false;
            }

            // 计算目标位置（确保在有效范围内）
            let targetPos = dropPos.pos;

            // 如果拖到同一位置，不做处理
            if (targetPos >= sourcePos && targetPos <= sourcePos + nodeSize) {
              console.log("拖到同一位置，取消操作");
              return false;
            }

            // 先删除源节点
            tr.delete(sourcePos, sourcePos + nodeSize);

            // 如果目标位置在源节点后面，需要调整位置
            if (targetPos > sourcePos) {
              targetPos -= nodeSize;
            }

            // 在目标位置插入节点
            tr.insert(targetPos, sourceNode);

            view.dispatch(tr);

            console.log("节点移动成功", {
              from: sourcePos,
              to: targetPos,
              node: sourceNode.type.name,
            });

            return true;
          } catch (error) {
            console.error("拖拽失败:", error);
            return false;
          }
        },
      },
    },
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "欢迎使用 Crow Editor" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "这是一个基于 " },
            { type: "text", marks: [{ type: "bold" }], text: "Tiptap" },
            {
              type: "text",
              text: " 构建的富文本编辑器，支持多种交互功能和格式。",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "功能特性" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "支持 " },
                    { type: "text", marks: [{ type: "bold" }], text: "粗体" },
                    { type: "text", text: "、" },
                    { type: "text", marks: [{ type: "italic" }], text: "斜体" },
                    { type: "text", text: " 和 " },
                    {
                      type: "text",
                      marks: [{ type: "code" }],
                      text: "行内代码",
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "鼠标悬停节点高亮" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "多级标题和列表" }],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "嵌套列表示例" }],
        },
        {
          type: "orderedList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "初始化编辑器" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "配置扩展" }],
                },
                {
                  type: "orderedList",
                  content: [
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [
                            { type: "text", text: "StarterKit 基础功能" },
                          ],
                        },
                      ],
                    },
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "自定义扩展" }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "开始编辑" }],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "代码块示例" }],
        },
        {
          type: "codeBlock",
          content: [
            {
              type: "text",
              text: 'const editor = useEditor({\n  extensions: [StarterKit, Hover],\n  content: "初始内容"\n});',
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "混合格式" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "这段文字包含 " },
            { type: "text", marks: [{ type: "bold" }], text: "粗体" },
            { type: "text", text: "、" },
            { type: "text", marks: [{ type: "italic" }], text: "斜体" },
            { type: "text", text: "、" },
            {
              type: "text",
              marks: [{ type: "bold" }, { type: "italic" }],
              text: "粗斜体",
            },
            { type: "text", text: " 以及 " },
            { type: "text", marks: [{ type: "code" }], text: "代码" },
            { type: "text", text: "。" },
          ],
        },
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "这是一个引用块，可以用来突出显示重要内容。",
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "表格示例" }],
        },
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableHeader",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "text",
                          marks: [{ type: "bold" }],
                          text: "功能",
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "tableHeader",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "text",
                          marks: [{ type: "bold" }],
                          text: "描述",
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "tableHeader",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "text",
                          marks: [{ type: "bold" }],
                          text: "状态",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "富文本编辑" }],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "支持粗体、斜体等格式" }],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        { type: "text", marks: [{ type: "bold" }], text: "✓" },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "鼠标悬停高亮" }],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "实时追踪鼠标位置" }],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        { type: "text", marks: [{ type: "bold" }], text: "✓" },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "表格支持" }],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "创建和编辑表格" }],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        { type: "text", marks: [{ type: "bold" }], text: "✓" },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "祝你使用愉快！🎉" }],
        },
      ],
    },
    editorProps: {
      // attributes: {
      //   class: "crow-editor-content",
      // },

      // 禁用默认的拖拽行为，只允许通过拖拽手柄触发
      editable: () => true,
      handleDOMEvents: {
        dragstart: (view, event) => {
          // 阻止默认的文本拖拽
          event.preventDefault();
          return true;
        },
      },
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
        <FloatingDragger editor={editor} />
        <DragHandle editor={editor}>
          <div>test</div>
        </DragHandle>
        <EditorContent editor={editor} className="crow-editor" />
      </div>
    </EditorContext.Provider>
  );
});

CrowEditor.displayName = "CrowEditor";

export default CrowEditor;
