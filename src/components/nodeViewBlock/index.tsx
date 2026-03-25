import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";

export default () => {
  return (
    <NodeViewWrapper className="react-component">
      <NodeViewContent className="content is-editable" />
    </NodeViewWrapper>
  );
};
