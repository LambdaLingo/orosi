import type { MutableRefObject, RefObject } from "react";
import { useLayoutEffect } from "./use-layout-effect";

interface ContextValue<T> {
  ref?: MutableRefObject<T>;
}

// Syncs ref from context with ref passed to hook
export function useSyncRef<T>(
  context?: ContextValue<T> | null,
  ref?: RefObject<T>
) {
  useLayoutEffect(() => {
    if (context && context.ref && ref) {
      // @ts-ignore - review this later
      context.ref.current = ref.current;
      return () => {
        // @ts-ignore - review this later
        context.ref.current = null;
      };
    }
  });
}
