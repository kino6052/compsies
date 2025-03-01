import { walkTree } from "./tree-walker";

export interface TreeNode {
  id: string;
  children?: TreeNode[];
  order?: number;
  content?: string; // for terminal nodes
  [key: string]: any; // For any other properties
}

export type Action =
  | { type: 'create', node: TreeNode, parentId: string | null }
  | { type: 'update', id: string, changes: Partial<TreeNode> }
  | { type: 'delete', id: string };

/**
 * Reconciles two trees and returns a list of actions needed to transform
 * the second tree into the first one.
 * @param targetTree The desired tree structure
 * @param currentTree The current tree structure
 * @returns Array of actions (create, update, delete)
 */
export function reconcileTrees(targetTree: TreeNode | null, currentTree: TreeNode | null): Action[] {
  const actions: Action[] = [];

  // Handle case where both trees are null
  if (!targetTree && !currentTree) return actions;

  // Handle case where one of the trees is null
  if (!targetTree || !currentTree) {
    if (targetTree) {
      // Create all nodes in the target tree
      walkTree({
        treeA: targetTree,
        treeB: null,
        callback: ({ nodeA }) => {
          actions.push({ type: 'create', node: nodeA.node as TreeNode, parentId: nodeA.parent?.id || null });
        }
      });
    } else {
      // Delete all nodes in the current tree
      walkTree({
        treeA: currentTree,
        treeB: null,
        callback: ({ nodeA }) => {
          actions.push({ type: 'delete', id: nodeA.node?.id ?? '' });
        }
      });
    }
    return actions;
  }

  if (targetTree.id !== currentTree.id) {
    throw new Error('Trees have different root ids');
  }

  // Track nodes that will be created or deleted to avoid redundant updates
  const nodesToCreate = new Set<string>();
  const nodesToDelete = new Set<string>();

  // Use walkTree to traverse both trees simultaneously
  walkTree({
    treeA: targetTree,
    treeB: currentTree,
    callback: ({ nodeA, nodeB }) => {
      const targetNode = nodeA.node;
      const currentNode = nodeB.node;

      // Check for updates to the current node
      // Skip update if the node is being created or deleted
      if (targetNode && currentNode &&
        !nodesToCreate.has(targetNode.id) &&
        !nodesToDelete.has(currentNode.id)) {
        const changes: Partial<TreeNode> = {};
        for (const key in targetNode) {
          // Skip children as they're handled separately
          if (key === 'children') continue;

          // Skip style property updates
          if (key === 'props' && targetNode[key] && typeof targetNode[key] === 'object') {
            // Create a copy of props without style for comparison
            const targetProps = { ...targetNode[key] };
            const currentProps = { ...currentNode[key] };

            // Remove style from comparison
            delete targetProps.style;
            delete currentProps.style;

            // Remove function properties from comparison
            for (const propKey in targetProps) {
              if (typeof targetProps[propKey] === 'function') {
                delete targetProps[propKey];
              }
            }

            for (const propKey in currentProps) {
              if (typeof currentProps[propKey] === 'function') {
                delete currentProps[propKey];
              }
            }

            // Compare the filtered props
            if (JSON.stringify(targetProps) !== JSON.stringify(currentProps)) {
              // Only include non-function properties in changes
              const propsChanges = {} as Record<string, unknown>;
              for (const propKey in targetNode[key]) {
                if (typeof targetNode[key][propKey] !== 'function' &&
                  propKey !== 'style' &&
                  JSON.stringify(targetNode[key][propKey]) !== JSON.stringify(currentNode[key][propKey])) {
                  propsChanges[propKey] = targetNode[key][propKey];
                }
              }

              if (Object.keys(propsChanges).length > 0) {
                changes.props = propsChanges;
              }
            }

            continue;
          }

          // For non-props properties, compare as before
          if (key !== 'props' && JSON.stringify(targetNode[key]) !== JSON.stringify(currentNode?.[key])) {
            changes[key] = targetNode[key];
          }
        }

        // Special handling for content updates
        if (targetNode.content !== currentNode.content) {
          changes.content = targetNode.content;
        }

        if (Object.keys(changes).length > 0) {
          actions.push({ type: 'update', id: targetNode.id, changes });
        }
      }

      // Handle children reconciliation
      const currentChildren = currentNode?.children ?? [];
      const targetChildren = targetNode?.children ?? [];

      const targetChildIds = new Set(targetChildren.map(child => child.id));
      const currentChildIds = new Set(currentChildren.map(child => child.id));


      // Find children to delete
      currentChildren.forEach(currentChild => {
        if (!targetChildIds.has(currentChild.id)) {
          actions.push({ type: 'delete', id: currentChild.id });
          nodesToDelete.add(currentChild.id);
        }
      });


      // Find children to create
      targetChildren.forEach((targetChild, i) => {
        if (!currentChildIds.has(targetChild.id) && !nodesToDelete.has(targetChild.id)) {
          actions.push({ type: 'create', node: { ...targetChild, order: i }, parentId: targetNode?.id ?? null });
          nodesToCreate.add(targetChild.id);
        }
      });
    }
  });

  return actions;
}
