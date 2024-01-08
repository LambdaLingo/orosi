import { useCallback, useRef } from "react";
import { useLayoutEffect } from "./use-layout-effect";

export function useEffectEvent<T extends Function>(fn: T): T {
  const ref = useRef<T | null>(null);
  useLayoutEffect(() => {
    ref.current = fn;
  }, [fn]);
  // @ts-ignore
  return useCallback<T>((...args) => {
    const f = ref.current!;
    return f(...args);
  }, []);
}
