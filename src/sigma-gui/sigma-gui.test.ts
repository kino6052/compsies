import { c, TComponent } from "./sigma-gui";

describe("tiny component api", () => {
  it("should create basic nodes with text content", () => {
    const node = c("div", "test-id", {}, ["Hello world"], "div");

    expect(node).toMatchObject({
      type: "div",
      id: "test-id",
      props: {},
      children: ["Hello world"]
    });
  });

  it("should create nodes with props", () => {
    const node = c(
      "button",
      "button-id",
      {
        disabled: true,
        style: { color: "red" }
      },
      ["Click me"],
      "button"
    );

    expect(node).toMatchObject({
      type: "button",
      id: "button-id",
      props: {
        disabled: true,
        style: { color: "red" }
      },
      children: ["Click me"]
    });
  });

  it("should create nodes from components", () => {
    const Component: TComponent<{ test: string }> = ({ test }: { test: string }) => c(
      "div",
      "component-id",
      {},
      [test],
      "div"
    );

    const result = Component({ test: "test" });

    expect(result).toMatchObject({
      type: "div",
      id: "component-id",
      props: {},
      children: ["test"]
    });
  });

  it("should handle nested components", () => {
    const ChildComponent: TComponent<{ value: string }> = ({ value }) => c(
      "span",
      "child-id",
      { class: "child" },
      [value],
      "span"
    );

    const ParentComponent: TComponent<{ title: string }> = ({ title }) => c(
      "div",
      "parent-id",
      { class: "parent" },
      [
        c("h1", "title-id", {}, [title], "h1"),
        ChildComponent({ value: "child content" })
      ],
      "div"
    );

    const result = ParentComponent({ title: "Hello" });

    expect(result).toMatchObject({
      type: "div",
      id: "parent-id",
      props: { class: "parent" },
      children: [
        {
          type: "h1",
          id: "title-id",
          props: {},
          children: ["Hello"]
        },
        {
          type: "span",
          id: "child-id",
          props: { class: "child" },
          children: ["child content"]
        }
      ]
    });
  });

  it("should handle conditional rendering", () => {
    const ConditionalComponent: TComponent<{ showExtra: boolean, text: string }> =
      ({ showExtra, text }) => c(
        "div",
        "conditional-id",
        {},
        [
          c("p", "text-id", {}, [text], "p"),
          showExtra && c("span", "extra-id", {}, ["Extra content"], "span")
        ],
        "div"
      );

    const withExtra = ConditionalComponent({ showExtra: true, text: "Main text" });
    const withoutExtra = ConditionalComponent({ showExtra: false, text: "Main text" });

    expect(withExtra.children.length).toBe(2);
    expect(withoutExtra.children.length).toBe(2); // false value is still in children array
    expect(withoutExtra.children[1]).toBe(false);
  });
});
