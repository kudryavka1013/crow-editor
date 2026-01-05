import { Document } from "@tiptap/extension-document";
import { PageBlockHeader, PageBlockChildren } from "../nodes";
import { baseStructure } from "./baseStructure";

/**
 * 文档结构
 * 固定结构：两个 LogicBlock [pageBlockHeader, pageBlockChildren]
 * 不可删除、不可增加、顺序固定
 */
export const CrowDocument = Document.extend({
  name: "doc",

  content: "pageBlockHeader pageBlockChildren",

  addExtensions() {
    return [PageBlockHeader, PageBlockChildren];
  },

  onBeforeCreate: ({ editor }) => {
    console.log("CrowDocument onBeforeCreate");
    // 在创建前修正内容结构
    try {
      const originalContent = editor.options.content;

      // 只处理 JSONContent 对象类型
      if (
        typeof originalContent === "string" ||
        Array.isArray(originalContent)
      ) {
        return;
      }

      // 深拷贝避免修改原对象
      const fixedContent = JSON.parse(JSON.stringify(originalContent));

      if (fixedContent?.content && Array.isArray(fixedContent.content)) {
        // 找到 pageBlockHeader
        const headerBlock = fixedContent.content.find(
          (b: { type: string }) => b.type === "pageBlockHeader"
        );

        if (headerBlock?.content?.[0]) {
          const firstChild = headerBlock.content[0];

          // 如果不是 docTitle，转换它
          if (firstChild.type !== "docTitle") {
            headerBlock.content = [
              {
                type: "docTitle",
                // 保留原内容
                content: firstChild.content || [
                  { type: "text", text: "无标题文档" },
                ],
              },
            ];

            // 更新 options.content
            editor.options.content = fixedContent;
            console.warn("已在创建前修正文档结构");
          }
        }
      }
    } catch (e) {
      console.error("修正文档时出错:", e);
    }
  },

  addProseMirrorPlugins() {
    return [
      baseStructure(),
      // 未来可以添加其他 plugins
    ];
  },
});
