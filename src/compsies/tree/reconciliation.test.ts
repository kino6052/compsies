import { reconcileTrees, TreeNode, Action } from '../reconciliation';

describe('Reconciliation', () => {
  it('should reconcile two trees with node additions and deletions', () => {
    const targetTree = {
      id: '1',
      children: [
        { id: '2', children: [{ id: '3' }] },
        { id: '4' }
      ]
    };

    const currentTree = {
      id: '1',
      children: [
        { id: '2', children: [{ id: '3' }] },
        { id: '5' }
      ]
    };

    const actions = reconcileTrees(targetTree, currentTree);

    expect(actions).toEqual([
      { type: 'create', node: { id: '4', order: 1 }, parentId: '1' },
      { type: 'delete', id: '5' }
    ]);
  });

  it('should handle property updates on nodes', () => {
    const targetTree = {
      id: '1',
      name: 'Updated Root',
      children: [
        { id: '2', name: 'Child 1', value: 42 }
      ]
    };

    const currentTree = {
      id: '1',
      name: 'Root',
      children: [
        { id: '2', name: 'Child 1', value: 10 }
      ]
    };

    const actions = reconcileTrees(targetTree, currentTree);

    expect(actions).toEqual([
      { type: 'update', id: '1', changes: { name: 'Updated Root' } },
      { type: 'update', id: '2', changes: { value: 42 } }
    ]);
  });

  it('should handle nested additions and deletions', () => {
    const targetTree = {
      id: 'root',
      children: [
        {
          id: 'branch1',
          children: [
            { id: 'leaf1' },
            { id: 'leaf2' }
          ]
        }
      ]
    };

    const currentTree = {
      id: 'root',
      children: [
        {
          id: 'branch1',
          children: [
            { id: 'leaf1' },
            { id: 'leaf3' }
          ]
        }
      ]
    };

    const actions = reconcileTrees(targetTree, currentTree);

    expect(actions).toEqual([
      { type: 'create', node: { id: 'leaf2', order: 1 }, parentId: 'branch1' },
      { type: 'delete', id: 'leaf3' }
    ]);
  });


  it('should handle nested deletions', () => {
    const targetTree = {
      id: 'root',
      children: [
        {
          id: 'branch1',
          children: [
            { id: 'leaf3' }
          ]
        }
      ]
    };

    const currentTree = {
      id: 'root',
      children: [
        {
          id: 'branch1',
          children: [
            { id: 'leaf1' },
            { id: 'leaf3' }
          ]
        }
      ]
    };

    const actions = reconcileTrees(targetTree, currentTree);

    expect(actions).toMatchInlineSnapshot(`
[
  {
    "id": "leaf1",
    "type": "delete",
  },
]
`)
  });

  it('should handle empty trees', () => {
    const targetTree = null;
    const currentTree = null;

    const actions = reconcileTrees(targetTree, currentTree);

    expect(actions).toEqual([]);
  });

  it('should throw error when root IDs are different', () => {
    const targetTree = { id: 'root1' };
    const currentTree = { id: 'root2' };

    expect(() => reconcileTrees(targetTree, currentTree)).toThrow('Trees have different root ids');
  });

  it('should handle complex tree transformations', () => {
    const targetTree = {
      id: 'root',
      value: 100,
      children: [
        { id: 'A', value: 1 },
        {
          id: 'B',
          value: 2,
          children: [
            { id: 'B1', value: 21 },
            { id: 'B2', value: 22 }
          ]
        },
        { id: 'C', value: 3 }
      ]
    };

    const currentTree = {
      id: 'root',
      value: 0,
      children: [
        { id: 'A', value: 1 },
        {
          id: 'B',
          value: 20,
          children: [
            { id: 'B1', value: 21 },
            { id: 'B3', value: 23 }
          ]
        },
        { id: 'D', value: 4 }
      ]
    };

    const actions = reconcileTrees(targetTree, currentTree);

    expect(actions).toMatchInlineSnapshot(`
[
  {
    "changes": {
      "value": 100,
    },
    "id": "root",
    "type": "update",
  },
  {
    "node": {
      "id": "C",
      "order": 2,
      "value": 3,
    },
    "parentId": "root",
    "type": "create",
  },
  {
    "id": "D",
    "type": "delete",
  },
  {
    "changes": {
      "value": 2,
    },
    "id": "B",
    "type": "update",
  },
  {
    "node": {
      "id": "B2",
      "order": 1,
      "value": 22,
    },
    "parentId": "B",
    "type": "create",
  },
  {
    "id": "B3",
    "type": "delete",
  },
]
`);
  });
});
