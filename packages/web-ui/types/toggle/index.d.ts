import type { ReactNode } from "react";
import type {
  AriaLabelingProps,
  AriaValidationProps,
  FocusableDOMProps,
  FocusableProps,
  InputBase,
  InputDOMProps,
  Validation,
} from "types/shared";

export type ToggleProps = {
  /**
   * The label for the element.
   */
  children?: ReactNode;
  /**
   * Whether the element should be selected (uncontrolled).
   */
  defaultSelected?: boolean;
  /**
   * Whether the element should be selected (controlled).
   */
  isSelected?: boolean;
  /**
   * Handler that is called when the element's selection state changes.
   */
  onChange?: (isSelected: boolean) => void;
  /**
   * The value of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue).
   */
  value?: string;
} & InputBase &
  Validation<boolean> &
  FocusableProps;

export type AriaToggleProps = {
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   */
  "aria-controls"?: string;
} & ToggleProps &
  FocusableDOMProps &
  AriaLabelingProps &
  AriaValidationProps &
  InputDOMProps;

export type ToggleStateOptions = Omit<ToggleProps, "children">;

export type ToggleState = {
  /** Whether the toggle is selected. */
  readonly isSelected: boolean;

  /** Updates selection state. */
  setSelected: (isSelected: boolean) => void;

  /** Toggle the selection state. */
  toggle: () => void;
};
