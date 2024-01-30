export type OverlayTriggerState = {
  /** Whether the overlay is currently open. */
  readonly isOpen: boolean;
  /** Sets whether the overlay is open. */
  setOpen: (isOpen: boolean) => void;
  /** Opens the overlay. */
  open: () => void;
  /** Closes the overlay. */
  close: () => void;
  /** Toggles the overlay's visibility. */
  toggle: () => void;
};
