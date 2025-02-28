import { Hook, globalState } from "../types";
import { scheduleUpdate } from "../render/dom";

export function useState<T>(
  initialState: T
): [T, (newState: T | ((prevState: T) => T)) => void] {
  const componentId = globalState.currentComponent?.__id;
  const hookId = globalState.currentHook++;

  if (!componentId) {
    throw new Error("useState must be used within a component");
  }

  if (!globalState.hooks[componentId]) {
    globalState.hooks[componentId] = [];
  }

  if (!globalState.hooks[componentId][hookId]) {
    globalState.hooks[componentId][hookId] = {
      state: typeof initialState === "function" ? initialState() : initialState,
      queue: [],
    };
  }

  const hook = globalState.hooks[componentId][hookId];

  // Process the state update queue
  if (hook.queue && hook.queue.length > 0) {
    hook.queue.forEach((updater) => {
      hook.state =
        typeof updater === "function" ? updater(hook.state) : updater;
    });
    hook.queue = [];
  }

  const setState = (newState: T | ((prevState: T) => T)) => {
    hook.queue = hook.queue || [];
    hook.queue.push(newState);
    scheduleUpdate();
  };

  return [hook.state, setState];
}
