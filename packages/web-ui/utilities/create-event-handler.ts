import type { SyntheticEvent } from "react";
import type { BaseEvent } from "../types/shared/events";

/**
 * This function wraps a React event handler to make stopPropagation the default, and support continuePropagation instead.
 */
export function createEventHandler<T extends SyntheticEvent>(
  handler?: (e: BaseEvent<T>) => void
): ((e: T) => void) | undefined {
  if (!handler) {
    return undefined;
  }

  let shouldStopPropagation = true;
  return (e: T) => {
    let event: BaseEvent<T> = {
      ...e,
      preventDefault() {
        e.preventDefault();
      },
      isDefaultPrevented() {
        return e.isDefaultPrevented();
      },
      stopPropagation() {
        console.error(
          "stopPropagation is now the default behavior for events in React Spectrum. You can use continuePropagation() to revert this behavior."
        );
      },
      continuePropagation() {
        shouldStopPropagation = false;
      },
    };

    handler(event);

    if (shouldStopPropagation) {
      e.stopPropagation();
    }
  };
}
