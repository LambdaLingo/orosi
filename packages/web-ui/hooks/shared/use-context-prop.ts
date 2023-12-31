import {
  type ForwardedRef,
  type RefObject,
  type Context,
  useMemo,
  useEffect,
} from "react";
import type { SlotProps, ContextValue } from "../../types/shared/context";
import { mergeProps } from "../../utilities/merge-props";
import { useSlottedContext } from "./use-slotted-context";
import { useObjectRef } from "./use-object-ref";
import { mergeRefs } from "../../utilities/merge-refs";

export const slotCallbackSymbol = Symbol("callback");

export function useContextProps<T, U extends SlotProps, E extends Element>(
  props: T & SlotProps,
  ref: ForwardedRef<E>,
  context: Context<ContextValue<U, E>>
): [T, RefObject<E>] {
  const ctx = useSlottedContext(context, props.slot) || {};
  const {
    ref: contextRef,
    // @ts-ignore - TS says "Type 'unique symbol' cannot be used as an index type." but not sure why.
    [slotCallbackSymbol]: callback,
    ...contextProps
  } = ctx;

  const mergedRef = useObjectRef(
    useMemo(() => mergeRefs(ref, contextRef), [ref, contextRef])
  );
  const mergedProps = mergeProps(contextProps, props) as unknown as T;

  // mergeProps does not merge `style`. Adding this there might be a breaking change.
  if (
    "style" in contextProps &&
    contextProps.style &&
    typeof contextProps.style === "object" &&
    "style" in props &&
    props.style &&
    typeof props.style === "object"
  ) {
    // @ts-ignore
    mergedProps.style = { ...contextProps.style, ...props.style };
  }

  // A parent component might need the props from a child, so call slot callback if needed.
  useEffect(() => {
    if (callback) {
      callback(props);
    }
  }, [callback, props]);

  return [mergedProps, mergedRef];
}
