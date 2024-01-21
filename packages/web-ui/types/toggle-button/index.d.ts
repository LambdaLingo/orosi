import type { ButtonProps, ButtonUIStates } from "types";

export type ToggleButtonUIStates = {
  /**
   * Whether the button is currently selected.
   * @selector [data-selected]
   */
  isSelected: boolean;
  /**
   * State of the toggle button.
   */
  state: ToggleState;
} & ButtonUIStates;

type ToggleButtonProps = {
  /** Whether the element should be selected (controlled). */
  isSelected?: boolean;
  /** Whether the element should be selected (uncontrolled). */
  defaultSelected?: boolean;
  /** Handler that is called when the element's selection state changes. */
  onChange?: (isSelected: boolean) => void;
} & ButtonProps;
