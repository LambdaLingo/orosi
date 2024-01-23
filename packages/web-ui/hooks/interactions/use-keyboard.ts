import type { KeyboardEvent } from "react";
import type { DOMAttributes, KeyboardEvents } from "types";
import { createEventHandler } from "utilities";

export type KeyboardProps = {
  /** Whether the keyboard events should be disabled. */
  isDisabled?: boolean;
} & KeyboardEvents;

export type KeyboardResult = {
  /** Props to spread onto the target element. */
  keyboardProps: DOMAttributes;
};

/**
 * Handles keyboard interactions for a focusable element.
 */
export function useKeyboard(props: KeyboardProps): KeyboardResult {
  return {
    keyboardProps: props.isDisabled
      ? {}
      : {
          onKeyDown: createEventHandler<KeyboardEvent>(props.onKeyDown),
          onKeyUp: createEventHandler<KeyboardEvent>(props.onKeyUp),
        },
  };
}
