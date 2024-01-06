import { type Context, useContext } from "react";
import type { SlottedContextValue } from "../../types/shared/context";

export const defaultSlot = Symbol("default");

export function useSlottedContext<T>(
  context: Context<SlottedContextValue<T>>,
  slot?: string | null
): T | null | undefined {
  const ctx = useContext(context);
  if (slot === null) {
    // An explicit `null` slot means don't use context.
    return null;
  }
  if (ctx && typeof ctx === "object" && "slots" in ctx && ctx.slots) {
    const availableSlots = new Intl.ListFormat().format(
      Object.keys(ctx.slots).map((p) => `"${p}"`)
    );

    if (!slot && !ctx.slots[defaultSlot]) {
      throw new Error(
        `A slot prop is required. Valid slot names are ${availableSlots}.`
      );
    }
    const slotKey = slot || defaultSlot;
    if (!ctx.slots[slotKey]) {
      throw new Error(
        `Invalid slot "${slot}". Valid slot names are ${availableSlots}.`
      );
    }
    return ctx.slots[slotKey];
  }
  return ctx as T;
}
