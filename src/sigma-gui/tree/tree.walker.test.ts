import { walkTree } from "./tree-walker";

describe('walkTree', () => {
  it('should walk through a single node tree', () => {
    const tree = { id: '1' };
    const callback = jest.fn();

    walkTree({
      treeA: tree,
      treeB: null,
      callback
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      nodeA: { node: tree, parent: null },
      nodeB: { node: null, parent: null }
    });
  });

  it('should walk through a tree with children', () => {
    const tree = {
      id: '1',
      children: [
        { id: '2' },
        { id: '3' }
      ]
    };
    const callback = jest.fn();

    walkTree({
      treeA: tree,
      treeB: null,
      callback
    });

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(1, {
      nodeA: { node: tree, parent: null },
      nodeB: { node: null, parent: null }
    });
    expect(callback).toHaveBeenNthCalledWith(2, {
      nodeA: { node: tree.children[0], parent: tree },
      nodeB: { node: null, parent: null }
    });
    expect(callback).toHaveBeenNthCalledWith(3, {
      nodeA: { node: tree.children[1], parent: tree },
      nodeB: { node: null, parent: null }
    });
  });

  it('should walk through two trees simultaneously', () => {
    const treeA = {
      id: '1',
      children: [
        { id: '2' },
        { id: '3' }
      ]
    };

    const treeB = {
      id: '1',
      children: [
        { id: '2' },
        { id: '4' }
      ]
    };

    const callback = jest.fn();

    walkTree({
      treeA,
      treeB,
      callback
    });

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(1, {
      nodeA: { node: treeA, parent: null },
      nodeB: { node: treeB, parent: null }
    });
    expect(callback).toHaveBeenNthCalledWith(2, {
      nodeA: { node: treeA.children[0], parent: treeA },
      nodeB: { node: treeB.children[0], parent: treeB }
    });
    expect(callback).toHaveBeenNthCalledWith(3, {
      nodeA: { node: treeA.children[1], parent: treeA },
      nodeB: { node: treeB.children[1], parent: treeB }
    });
  });

  it('should handle trees with different depths', () => {
    const treeA = {
      id: '1',
      children: [
        {
          id: '2',
          children: [{ id: '3' }]
        }
      ]
    };

    const treeB = {
      id: '1',
      children: [
        { id: '2' }
      ]
    };

    const callback = jest.fn();

    walkTree({
      treeA,
      treeB,
      callback
    });

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(1, {
      nodeA: { node: treeA, parent: null },
      nodeB: { node: treeB, parent: null }
    });
    expect(callback).toHaveBeenNthCalledWith(2, {
      nodeA: { node: treeA.children[0], parent: treeA },
      nodeB: { node: treeB.children[0], parent: treeB }
    });
    expect(callback.mock.calls[2]).toMatchInlineSnapshot(`
[
  {
    "nodeA": {
      "node": {
        "id": "3",
      },
      "parent": {
        "children": [
          {
            "id": "3",
          },
        ],
        "id": "2",
      },
    },
    "nodeB": {
      "node": null,
      "parent": {
        "id": "2",
      },
    },
  },
]
`);
  });

  it('should handle trees with different number of children', () => {
    const treeA = {
      id: '1',
      children: [
        { id: '2' },
        { id: '3' },
        { id: '4' }
      ]
    };

    const treeB = {
      id: '1',
      children: [
        { id: '2' }
      ]
    };

    const callback = jest.fn();

    walkTree({
      treeA,
      treeB,
      callback
    });

    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenNthCalledWith(3, {
      nodeA: { node: treeA.children[1], parent: treeA },
      nodeB: { node: null, parent: treeB }
    });
    expect(callback).toHaveBeenNthCalledWith(4, {
      nodeA: { node: treeA.children[2], parent: treeA },
      nodeB: { node: null, parent: treeB }
    });
  });
});

