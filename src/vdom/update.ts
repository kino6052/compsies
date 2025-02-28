import { VNode, Props } from "../types";
import { createDom, renderComponent } from "../render/dom";

// Update DOM with changes
export function updateDom(newVNode: VNode, oldVNode: VNode, parentDom: Node) {
  // Different node types - replace completely
  if (newVNode.type !== oldVNode.type) {
    const newDom = createDom(newVNode);
    parentDom.replaceChild(newDom, getDomNode(oldVNode));
    return;
  }

  // Text nodes - update if changed
  if (newVNode.type === "TEXT") {
    const textNode = getDomNode(oldVNode) as Text;
    if (newVNode.text !== oldVNode.text) {
      textNode.nodeValue = newVNode.text || "";
    }
    return;
  }

  // Function components - re-render
  if (typeof newVNode.type === "function") {
    const oldDom = getDomNode(oldVNode);
    const newDom = renderComponent(newVNode);
    parentDom.replaceChild(newDom, oldDom);
    return;
  }

  // Regular DOM elements - update props and children
  const dom = getDomNode(oldVNode) as HTMLElement;

  // Update props
  updateProps(dom, newVNode.props, oldVNode.props);

  // Update children
  updateChildren(dom, newVNode.children, oldVNode.children);
}

// Update props on a DOM node
export function updateProps(
  dom: HTMLElement,
  newProps: Props,
  oldProps: Props
) {
  // Remove old props that are no longer present
  Object.keys(oldProps).forEach((name) => {
    if (name !== "children" && !(name in newProps)) {
      if (name.startsWith("on")) {
        const eventName = name.toLowerCase().substring(2);
        dom.removeEventListener(eventName, oldProps[name]);
      } else {
        dom.removeAttribute(name);
      }
    }
  });

  // Set new or changed props
  Object.entries(newProps).forEach(([name, value]) => {
    if (name === "children") return;

    if (name === "style" && typeof value === "object") {
      // Reset styles first
      dom.style.cssText = "";
      Object.assign(dom.style, value);
    } else if (name.startsWith("on") && typeof value === "function") {
      const eventName = name.toLowerCase().substring(2);
      // Remove old event listener if it exists
      if (oldProps[name]) {
        dom.removeEventListener(eventName, oldProps[name]);
      }
      // Add new event listener
      dom.addEventListener(eventName, value);
    } else if (value !== oldProps[name]) {
      dom.setAttribute(name, value);
    }
  });
}

// Update children of a DOM node
export function updateChildren(
  dom: Node,
  newChildren: VNode[],
  oldChildren: VNode[]
) {
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  for (let i = 0; i < maxLength; i++) {
    if (i >= newChildren.length) {
      // Remove extra old children
      dom.removeChild(getDomNode(oldChildren[i]));
    } else if (i >= oldChildren.length) {
      // Add new children
      dom.appendChild(createDom(newChildren[i]));
    } else {
      // Update existing children
      updateDom(newChildren[i], oldChildren[i], dom);
    }
  }
}

// Helper to get the DOM node for a VNode
export function getDomNode(vnode: VNode): Node {
  // This is a simplified implementation
  // In a real implementation, we would store DOM references
  // For now, we'll just traverse the DOM to find the node
  return document.querySelector(`[data-vnode-id="${vnode.id}"]`) as Node;
}
