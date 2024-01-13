import { type ReactNode, useMemo } from "react";
import type { RenderChildrenHookOptions } from "types";

export function useRenderChildren<T>(props: RenderChildrenHookOptions<T>): {
  children: ReactNode;
} {
  const { children, defaultChildren, values } = props;

  return useMemo(() => {
    let computedChildren: ReactNode;

    if (typeof children === "function") {
      computedChildren = children(values);
    } else if (children === null) {
      computedChildren = defaultChildren;
    } else {
      computedChildren = children;
    }

    return {
      children: computedChildren,
    };
  }, [children, defaultChildren, values]);
}
