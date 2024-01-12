import {
  type ForwardedRef,
  type RefObject,
  type Context,
  useMemo,
  useEffect,
} from "react";
import type { SlotProps, ContextValue } from "../../types/shared/context";
import { mergeProps } from "../../utilities/merge-props";
import { mergeRefs } from "../../utilities/merge-refs";
import { useSlottedContext } from "./use-slotted-context";
import { useObjectRef } from "./use-object-ref";

export const slotCallbackSymbol = Symbol("callback");

/**
 * Merge the local props and ref with the ones provided via context.
 */
export function useContextProps<T, U extends SlotProps, E extends Element>(
  props: T & SlotProps,
  ref: ForwardedRef<E>,
  context: Context<ContextValue<U, E>>
): [T, RefObject<E>] {
  const ctx: {
    ref?: ForwardedRef<E>;
    [slotCallbackSymbol]?: (props: T & SlotProps) => void;
  } = useSlottedContext(context, props.slot) || {};
  const {
    ref: contextRef,
    [slotCallbackSymbol]: callback,
    ...contextProps
  } = ctx;

  const mergedRef = useObjectRef(
    useMemo(() => mergeRefs(ref, contextRef || null), [ref, contextRef])
  );
  const mergedProps = mergeProps(contextProps, props) as unknown as T;

  // A parent component might need the props from a child, so call slot callback if needed.
  useEffect(() => {
    if (callback) {
      callback(props);
    }
  }, [callback, props]);

  return [mergedProps, mergedRef as RefObject<E>];
}
