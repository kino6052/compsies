import { VNode } from "../types";

// Server-side rendering
export function renderToString(vnode: VNode): string {
  if (vnode.type === "TEXT") {
    return String(vnode.text || "");
  }

  if (typeof vnode.type === "function") {
    const component = vnode.type as Function;
    const renderedVNode = component(vnode.props);
    return renderToString(renderedVNode);
  }

  const props = Object.entries(vnode.props || {})
    .filter(([name]) => name !== "children" && !name.startsWith("on"))
    .map(([name, value]) => {
      if (name === "style" && typeof value === "object") {
        const styleStr = Object.entries(value)
          .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`)
          .join(";");
        return `style="${styleStr}"`;
      }
      return `${name}="${value}"`;
    })
    .join(" ");

  const childrenStr = (vnode.children || [])
    .map((child) => renderToString(child))
    .join("");

  return `<${vnode.type}${props ? " " + props : ""}>${childrenStr}</${
    vnode.type
  }>`;
}
