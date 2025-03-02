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
 * the current tree into the target one.
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
    return handleNullTree(targetTree, currentTree);
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
      if (targetNode && currentNode &&
        !nodesToCreate.has(targetNode.id) &&
        !nodesToDelete.has(currentNode.id)) {

        const nodeUpdates = getNodeUpdates(targetNode, currentNode);
        if (Object.keys(nodeUpdates).length > 0) {
          actions.push({ type: 'update', id: targetNode.id, changes: nodeUpdates });
        }
      }

      // Handle children reconciliation
      reconcileChildren(targetNode, currentNode, actions, nodesToCreate, nodesToDelete);
    }
  });

  return actions;
}

/**
 * Handles the case where one of the trees is null
 */
function handleNullTree(targetTree: TreeNode | null, currentTree: TreeNode | null): Action[] {
  const actions: Action[] = [];

  if (targetTree) {
    // Create all nodes in the target tree
    walkTree({
      treeA: targetTree,
      treeB: null,
      callback: ({ nodeA }) => {
        actions.push({ type: 'create', node: nodeA.node as TreeNode, parentId: nodeA.parent?.id || null });
      }
    });
  } else if (currentTree) {
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

/**
 * Compares two nodes and returns the changes needed to update the current node to match the target
 */
function getNodeUpdates(targetNode: TreeNode, currentNode: TreeNode): Partial<TreeNode> {
  const changes: Partial<TreeNode> = {};

  for (const key in targetNode) {
    // Skip children as they're handled separately
    if (key === 'children') continue;

    if (key === 'props' && targetNode[key] && typeof targetNode[key] === 'object') {
      const propsChanges = getPropsChanges(targetNode[key], currentNode[key]);
      if (Object.keys(propsChanges).length > 0) {
        changes.props = propsChanges;
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

  return changes;
}

/**
 * Compares props objects and returns the changes needed
 */
function getPropsChanges(targetProps: Record<string, any>, currentProps: Record<string, any>): Record<string, unknown> {
  // Create a copy of props without style for comparison
  const filteredTargetProps = { ...targetProps };
  const filteredCurrentProps = { ...currentProps };

  // Remove style from comparison
  delete filteredTargetProps.style;
  delete filteredCurrentProps.style;

  // Remove function properties from comparison
  removePropsOfType(filteredTargetProps, 'function');
  removePropsOfType(filteredCurrentProps, 'function');

  // Compare the filtered props
  if (JSON.stringify(filteredTargetProps) !== JSON.stringify(filteredCurrentProps)) {
    // Only include non-function properties in changes
    const propsChanges = {} as Record<string, unknown>;
    for (const propKey in targetProps) {
      if (typeof targetProps[propKey] !== 'function' &&
        propKey !== 'style' &&
        JSON.stringify(targetProps[propKey]) !== JSON.stringify(currentProps[propKey])) {
        propsChanges[propKey] = targetProps[propKey];
      }
    }
    return propsChanges;
  }

  return {};
}

/**
 * Removes properties of a specific type from an object
 */
function removePropsOfType(obj: Record<string, any>, type: string): void {
  for (const key in obj) {
    if (typeof obj[key] === type) {
      delete obj[key];
    }
  }
}

/**
 * Reconciles children between target and current nodes
 */
function reconcileChildren(
  targetNode: TreeNode | null,
  currentNode: TreeNode | null,
  actions: Action[],
  nodesToCreate: Set<string>,
  nodesToDelete: Set<string>
): void {
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
