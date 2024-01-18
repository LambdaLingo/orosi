import type {
  AriaLabelingProps,
  AriaValidationProps,
  DOMProps,
  FocusableProps,
  FocusEvents,
  HelpTextProps,
  InputBase,
  InputDOMProps,
  LabelableProps,
  Orientation,
  Validation,
  ValueBase,
} from "types";
import type { ReactNode } from "react";

export type RadioGroupProps = {
  /**
   * The axis the Radio Button(s) should align with.
   * @default 'vertical'
   */
  orientation?: Orientation;
} & ValueBase<string> &
  InputBase &
  InputDOMProps &
  Validation<string | null> &
  LabelableProps &
  HelpTextProps &
  FocusEvents;

export type RadioProps = {
  /**
   * The value of the radio button, used when submitting an HTML form.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio#Value).
   */
  value: string;
  /**
   * The label for the Radio. Accepts any renderable node.
   */
  children?: ReactNode;
  /**
   * Whether the radio button is disabled or not.
   * Shows that a selection exists, but is not available in that circumstance.
   */
  isDisabled?: boolean;
} & FocusableProps;

export type AriaRadioGroupProps = RadioGroupProps &
  DOMProps &
  AriaLabelingProps &
  AriaValidationProps;

export type AriaRadioProps = RadioProps & DOMProps & AriaLabelingProps;
