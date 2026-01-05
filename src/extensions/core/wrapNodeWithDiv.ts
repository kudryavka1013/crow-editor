import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

/**
 * 通用节点包裹扩展
 * 通过 NodeView 为指定节点添加外层 div
 */
export const WrapNodeWithDiv = Extension.create({
  name: "wrapNodeWithDiv",

  addOptions() {
    return {
      types: ["paragraph", "heading", "docTitle"],
    };
  },

  addProseMirrorPlugins() {
    const types = this.options.types;

    return [
      new Plugin({
        key: new PluginKey("wrapNodeWithDiv"),
        props: {
          nodeViews: Object.fromEntries(
            types.map((typeName: string) => [
              typeName,
              (node: any, view: any, getPos: any) => {
                const dom = document.createElement("div");
                dom.className = `${typeName}`;
                
                // 将 data-id 等属性挂到 wrapper 上
                if (node.attrs["data-id"]) {
                  dom.setAttribute("data-id", node.attrs["data-id"]);
                }
                
                const contentDOM = document.createElement(
                  typeName === "heading" ? `h${node.attrs.level || 1}` :
                  typeName === "docTitle" ? "p" : "p"
                );
                
                if (typeName === "docTitle") {
                  contentDOM.className = "mainTitle";
                }
                
                // 复制其他样式属性到 contentDOM
                Object.keys(node.attrs || {}).forEach(key => {
                  if (key !== "level" && key !== "data-id" && node.attrs[key]) {
                    // textAlign 等样式属性应用到内层元素
                    if (key === "textAlign") {
                      contentDOM.style.textAlign = node.attrs[key];
                    } else {
                      contentDOM.setAttribute(key, node.attrs[key]);
                    }
                  }
                });
                
                dom.appendChild(contentDOM);
                
                return {
                  dom,
                  contentDOM,
                };
              },
            ])
          ),
        },
      }),
    ];
  },
});
