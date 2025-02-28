import { h, render } from "./src/index";
import { useState } from "./src/hooks/useState";

const App = () => {
  const [count, setCount] = useState(0);
  return h(
    "div",
    {}, //
    h("h1", {}, "Hello World"), //
    h(
      "button",
      {
        //
        onclick: () => setCount(count + 1),
      },
      "Click me"
    ), //
    h("p", {}, `Count: ${count}`)
  );
};

render(h(App), document.body);
