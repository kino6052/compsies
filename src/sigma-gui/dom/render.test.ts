import { TNode } from '../sigma-gui';
import { convertToTreeNode } from './render';
import { TreeNode } from '../tree/reconciliation';

describe('convertToTreeNode', () => {
  it('should return null for null, undefined, boolean, string, or number inputs', () => {
    expect(convertToTreeNode(null)).toBeNull();
    expect(convertToTreeNode(undefined)).toBeNull();
    expect(convertToTreeNode(true)).toBeNull();
    expect(convertToTreeNode(false)).toBeNull();
    expect(convertToTreeNode('text')).toBeNull();
    expect(convertToTreeNode(42)).toBeNull();
  });

  it('should convert a simple TNode to TreeNode', () => {
    const input: TNode = {
      type: 'div',
      props: { className: 'container' },
      children: [],
      id: 'test-id'
    };

    const expected: TreeNode = {
      id: 'test-id',
      type: 'div',
      props: { className: 'container' },
      children: []
    };

    expect(convertToTreeNode(input)).toEqual(expected);
  });

  it('should generate an empty id if none is provided', () => {
    const input: TNode = {
      type: 'span',
      props: {},
      children: []
    };

    const result = convertToTreeNode(input);
    expect(result?.id).toBe('');
  });

  it('should extract content from a single text child', () => {
    const input: TNode = {
      type: 'p',
      props: {},
      children: ['Hello world'],
      id: 'paragraph'
    };

    const expected: TreeNode = {
      id: 'paragraph',
      type: 'p',
      props: {},
      content: 'Hello world',
      children: []
    };

    expect(convertToTreeNode(input)).toEqual(expected);
  });

  it('should recursively convert nested TNodes', () => {
    const input: TNode = {
      type: 'div',
      props: {},
      children: [
        {
          type: 'h1',
          props: {},
          children: ['Title'],
          id: 'title'
        },
        {
          type: 'p',
          props: { className: 'text' },
          children: ['Content'],
          id: 'content'
        }
      ],
      id: 'container'
    };

    const expected: TreeNode = {
      id: 'container',
      type: 'div',
      props: {},
      children: [
        {
          id: 'title',
          type: 'h1',
          props: {},
          content: 'Title',
          children: []
        },
        {
          id: 'content',
          type: 'p',
          props: { className: 'text' },
          content: 'Content',
          children: []
        }
      ]
    };

    expect(convertToTreeNode(input)).toEqual(expected);
  });

  it('should filter out null children', () => {
    const input: TNode = {
      type: 'ul',
      props: {},
      children: [
        {
          type: 'li',
          props: {},
          children: ['Item 1'],
          id: 'item1'
        },
        null,
        {
          type: 'li',
          props: {},
          children: ['Item 2'],
          id: 'item2'
        }
      ],
      id: 'list'
    };

    const result = convertToTreeNode(input);
    expect(result?.children?.length).toBe(2);
    expect(result?.children?.[0].id).toBe('item1');
    expect(result?.children?.[1].id).toBe('item2');
  });

  it('should handle string children correctly', () => {
    const input: TNode = {
      type: 'div',
      props: {},
      children: 'text content' as any, // Testing the edge case where children is a string
      id: 'test'
    };

    const expected: TreeNode = {
      id: 'test',
      type: 'div',
      props: {},
      children: []
    };

    expect(convertToTreeNode(input)).toEqual(expected);
  });
});
