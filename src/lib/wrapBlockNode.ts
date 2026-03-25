import type { DOMOutputSpec } from "@tiptap/pm/model";

/**
 * 获取节点的块类型标识
 */
function getBlockType(typeName: string, attrs?: Record<string, any>): string {
  if (typeName === "heading" && attrs?.level) {
    return `${typeName}${attrs.level}`;
  }
  return typeName;
}

/**
 * 包装块级节点，添加统一的外层容器
 * 
 * @param typeName - 节点类型名称
 * @param innerSpec - 内层节点的 DOMOutputSpec
 * @param attrs - 节点属性（用于获取 record-id 等）
 * @returns 包装后的 DOMOutputSpec
 * 
 * @example
 * ```typescript
 * renderHTML({ node, HTMLAttributes }) {
 *   return wrapBlockNode(
 *     "paragraph",
 *     ["div", HTMLAttributes, ["span", {}, 0]],
 *     node.attrs
 *   );
 * }
 * ```
 */
export function wrapBlockNode(
  typeName: string,
  innerSpec: DOMOutputSpec,
  attrs?: Record<string, any>
): DOMOutputSpec {
  const blockType = getBlockType(typeName, attrs);
  const recordId = attrs?.["record-id"];

  const wrapperAttrs: Record<string, string> = {
    class: `block doc-${blockType}-block`,
    "data-block-type": blockType,
  };

  if (recordId) {
    wrapperAttrs["data-record-id"] = recordId;
  }

  return ["div", wrapperAttrs, innerSpec];
}
