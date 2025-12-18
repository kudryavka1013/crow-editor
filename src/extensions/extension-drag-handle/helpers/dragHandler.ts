import type { Editor } from '@tiptap/core'
import { getSelectionRanges, NodeRangeSelection } from '@tiptap/extension-node-range'
import type { SelectionRange } from '@tiptap/pm/state'
import type { Node } from '@tiptap/pm/model'

import { cloneElement } from './cloneElement'
import { removeNode } from './removeNode'

/**
 * 改造后的 dragHandler，支持拖拽指定节点（不再强制最外层）
 * @param event DragEvent
 * @param editor Editor 实例
 * @param nodePos 要拖拽的节点位置（由 drag-handle-plugin 传入）
 * @param node 要拖拽的节点（由 drag-handle-plugin 传入）
 */
export function dragHandler(
  event: DragEvent, 
  editor: Editor,
  nodePos?: number,
  node?: Node | null
) {
  const { view } = editor

  if (!event.dataTransfer) {
    return
  }

  // 如果没有传入节点信息，则回退到选区拖拽
  if (nodePos === undefined || !node) {
    const { empty, $from, $to } = view.state.selection
    if (empty) return
    
    const selectionRanges = getSelectionRanges($from, $to, 0)
    if (!selectionRanges.length) return
    
    const from = selectionRanges[0].$from.pos
    const to = selectionRanges[selectionRanges.length - 1].$to.pos
    
    const selection = NodeRangeSelection.create(view.state.doc, from, to)
    const slice = selection.content()
    
    // 创建拖拽预览
    const wrapper = document.createElement('div')
    selectionRanges.forEach(range => {
      const element = view.nodeDOM(range.$from.pos) as HTMLElement
      if (element) {
        const clonedElement = cloneElement(element)
        wrapper.append(clonedElement)
      }
    })
    
    wrapper.style.position = 'absolute'
    wrapper.style.top = '-10000px'
    wrapper.style.background = 'white'
    wrapper.style.border = '1px solid #e2e8f0'
    wrapper.style.borderRadius = '4px'
    wrapper.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    wrapper.style.opacity = '1'
    document.body.append(wrapper)
    
    event.dataTransfer.clearData()
    event.dataTransfer.setDragImage(wrapper, 0, 0)
    
    view.dragging = { slice, move: true }
    
    const { tr } = view.state
    tr.setSelection(selection)
    view.dispatch(tr)
    
    document.addEventListener('drop', () => removeNode(wrapper), { once: true })
    return
  }

  // 使用传入的节点位置创建选区
  const from = nodePos
  const to = nodePos + node.nodeSize

  const $from = view.state.doc.resolve(from)
  const $to = view.state.doc.resolve(to)
  
  const ranges = getSelectionRanges($from, $to, 0)

  if (!ranges.length) {
    return
  }

  const { tr } = view.state
  const wrapper = document.createElement('div')

  const selection = NodeRangeSelection.create(view.state.doc, from, to)
  const slice = selection.content()

  // 创建拖拽预览（克隆 DOM 元素）
  ranges.forEach(range => {
    const element = view.nodeDOM(range.$from.pos) as HTMLElement
    if (element) {
      const clonedElement = cloneElement(element)
      wrapper.append(clonedElement)
    }
  })

  wrapper.style.position = 'absolute'
  wrapper.style.top = '-10000px'
  wrapper.style.background = 'white'
  wrapper.style.border = '1px solid #e2e8f0'
  wrapper.style.borderRadius = '4px'
  wrapper.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  wrapper.style.opacity = '1'
  
  document.body.append(wrapper)

  event.dataTransfer.clearData()
  event.dataTransfer.setDragImage(wrapper, 0, 0)

  // 告诉 ProseMirror 拖拽的内容
  view.dragging = { slice, move: true }

  tr.setSelection(selection)

  view.dispatch(tr)

  // 清理临时 DOM
  document.addEventListener('drop', () => removeNode(wrapper), { once: true })
}
