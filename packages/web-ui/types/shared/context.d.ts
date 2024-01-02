import type { WithRef } from "./ref";

interface SlottedValue<T> {
  slots?: Record<string | symbol, T>;
  [slotCallbackSymbol]?: (value: T) => void;
}
export type SlottedContextValue<T> = SlottedValue<T> | T | null | undefined;
export type ContextValue<T, E extends Element> = SlottedContextValue<
  WithRef<T, E>
>;
export type SlotProps = {
  /**
   * A slot name for the component. Slots allow the component to receive props from a parent component.
   * An explicit `null` value indicates that the local props completely override all props received from a parent.
   */
  slot?: string | null;
};
