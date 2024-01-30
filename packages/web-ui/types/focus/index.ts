import type { FocusableElement } from "types/shared";

export type FocusManager = {
  /** Moves focus to the next focusable or tabbable element in the focus scope. */
  focusNext: (opts?: FocusManagerOptions) => FocusableElement | null;
  /** Moves focus to the previous focusable or tabbable element in the focus scope. */
  focusPrevious: (opts?: FocusManagerOptions) => FocusableElement | null;
  /** Moves focus to the first focusable or tabbable element in the focus scope. */
  focusFirst: (opts?: FocusManagerOptions) => FocusableElement | null;
  /** Moves focus to the last focusable or tabbable element in the focus scope. */
  focusLast: (opts?: FocusManagerOptions) => FocusableElement | null;
};
export type FocusManagerOptions = {
  /** The element to start searching from. The currently focused element by default. */
  from?: Element;
  /** Whether to only include tabbable elements, or all focusable elements. */
  tabbable?: boolean;
  /** Whether focus should wrap around when it reaches the end of the scope. */
  wrap?: boolean;
  /** A callback that determines whether the given element is focused. */
  accept?: (node: Element) => boolean;
};
