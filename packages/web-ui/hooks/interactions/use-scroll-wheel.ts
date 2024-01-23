import { type RefObject, useCallback } from "react";
import type { ScrollEvents } from "types";
import { useEvent } from "hooks";

export type ScrollWheelProps = {
  /** Whether the scroll listener should be disabled. */
  isDisabled?: boolean;
} & ScrollEvents;

// scroll wheel needs to be added not passively so it's cancelable, small helper hook to remember that
export function useScrollWheel(
  props: ScrollWheelProps,
  ref: RefObject<HTMLElement>
): void {
  const { onScroll, isDisabled } = props;
  const onScrollHandler = useCallback(
    (e: WheelEvent) => {
      // If the ctrlKey is pressed, this is a zoom event, do nothing.
      if (e.ctrlKey) {
        return;
      }

      // stop scrolling the page
      e.preventDefault();
      e.stopPropagation();

      if (onScroll) {
        onScroll({ deltaX: e.deltaX, deltaY: e.deltaY });
      }
    },
    [onScroll]
  );

  useEvent(ref, "wheel", isDisabled ? undefined : onScrollHandler);
}
