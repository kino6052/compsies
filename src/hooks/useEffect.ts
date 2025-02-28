import { globalState } from "../types";

export function useEffect(
  callback: () => void | (() => void),
  deps: any[] = []
) {
  const componentId = globalState.currentComponent?.__id;
  const hookId = globalState.currentHook++;

  if (!componentId) {
    throw new Error("useEffect must be used within a component");
  }

  if (!globalState.hooks[componentId]) {
    globalState.hooks[componentId] = [];
  }

  const hook = globalState.hooks[componentId][hookId] || {
    effect: { deps: [] },
  };
  globalState.hooks[componentId][hookId] = hook;

  const hasNoDeps = !deps;
  const hasChangedDeps =
    !hook.effect?.deps ||
    deps.length !== hook.effect.deps.length ||
    deps.some((dep, i) => dep !== hook.effect?.deps[i]);

  if (hasNoDeps || hasChangedDeps) {
    // Schedule effect to run after render
    queueMicrotask(() => {
      // Clean up previous effect if it exists
      if (hook.effect?.cleanup) {
        hook.effect.cleanup();
      }

      // Run new effect and store any cleanup function
      const cleanup = callback();
      hook.effect = {
        cleanup: typeof cleanup === "function" ? cleanup : undefined,
        deps,
      };
    });
  }
}
