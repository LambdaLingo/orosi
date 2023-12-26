interface SlottedValue<T> {
  slots?: Record<string | symbol, T>;
  [slotCallbackSymbol]?: (value: T) => void;
}
export type SlottedContextValue<T> = SlottedValue<T> | T | null | undefined;
export type ContextValue<T, E extends Element> = SlottedContextValue<
  WithRef<T, E>
>;
