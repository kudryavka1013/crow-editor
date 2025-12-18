import { Editor } from "@tiptap/core";
import { posToDOMRect } from "@tiptap/core";
import "./style.scss";
import { useEffect, useRef } from "react";

interface FloatingDraggerProps {
  editor: Editor | null;
}

export function FloatingDragger({ editor }: FloatingDraggerProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const lastHoverStateRef = useRef<any>(null);
  const isMouseOverHandleRef = useRef(false);

  useEffect(() => {
    if (!editor || !elementRef.current) {
      return;
    }

    const element = elementRef.current;

    // 监听 storage 变化
    const handleUpdate = () => {
      const hoverState = (editor.storage as any).nodeHover;
      
      // 如果鼠标在手柄上，保持上一次的状态
      if (isMouseOverHandleRef.current && lastHoverStateRef.current) {
        return;
      }

      // 更新最后的悬停状态
      if (hoverState?.hoveredNode && hoverState?.hoveredPos !== null) {
        lastHoverStateRef.current = hoverState;
      }
      
      // 使用当前状态或最后保存的状态
      const stateToUse = isMouseOverHandleRef.current 
        ? lastHoverStateRef.current 
        : hoverState;

      if (!stateToUse || !stateToUse.hoveredNode || stateToUse.hoveredPos === null) {
        element.style.visibility = 'hidden';
        return;
      }

      // 显示元素
      element.style.visibility = 'visible';

      // 计算位置
      const nodeSize = stateToUse.hoveredNode.nodeSize || 0;
      const domRect = posToDOMRect(
        editor.view,
        stateToUse.hoveredPos,
        stateToUse.hoveredPos + nodeSize
      );

      // 设置位置（左侧偏移 32px）
      element.style.top = `${domRect.top}px`;
      element.style.left = `${domRect.left - 32}px`;
      
      console.log('FloatingDragger position:', { 
        top: domRect.top, 
        left: domRect.left,
        node: stateToUse.hoveredNode.type.name 
      });
    };

    // 初始隐藏
    element.style.visibility = 'hidden';
    element.style.position = 'absolute';
    element.style.zIndex = '100';

    // 鼠标进入手柄区域
    const handleMouseEnter = () => {
      isMouseOverHandleRef.current = true;
      console.log('Mouse entered handle');
    };

    // 鼠标离开手柄区域
    const handleMouseLeave = () => {
      isMouseOverHandleRef.current = false;
      lastHoverStateRef.current = null; // 清除保存的状态
      console.log('Mouse left handle');
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // 监听编辑器更新
    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);
    
    // 使用 requestAnimationFrame 持续检查状态变化
    let rafId: number;
    const checkUpdate = () => {
      handleUpdate();
      rafId = requestAnimationFrame(checkUpdate);
    };
    rafId = requestAnimationFrame(checkUpdate);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, [editor]);

  return (
    <div
      ref={elementRef}
      className="floating-dragger"
    >
      <button
        className="drag-handle"
        draggable
        onDragStart={(e) => {
          const hoverState = lastHoverStateRef.current || (editor?.storage as any)?.nodeHover;
          if (!hoverState || !hoverState.hoveredNode || hoverState.hoveredPos === null) {
            e.preventDefault();
            return;
          }

          // 存储拖拽的节点信息
          const dragData = {
            pos: hoverState.hoveredPos,
            nodeSize: hoverState.hoveredNode.nodeSize,
            nodeType: hoverState.hoveredNode.type.name,
          };
          
          e.dataTransfer.setData('application/x-crow-node', JSON.stringify(dragData));
          e.dataTransfer.effectAllowed = 'move';
          
          console.log("开始拖拽", dragData);
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM4 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM4 10a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
        </svg>
      </button>
    </div>
  );
}
