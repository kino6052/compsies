import { VNode, Props } from "../types";

// Create a virtual node
export function h(
  type: string | Function,
  props: Props = {},
  ...children: any[]
): VNode {
  return {
    type,
    props: props || {},
    children: children
      .flat()
      .map((child) =>
        typeof child === "string" || typeof child === "number"
          ? { type: "TEXT", props: {}, children: [], text: String(child) }
          : child
      ),
  };
}

// Helper to create opening tag component
export function openTagComponent(type: string | Function) {
  return (props: Props = {}) => ({ type, props });
}

// Helper to compose children
export function childrenComposition(...children: any[]) {
  return children.flat();
}
