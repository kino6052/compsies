import { TreeNode } from "./reconciliation";
import { Action } from "./reconciliation";
import { walkTree } from "./tree-walker";


/**   
 * Applies a list of actions to transform a tree
 * @param actions Array of actions to apply (create, update, delete)
 * @param tree The tree to transform
 * @returns The transformed tree
 */
export function applyActions(actions: Action[], tree: TreeNode, cb?: (node: TreeNode, action: Action) => void): TreeNode {
  const parentMap = new Map<string, TreeNode | null>();
  const nodeMap = new Map<string, TreeNode>();

  walkTree({
    treeA: tree,
    treeB: null,
    callback: ({ nodeA }) => {
      if (nodeA.node) {
        parentMap.set(nodeA.node.id, nodeA.parent);
        nodeMap.set(nodeA.node.id, nodeA.node);
      }
    }
  });

  // Apply actions in the correct order: updates, deletes, creates
  // First handle updates
  actions.filter(action => action.type === 'update').forEach(action => {
    const updateAction = action as { type: 'update', id: string, changes: Partial<TreeNode> };
    const node = nodeMap.get(updateAction.id);

    if (node) {
      Object.assign(node, updateAction.changes);
      cb?.(node, action);
    }
  });

  // Then handle deletes
  actions.filter(action => action.type === 'delete').forEach(action => {
    const deleteAction = action as { type: 'delete', id: string };
    const node = nodeMap.get(deleteAction.id);
    const parent = parentMap.get(deleteAction.id);

    if (node && parent && parent.children) {
      const index = parent.children.findIndex(child => child.id === deleteAction.id);
      if (index !== -1) {
        parent.children.splice(index, 1);
      }

      // Remove from our maps
      nodeMap.delete(deleteAction.id);
      parentMap.delete(deleteAction.id);

      cb?.(node, action);
    }
  });

  // Finally handle creates
  actions.filter(action => action.type === 'create').forEach(action => {
    const createAction = action as { type: 'create', node: TreeNode, parentId: string | null };
    const parent = createAction.parentId ? nodeMap.get(createAction.parentId) : null;

    if (parent) {
      // Initialize children array if it doesn't exist
      if (!parent.children) {
        parent.children = [];
      }

      // Add the new node
      parent.children.push(createAction.node);

      // Update our maps
      nodeMap.set(createAction.node.id, createAction.node);
      parentMap.set(createAction.node.id, parent);
    }

    cb?.(createAction.node, action);
  });

  return tree;
}
