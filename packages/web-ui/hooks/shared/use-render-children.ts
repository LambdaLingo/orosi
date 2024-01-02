import { useMemo } from "react";
import type { RenderChildrenHookOptions } from "../../types/shared/component";

export function useRenderChildren<T>(props: RenderChildrenHookOptions<T>) {
  let { children, defaultChildren, values } = props;

  return useMemo(() => {
    let computedChildren: React.ReactNode | undefined;

    if (typeof children === "function") {
      computedChildren = children(values);
    } else if (children == null) {
      computedChildren = defaultChildren;
    } else {
      computedChildren = children;
    }

    return {
      children: computedChildren,
    };
  }, [children, defaultChildren, values]);
}
