import { VNode, Props, globalState } from "../types";
import { updateDom } from "../vdom/update";

// Rendering
export function render(vnode: VNode, container: HTMLElement) {
  globalState.rootDom = container;
  const newVDom = vnode;

  if (globalState.currentVDom) {
    // Update existing tree
    updateDom(newVDom, globalState.currentVDom, container);
  } else {
    // Initial render
    container.innerHTML = "";
    const dom = createDom(newVDom);
    container.appendChild(dom);
  }

  globalState.currentVDom = newVDom;
}

// Create DOM from virtual node
export function createDom(vnode: VNode): Node {
  // Text nodes
  if (vnode.type === "TEXT") {
    return document.createTextNode(vnode.text || "");
  }

  // Function components
  if (typeof vnode.type === "function") {
    return renderComponent(vnode);
  }

  // Regular DOM elements
  const dom = document.createElement(vnode.type as string);

  // Set properties
  Object.entries(vnode.props || {}).forEach(([name, value]) => {
    if (name === "style" && typeof value === "object") {
      Object.assign(dom.style, value);
    } else if (name.startsWith("on") && typeof value === "function") {
      const eventName = name.toLowerCase().substring(2);
      dom.addEventListener(eventName, value);
    } else if (name !== "children") {
      dom.setAttribute(name, value);
    }
  });

  // Append children
  (vnode.children || []).forEach((child) => {
    dom.appendChild(createDom(child));
  });

  return dom;
}

// Render a component
export function renderComponent(vnode: VNode): Node {
  // Set up component context
  const component = vnode.type as Function;
  const componentId =
    component.name || "Component" + Math.random().toString(36).substr(2, 9);

  // Store component ID for hooks
  const componentWithId = component as any;
  componentWithId.__id = componentId;

  // Set current component for hooks
  globalState.currentComponent = componentWithId;
  globalState.currentHook = 0;

  // Render the component
  const renderedVNode = component(vnode.props);

  // Reset component context
  globalState.currentComponent = null;

  // Create DOM from the rendered vnode
  return createDom(renderedVNode);
}

// Schedule an update
export function scheduleUpdate() {
  if (
    !globalState.updateScheduled &&
    globalState.rootDom &&
    globalState.currentVDom
  ) {
    globalState.updateScheduled = true;
    queueMicrotask(() => {
      globalState.updateScheduled = false;
      if (globalState.currentVDom && globalState.rootDom) {
        render(globalState.currentVDom, globalState.rootDom);
      }
    });
  }
}
