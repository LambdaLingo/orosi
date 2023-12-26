import type { ForwardedRef, RefObject, Context } from "react";

export function useContextProps<T, U extends SlotProps, E extends Element>(
  props: T & SlotProps,
  ref: ForwardedRef<E>,
  context: Context<ContextValue<U, E>>
): [T, RefObject<E>] {
  let ctx = useSlottedContext(context, props.slot) || {};
  // @ts-ignore - TS says "Type 'unique symbol' cannot be used as an index type." but not sure why.
  let {
    ref: contextRef,
    [slotCallbackSymbol]: callback,
    ...contextProps
  } = ctx;
  let mergedRef = useObjectRef(
    useMemo(() => mergeRefs(ref, contextRef), [ref, contextRef])
  );
  let mergedProps = mergeProps(contextProps, props) as unknown as T;

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
