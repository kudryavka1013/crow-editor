import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Node } from "@tiptap/pm/model";
import { DOMSerializer } from "@tiptap/pm/model";
import { BaseNodeType } from "../constants";
import UniqueID from "@tiptap/extension-unique-id";

/**
 * 递归过滤 DOMOutputSpec 中的指定属性（处理嵌套结构）
 */
function filterAttributes(spec: any, removeKeys: string[]): any {
  if (!Array.isArray(spec)) {
    return spec;
  }

  const [tagName, ...rest] = spec;
  const result: any[] = [tagName];

  for (const item of rest) {
    // 如果是属性对象，过滤掉指定的 key
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const filtered = { ...item };
      removeKeys.forEach((key) => delete filtered[key]);
      result.push(filtered);
    }
    // 如果是嵌套的 spec 数组，递归处理
    else if (Array.isArray(item)) {
      result.push(filterAttributes(item, removeKeys));
    }
    // 其他情况（数字、字符串等）直接保留
    else {
      result.push(item);
    }
  }

  return result;
}

/**
 * 过滤第一层的 UniqueID 相关属性（性能优化版本）
 * UniqueID 扩展只会在第一层添加属性，无需递归
 */
function filterUniqueIdAttributes(spec: any, attrName: string): any {
  if (!Array.isArray(spec) || spec.length < 2) {
    return spec;
  }

  const [tagName, second, ...rest] = spec;
  const dataAttrName = `data-${attrName}`;

  // 只处理第一层的属性对象
  if (second && typeof second === "object" && !Array.isArray(second)) {
    const filtered = { ...second };
    delete filtered[attrName];
    delete filtered[dataAttrName];
    return [tagName, filtered, ...rest];
  }

  return spec;
}

/**
 * 获取节点的块类型标识（用于 class 和 data-block-type）
 */
function getBlockType(typeName: string, node: Node): string {
  if (typeName === "heading") {
    return `${typeName}${node.attrs.level || 1}`;
  }
  return typeName;
}

/**
 * 节点容器扩展
 * 自动为所有块级节点（除了文档容器节点）添加外层 div 包装
 */
export const NodeContainer = Extension.create({
  name: "nodeContainer",

  addExtensions() {
    return [
      UniqueID.configure({
        attributeName: "record-id",
        types: [
          "docTitle",
          "paragraph",
          "heading",
          "blockquote",
          "codeBlock",
        ],
      }),
    ];
  },

/*   addProseMirrorPlugins() {
    const { editor } = this;

    return [
      new Plugin({
        key: new PluginKey("nodeContainer"),
        props: {
          nodeViews: (() => {
            const schema = editor.schema;
            const nodeViews: Record<string, any> = {};
            console.log(schema)

            // 从 UniqueID 扩展读取 attributeName 配置
            const uniqueIdExt = editor.extensionManager.extensions.find(
              (ext) => ext.name === "uniqueID"
            );
            const uniqueIdAttr =
              uniqueIdExt?.options?.attributeName || "record-id";
            const dataAttr = `data-${uniqueIdAttr}`;

            Object.keys(schema.nodes).forEach((typeName) => {
              const nodeType = schema.nodes[typeName];
              console.log('nodeType', nodeType)

              // 只处理块级节点，排除文档和容器节点
              const isContainer = nodeType.spec.group?.includes("logicBlock");
              if (!nodeType.isBlock || isContainer) {
                return;
              }

              nodeViews[typeName] = (node: Node, view: any) => {
                // 创建外层 wrapper
                const wrapper = document.createElement("div");
                const blockType = getBlockType(typeName, node);
                console.log(typeName)

                wrapper.className = `block doc-${blockType}-block`;
                wrapper.setAttribute("data-block-type", blockType);

                // 挂载唯一 ID（使用动态读取的属性名）
                if (node.attrs[uniqueIdAttr]) {
                  wrapper.setAttribute(dataAttr, node.attrs[uniqueIdAttr]);
                }
                // console.log(wrapper)

                // 获取节点的原始渲染规则
                const rendered =
                  view.state.schema.nodes[typeName].spec.toDOM?.(node);
                  console.log('rendered', rendered);

                if (!rendered || !Array.isArray(rendered)) {
                  const contentDOM = document.createElement("div");
                  wrapper.appendChild(contentDOM);
                  return { dom: wrapper, contentDOM };
                }

                // 过滤掉已经挂在 wrapper 上的 UniqueID 属性，避免重复
                const filteredSpec = filterUniqueIdAttributes(
                  rendered,
                  uniqueIdAttr
                );

                // 渲染内层 DOM
                const { dom: innerDOM, contentDOM } = DOMSerializer.renderSpec(
                  document,
                  filteredSpec
                );

                wrapper.appendChild(innerDOM);

                return {
                  dom: wrapper,
                  contentDOM: contentDOM || innerDOM,
                };
              };
            });

            console.log('nodeViews', nodeViews);

            return nodeViews;
          })(),
        },
      }),
    ];
  }, */
});
