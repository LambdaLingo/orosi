import type {
  AriaLabelingProps,
  AriaValidationProps,
  DOMProps,
  FocusableProps,
  FocusEvents,
  FormValidationState,
  HelpTextProps,
  InputBase,
  InputDOMProps,
  LabelableProps,
  Orientation,
  Validation,
  ValidationState,
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

export interface RadioGroupState extends FormValidationState {
  /**
   * The name for the group, used for native form submission.
   * @deprecated
   * @private
   */
  readonly name: string;

  /** Whether the radio group is disabled. */
  readonly isDisabled: boolean;

  /** Whether the radio group is read only. */
  readonly isReadOnly: boolean;

  /** Whether the radio group is required. */
  readonly isRequired: boolean;

  /**
   * Whether the radio group is valid or invalid.
   * @deprecated Use `isInvalid` instead.
   */
  readonly validationState: ValidationState | null;

  /** Whether the radio group is invalid. */
  readonly isInvalid: boolean;

  /** The currently selected value. */
  readonly selectedValue: string | null;

  /** Sets the selected value. */
  setSelectedValue: (value: string | null) => void;

  /** The value of the last focused radio. */
  readonly lastFocusedValue: string | null;

  /** Sets the last focused value. */
  setLastFocusedValue: (value: string | null) => void;
}

export type RadioGroupData = {
  name: string;
  descriptionId: string | undefined;
  errorMessageId: string | undefined;
  validationBehavior: "aria" | "native";
};
