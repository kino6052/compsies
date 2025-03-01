import { TreeNode } from "./reconciliation";

/**
 * Walks through two trees simultaneously and calls the provided callback for each pair of nodes.
 * This function traverses the trees in a depth-first manner.
 * 
 * @param treeA The primary tree to traverse (required)
 * @param treeB The secondary tree to compare against (optional)
 * @param callback Function called for each node pair during traversal
 */
export function walkTree({
  treeA,
  treeB,
  callback,
  depth = 0
}: {
  treeA: TreeNode | null;
  treeB: TreeNode | null;
  callback: ({
    nodeA,
    nodeB,
  }: {
    nodeA: { node: TreeNode | null, parent: TreeNode | null },
    nodeB: { node: TreeNode | null, parent: TreeNode | null }
  }) => void;
  depth?: number;
}) {
  if (depth === 0) {
    // Process the root nodes first
    callback({ nodeA: { node: treeA ?? null, parent: null }, nodeB: { node: treeB ?? null, parent: null } });
  }

  // Process children if they exist
  const childrenA = treeA?.children || [];
  const childrenB = treeB?.children || [];
  const maxLength = Math.max(childrenA.length, childrenB.length);

  for (let index = 0; index < maxLength; index++) {
    const childA = index < childrenA.length ? childrenA[index] : null;
    const childB = index < childrenB.length ? childrenB[index] : null;

    // Call callback for this pair of child nodes
    callback({
      nodeA: { node: childA, parent: treeA },
      nodeB: { node: childB, parent: treeB }
    });

    // Recursively process this child's subtree
    walkTree({ treeA: childA, treeB: childB, callback, depth: depth + 1 });
  }
}
