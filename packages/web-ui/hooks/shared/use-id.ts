import { useCallback, useEffect, useRef, useState } from "react";
import { useSSRSafeId } from "hooks/ssr";
import { useLayoutEffect } from "./use-layout-effect";
import { useValueEffect } from "./use-value-effect";

// copied from SSRProvider.tsx to reduce exports, if needed again, consider sharing
const canUseDOM = Boolean(
  typeof window !== "undefined" &&
    window.document &&
    window.document.createElement
);

const idsUpdaterMap: Map<string, (v: string) => void> = new Map();

/**
 * If a default is not provided, generate an id.
 * @param defaultId - Default component id.
 */
export function useId(defaultId?: string): string {
  const [value, setValue] = useState(defaultId);
  const nextId = useRef<string | null>(null);

  const res = useSSRSafeId(value);

  const updateValue = useCallback((val: string) => {
    nextId.current = val;
  }, []);

  if (canUseDOM) {
    idsUpdaterMap.set(res, updateValue);
  }

  useLayoutEffect(() => {
    const r = res;
    return () => {
      idsUpdaterMap.delete(r);
    };
  }, [res]);

  // This cannot cause an infinite loop because the ref is updated first.
  // eslint-disable-next-line
  useEffect(() => {
    const newId = nextId.current;
    if (newId) {
      nextId.current = null;
      setValue(newId);
    }
  });

  return res;
}

/**
 * Used to generate an id, and after render, check if that id is rendered so we know
 * if we can use it in places such as labelledby.
 * @param depArray - When to recalculate if the id is in the DOM.
 */
export function useSlotId(depArray: readonly any[] = []): string {
  const id = useId();
  const [resolvedId, setResolvedId] = useValueEffect(id);
  const updateId = useCallback(() => {
    setResolvedId(function* () {
      yield id;

      yield document.getElementById(id) ? id : undefined;
    });
  }, [id, setResolvedId]);

  useLayoutEffect(updateId, [id, updateId, ...depArray]);

  return resolvedId;
}
