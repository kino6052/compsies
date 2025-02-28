// Tiny React - A simple Preact-like library without JSX

// Export the public API
export { h, openTagComponent, childrenComposition } from "./vdom/create";
export { render } from "./render/dom";
export { useState } from "./hooks/useState";
export { useEffect } from "./hooks/useEffect";
export { renderToString } from "./render/string";
