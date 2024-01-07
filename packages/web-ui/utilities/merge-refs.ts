import type { ForwardedRef } from "react";

/**
 * Merges multiple refs into one. Works with either callback or object refs.
 */
export function mergeRefs<T>(...refs: ForwardedRef<T>[]): ForwardedRef<T> {
  if (refs.length === 1) {
    return refs[0];
  }
  return (value: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref !== null) {
        ref.current = value;
      }
    }
  };
}
