import { applyActions } from './apply';
import { Action, TreeNode } from '../reconciliation';

describe('Apply Actions', () => {
  it('should apply update actions to a tree', () => {
    const tree: TreeNode = {
      id: '1',
      name: 'Root',
      children: [
        { id: '2', name: 'Child 1', value: 10 }
      ]
    };

    const actions: Action[] = [
      { type: 'update', id: '1', changes: { name: 'Updated Root' } },
      { type: 'update', id: '2', changes: { value: 42 } }
    ];

    const result = applyActions(actions, tree);

    expect(result).toEqual({
      id: '1',
      name: 'Updated Root',
      children: [
        { id: '2', name: 'Child 1', value: 42 }
      ]
    });
  });

  it('should apply delete actions to a tree', () => {
    const tree: TreeNode = {
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

    const actions: Action[] = [
      { type: 'delete', id: 'leaf2' }
    ];

    const result = applyActions(actions, tree);

    expect(result).toEqual({
      id: 'root',
      children: [
        {
          id: 'branch1',
          children: [
            { id: 'leaf1' }
          ]
        }
      ]
    });
  });

  it('should apply create actions to a tree', () => {
    const tree: TreeNode = {
      id: 'root',
      children: [
        { id: 'branch1', children: [] }
      ]
    };

    const actions: Action[] = [
      { type: 'create', node: { id: 'leaf1', value: 10 }, parentId: 'branch1' }
    ];

    const result = applyActions(actions, tree);

    expect(result).toEqual({
      id: 'root',
      children: [
        {
          id: 'branch1',
          children: [
            { id: 'leaf1', value: 10 }
          ]
        }
      ]
    });
  });

  it('should apply multiple types of actions in the correct order', () => {
    const tree: TreeNode = {
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

    const actions: Action[] = [
      { type: 'update', id: 'root', changes: { value: 100 } },
      { type: 'create', node: { id: 'C', value: 3, order: 2 }, parentId: 'root' },
      { type: 'delete', id: 'D' },
      { type: 'update', id: 'B', changes: { value: 2 } },
      { type: 'create', node: { id: 'B2', value: 22, order: 1 }, parentId: 'B' },
      { type: 'delete', id: 'B3' }
    ];

    const result = applyActions(actions, tree);

    expect(result).toEqual({
      id: 'root',
      value: 100,
      children: [
        { id: 'A', value: 1 },
        {
          id: 'B',
          value: 2,
          children: [
            { id: 'B1', value: 21 },
            { id: 'B2', value: 22, order: 1 }
          ]
        },
        { id: 'C', value: 3, order: 2 }
      ]
    });
  });

  it('should handle creating nodes with no children array', () => {
    const tree: TreeNode = {
      id: 'root',
      children: [
        { id: 'A' }
      ]
    };

    const actions: Action[] = [
      { type: 'create', node: { id: 'B' }, parentId: 'A' }
    ];

    const result = applyActions(actions, tree);

    expect(result).toEqual({
      id: 'root',
      children: [
        {
          id: 'A',
          children: [
            { id: 'B' }
          ]
        }
      ]
    });
  });
});
