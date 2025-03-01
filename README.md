# SigmaGUI (read: sigma guy)

SigmaGUI is a lightweight, intuitive view library with a simple component API. It's designed to be extremely easy to understand while still providing the power to build interactive web applications.

SigmaGUI is just a fun project to play with. It's not production ready. It's not even close to being production ready. But it's fun!

## Features

- **Minimal API**: Create components with a straightforward function-based approach
- **No Dependencies**: Zero external dependencies, just pure JavaScript/TypeScript
- **Small Footprint**: Tiny bundle size for fast loading
- **Declarative Rendering**: Describe your UI and let SigmaGUI handle the DOM
- **Efficient Updates**: Smart diffing algorithm to minimize DOM operations

## Getting Started

### Installation

```bash
npm install sigma-gui
```

Or include it directly in your HTML:

```html
<script src="https://unpkg.com/sigma-gui/dist/sigma-gui.js"></script>
```

### Basic Usage

```javascript
import { c } from "sigma-gui";
import { render } from "sigma-gui/dom/render";

// Create a simple component
const HelloWorld = ({ name }) => {
  return c(
    "div",
    "hello-world",
    { style: { color: "blue", fontWeight: "bold" } },
    [`Hello, ${name}!`],
    "div"
  );
};

// Render it to the DOM
const rootElement = document.querySelector("#root");
render(HelloWorld({ name: "World" }), rootElement);
```

## Component API

Components in SigmaGUI are just functions that return element descriptions. The `c()` function is the core building block:

```javascript
c(
  type, // HTML tag name (e.g., "div", "button")
  id, // Unique identifier for the element
  props, // Properties like style, className, event handlers
  children, // Array of child elements or text content
  tagName // Optional tag name (for consistency)
);
```

### Example Component

```javascript
const Button = ({ text, onClick }) => {
  return c(
    "button",
    "my-button",
    {
      onclick: onClick,
      style: {
        padding: "10px 20px",
        background: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      },
    },
    [text],
    "button"
  );
};
```

## State Management

SigmaGUI includes a simple yet powerful state management system using hooks:

```javascript
import { c, geUseState } from "sigma-gui";
import { render } from "sigma-gui/dom/render";

// Root element reference
const rootElement = document.querySelector("#root");

// Helper function to re-render with debouncing
let renderTimeout = null;
const renderApp = () => {
  if (renderTimeout) {
    clearTimeout(renderTimeout);
  }
  renderTimeout = setTimeout(() => {
    render(App(), rootElement);
    renderTimeout = null;
  }, 10);
};

// Initialize state hooks outside of components
const countState = geUseState(0, renderApp);

// Component that uses state hook
const Counter = () => {
  // Get state accessor functions
  const [getCount, setCount] = countState();

  const increment = () => {
    setCount(getCount() + 1);
    // No need to call renderApp() - the state hook handles it
  };

  return c(
    "div",
    "counter",
    {},
    [
      c("p", "count-display", {}, [`Count: ${getCount()}`], "p"),
      c(
        "button",
        "increment-button",
        { onclick: increment },
        ["Increment"],
        "button"
      ),
    ],
    "div"
  );
};

// Initial render
renderApp();
```

This approach provides several advantages:

- State is encapsulated and reusable
- Rendering is automatically triggered on state changes
- Debouncing prevents excessive re-renders
- State hooks can be shared across components

For more complex applications, you can create multiple state hooks for different pieces of state.

## Building Projects

SigmaGUI works with standard build tools like webpack, Rollup, or esbuild. The example below shows how to set up a basic build with esbuild:

```javascript
// build.js
const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["app.ts"],
    bundle: true,
    outdir: "dist",
    minify: true,
    platform: "browser",
    format: "esm",
    sourcemap: true,
    loader: { ".ts": "ts" },
  })
  .catch(() => process.exit(1));
```

## Examples

Check out the examples directory for complete applications built with SigmaGUI:

- Todo App
- Tic Tac Toe Game
- Simple Counter

## License

MIT
