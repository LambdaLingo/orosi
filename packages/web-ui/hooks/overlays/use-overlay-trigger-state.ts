import { useCallback } from "react";
import type { OverlayTriggerProps } from "types/overlays";
import { useControlledState } from "hooks/shared";

export interface OverlayTriggerState {
  /** Whether the overlay is currently open. */
  readonly isOpen: boolean;
  /** Sets whether the overlay is open. */
  setOpen(isOpen: boolean): void;
  /** Opens the overlay. */
  open(): void;
  /** Closes the overlay. */
  close(): void;
  /** Toggles the overlay's visibility. */
  toggle(): void;
}

/**
 * Manages state for an overlay trigger. Tracks whether the overlay is open, and provides
 * methods to toggle this state.
 */
export function useOverlayTriggerState(
  props: OverlayTriggerProps
): OverlayTriggerState {
  let [isOpen, setOpen] = useControlledState(
    props.isOpen,
    props.defaultOpen || false,
    props.onOpenChange
  );

  const open = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const toggle = useCallback(() => {
    setOpen(!isOpen);
  }, [setOpen, isOpen]);

  return {
    isOpen,
    setOpen,
    open,
    close,
    toggle,
  };
}
