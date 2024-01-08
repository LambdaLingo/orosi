import type { KeyboardEvent } from "react";
import type { DOMAttributes } from "../../types/shared/dom";
import type { KeyboardEvents } from "../../types/shared/events";
import { createEventHandler } from "../../utilities/interactions/create-event-handler";

export interface KeyboardProps extends KeyboardEvents {
  /** Whether the keyboard events should be disabled. */
  isDisabled?: boolean;
}

export interface KeyboardResult {
  /** Props to spread onto the target element. */
  keyboardProps: DOMAttributes;
}

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
