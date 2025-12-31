import { Extension } from '@tiptap/core'

export interface BlockWrapperOptions {
  /** 需要包装的节点类型 */
  types: string[]
}

export const BlockWrapper = Extension.create<BlockWrapperOptions>({
  name: 'blockWrapper',

  addOptions() {
    return {
      types: [
        'paragraph',
        'heading',
        'bulletList',
        'orderedList',
        'codeBlock',
        'blockquote',
      ],
    }
  },

  onBeforeCreate() {
    const { editor } = this

    // 为每个指定的节点类型添加 NodeView
    this.options.types.forEach((typeName) => {
      const extension = editor.extensionManager.extensions.find(
        (ext) => ext.name === typeName
      )

      if (!extension) return

      // 保存原有的 addNodeView
      const originalAddNodeView = extension.options.addNodeView

      // 重写 addNodeView
      extension.options.addNodeView = () => {
        return ({ node, getPos, editor, HTMLAttributes }) => {
          // 检查是否是最外层节点
          const isTopLevel = () => {
            if (typeof getPos !== 'function') return false
            const pos = getPos()
            const $pos = editor.state.doc.resolve(pos)
            return $pos.depth === 1 // depth=1 表示 doc 的直接子节点
          }

          // 如果有原 NodeView 且不是最外层，使用原 NodeView
          if (originalAddNodeView && !isTopLevel()) {
            return originalAddNodeView()
          }

          // 不是最外层且没有原 NodeView，使用默认渲染
          if (!isTopLevel()) {
            return {}
          }

          // 创建包装 div
          const wrapper = document.createElement('div')
          wrapper.className = `block-wrapper block-${node.type.name}`
          wrapper.setAttribute('data-node-type', node.type.name)

          // 如果有 id 属性，添加到 wrapper
          if (node.attrs.id) {
            wrapper.setAttribute('data-node-id', node.attrs.id)
          }

          // 创建内容容器（保持原节点的 HTML 标签）
          const contentElement = this.getContentElement(node, HTMLAttributes)
          wrapper.appendChild(contentElement)

          return {
            dom: wrapper,
            contentDOM: contentElement,
          }
        }
      }
    })
  },

  // 辅助方法：根据节点类型创建对应的 HTML 元素
  getContentElement(node: any, HTMLAttributes: Record<string, any>) {
    let tagName = 'div'

    // 根据节点类型确定标签
    switch (node.type.name) {
      case 'paragraph':
        tagName = 'p'
        break
      case 'heading':
        tagName = `h${node.attrs.level || 1}`
        break
      case 'codeBlock':
        tagName = 'pre'
        break
      case 'blockquote':
        tagName = 'blockquote'
        break
      case 'bulletList':
        tagName = 'ul'
        break
      case 'orderedList':
        tagName = 'ol'
        break
      default:
        tagName = 'div'
    }

    const element = document.createElement(tagName)

    // 应用原有属性
    Object.keys(HTMLAttributes).forEach((key) => {
      element.setAttribute(key, HTMLAttributes[key])
    })

    return element
  },
})
