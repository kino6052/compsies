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

SigmaGUI doesn't include built-in state management, but it's easy to implement your own:

```javascript
// Application state
const state = {
  count: 0,
};

// Component that uses state
const Counter = () => {
  const increment = () => {
    state.count++;
    renderApp(); // Re-render after state change
  };

  return c(
    "div",
    "counter",
    {},
    [
      c("p", "count-display", {}, [`Count: ${state.count}`], "p"),
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

// Helper function to re-render the application
const renderApp = () => {
  render(Counter(), document.querySelector("#root"));
};

// Initial render
renderApp();
```

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
