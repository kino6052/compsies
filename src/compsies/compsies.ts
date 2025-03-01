export type TChild = TNode | string | number | null | boolean;

export type TNode = {
  type: string;
  id?: string;
  props: Record<string, any>;
  children: TChild[];
};

export type TComponent<PProps> = (props: PProps) => TNode;

export function c<TProps extends Record<string, unknown>, TName extends string>(
  name: TName,
  id: string,
  props: TProps,
  children: TChild[],
  closingName: TName
) {

  if (name !== closingName) {
    throw new Error(`Component ${name} is closed with ${closingName}`);
  }

  return {
    type: name,
    id,
    props,
    children,
  };
}

export function geUseState<T>(initialValue: T, renderFn: () => void) {
  let state = initialValue;

  return function (): [() => T, (newValue: T) => void] {
    return [() => state, (newValue: T) => {
      state = newValue;
      renderFn();
    }];
  }
}