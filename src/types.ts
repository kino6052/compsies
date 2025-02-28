// Types
export type Props = Record<string, any>;

export type VNode = {
  type: string | Function;
  props: Props;
  children: VNode[];
  text?: string;
  id?: string;
  __id?: string;
};

export type Component = ((props: Props) => VNode) & { __id?: string };

export type Effect = {
  cleanup?: () => void;
  deps: any[];
};

export type Hook = {
  state?: any;
  queue?: any[];
  effect?: Effect;
};

// Global state

export const globalState: {
  currentComponent: Component | null;
  currentHook: number;
  hooks: Record<string, Hook[]>;
  rootDom: HTMLElement | null;
  currentVDom: VNode | null;
  updateScheduled: boolean;
} = {
  currentComponent: null,
  currentHook: 0,
  hooks: {},
  rootDom: null,
  currentVDom: null,
  updateScheduled: false,
};
