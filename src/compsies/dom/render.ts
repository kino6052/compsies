import { TNode } from '../compsies';
import { applyActions } from '../tree/apply';
import { reconcileTrees, TreeNode, Action } from '../tree/reconciliation';

/**
 * Converts a TNode to a TreeNode for reconciliation
 * @param node The TNode to convert
 * @returns A TreeNode representation
 */
export function convertToTreeNode(node: TNode | string | number | null | boolean | undefined): TreeNode | null {
  if (node === null || node === undefined || typeof node === 'boolean' || typeof node === 'string' || typeof node === 'number') {
    return null;
  }

  return {
    id: node.id || '',
    type: node.type,
    props: node.props,
    content: node.children.length === 1 && typeof node.children[0] === 'string' ? node.children[0] : undefined,
    children: typeof node.children === "string" ? [] : node.children
      .map(child => convertToTreeNode(child))
      .filter(Boolean) as TreeNode[]
  };
}

/**
 * Creates a DOM element from a TreeNode
 * @param node The TreeNode to create a DOM element from
 * @returns The created DOM element
 */
function createDOMElement(node: TreeNode): Node {
  // Create element based on node type or default to div
  const createElement = (type: string): HTMLElement =>
    document.createElement(type || 'div');

  // Create text node if content is present
  const createTextNode = (content?: string): Text | null =>
    content ? document.createTextNode(content) : null;

  // Apply properties to an element
  const applyProps = (element: HTMLElement, props: Record<string, any> = {}): HTMLElement => {
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.entries(value).forEach(([styleKey, styleValue]) => {
          (element.style as any)[styleKey] = styleValue;
        });
      } else if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.substring(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else {
        element.setAttribute(key, value);
      }
    });
    return element;
  };

  // Set data-id attribute for tracking
  const setNodeId = (element: HTMLElement, id: string): HTMLElement => {
    if (id) {
      element.setAttribute('data-id', id);
    }
    return element;
  };

  // Main element creation logic
  if (node.content !== undefined) {
    // For text content nodes
    const element = createElement(node.type);
    const textNode = createTextNode(node.content);
    if (textNode) {
      element.appendChild(textNode);
    }
    return setNodeId(applyProps(element, node.props), node.id);
  } else {
    // For regular element nodes
    const element = createElement(node.type);
    return setNodeId(applyProps(element, node.props), node.id);
  }
}

/**
 * Updates a DOM element based on a TreeNode
 * @param element The DOM element to update
 * @param changes The changes to apply to the element
 */
function updateDOMElement(element: HTMLElement, changes: Partial<TreeNode>): void {
  // Update properties on the element
  const updateProps = (el: HTMLElement, props: Record<string, any> = {}): void => {
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'className') {
        el.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.entries(value).forEach(([styleKey, styleValue]) => {
          (el.style as any)[styleKey] = styleValue;
        });
      } else {
        el.setAttribute(key, value);
      }
    });
  };

  // Update text content if needed
  const updateContent = (el: HTMLElement, content?: string): void => {
    if (content !== undefined) {
      el.textContent = content;
    }
  };

  // Apply all changes
  if (changes.props) {
    updateProps(element, changes.props);
  }

  if (changes.content !== undefined) {
    updateContent(element, changes.content);
  }
}

/**
 * Finds a DOM element by TreeNode id
 * @param rootElement The root DOM element to search in
 * @param id The id of the TreeNode
 * @returns The found DOM element or null
 */
function findDOMElementById(rootElement: Element, id: string): Element | null {
  // Use querySelector to find elements with matching data-id
  const findElement = (root: Element, nodeId: string): Element | null =>
    root.querySelector(`[data-id="${nodeId}"]`);

  // Return the found element or null
  return findElement(rootElement, id);
}

/**
 * Renders a TNode to a DOM element
 * @param node The TNode to render
 * @param container The DOM element to render into
 */
export function render(node: TNode, container: Element): void {
  // Convert TNode to TreeNode
  const targetTree = convertToTreeNode(node);

  // Get current tree from container
  const getCurrentTree = (container: Element): TreeNode | null => {
    // If container is empty, return null
    if (!container.firstElementChild) return null;

    // Extract tree structure from DOM
    const extractTreeFromDOM = (element: Element): TreeNode => {
      const id = element.getAttribute('data-id') || '';
      const type = element.tagName.toLowerCase();

      // Process style attribute separately
      const processStyle = (styleAttr: string) => {
        return styleAttr.split(';').reduce((styleAcc, style) => {
          const [key, value] = style.split(':').map(s => s.trim());
          if (key && value) {
            (styleAcc as Record<string, any>)[key] = value;
          }
          return styleAcc;
        }, {});
      };

      const props = Array.from(element.attributes)
        .filter(attr => attr.name !== 'data-id')
        .reduce((acc, attr) => {
          if (attr.name === 'style') {
            acc[attr.name] = processStyle(attr.value);
          } else {
            acc[attr.name] = attr.value;
          }
          return acc;
        }, {} as Record<string, any>);

      const children = Array.from(element.children).map(extractTreeFromDOM);

      return {
        id,
        type,
        props,
        children,
        content: element.childNodes.length === 1 &&
          element.firstChild?.nodeType === Node.TEXT_NODE ?
          element.textContent || undefined : undefined
      };
    };

    return extractTreeFromDOM(container.firstElementChild);
  };

  // Apply reconciliation actions to the DOM
  const applyActionsToDOM = (actions: Action[], container: Element, currentTree: TreeNode | null): void => {
    console.warn({ actions, currentTree });
    if (!currentTree) {
      // If no current tree exists, create the initial DOM structure
      if (actions.length > 0 && actions[0].type === 'create') {
        const rootNode = actions[0].node;
        const rootElement = createDOMElement(rootNode);
        container.appendChild(rootElement);

        // Skip the first action as we've already handled it
        actions = actions.slice(1);
      }
      return;
    }

    // Define a map of action handlers for each action type
    const actionHandlers = {
      'create': (node: TreeNode, action: Action) => {
        const { parentId } = action as { type: 'create', node: TreeNode, parentId: string | null };
        const parent = parentId ? findDOMElementById(container, parentId) : container;

        if (parent) {
          const newElement = createDOMElement(node);
          parent.appendChild(newElement);
        }
      },
      'update': (node: TreeNode, action: Action) => {
        const element = findDOMElementById(container, node.id);

        if (element && element instanceof HTMLElement) {
          updateDOMElement(element, node);
        }
      },
      'delete': (node: TreeNode, action: Action) => {
        const element = findDOMElementById(container, node.id);

        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }
    };

    // Use applyActions with a callback that uses the action type map
    applyActions(actions, currentTree, (node, action) => {
      const handler = actionHandlers[action.type];
      if (handler) {
        handler(node, action);
      }
    });
  };

  // Main render logic
  const currentTree = getCurrentTree(container);

  if (targetTree) {
    // If we have a target tree, reconcile and apply changes
    const actions = reconcileTrees(targetTree, currentTree);
    applyActionsToDOM(actions, container, currentTree);
  } else if (currentTree) {
    // If target is null but we have current content, clear container
    container.innerHTML = '';
  }
}
