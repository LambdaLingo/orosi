import type {
  AriaLabelingProps,
  AriaValidationProps,
  DOMProps,
  FocusableDOMProps,
  FocusableProps,
  HelpTextProps,
  InputBase,
  InputDOMProps,
  LabelableProps,
  Validation,
  ValueBase,
} from "types";
import type { ReactNode } from "react";

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

export type CheckboxGroupProps = ValueBase<string[]> &
  InputBase &
  InputDOMProps &
  LabelableProps &
  HelpTextProps &
  Validation<string[]>;

export type CheckboxProps = {
  /**
   * Indeterminism is presentational only.
   * The indeterminate visual representation remains regardless of user interaction.
   */
  isIndeterminate?: boolean;
} & ToggleProps;

export type AriaCheckboxProps = CheckboxProps & AriaToggleProps;

export type AriaCheckboxGroupProps = CheckboxGroupProps &
  DOMProps &
  AriaLabelingProps &
  AriaValidationProps;

export type AriaCheckboxGroupItemProps = {
  value: string;
} & Omit<AriaCheckboxProps, "isSelected" | "defaultSelected">;
