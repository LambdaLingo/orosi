import type { ReactNode } from "react";

export type ValidationState = "valid" | "invalid";

export type ValidationError = string | string[];
export type ValidationErrors = Record<string, ValidationError>;
export type ValidationFunction<T> = (
  value: T
) => ValidationError | true | null | undefined;

export type Validation<T> = {
  /** Whether user input is required on the input before form submission. */
  isRequired?: boolean;
  /** Whether the input value is invalid. */
  isInvalid?: boolean;
  /** @deprecated Use `isInvalid` instead. */
  validationState?: ValidationState;
  /**
   * Whether to use native HTML form validation to prevent form submission
   * when the value is missing or invalid, or mark the field as required
   * or invalid via ARIA.
   * @default 'aria'
   */
  validationBehavior?: "aria" | "native";
  /**
   * A function that returns an error message if a given value is invalid.
   * Validation errors are displayed to the user when the form is submitted
   * if `validationBehavior="native"`. For realtime validation, use the `isInvalid`
   * prop instead.
   */
  validate?: (value: T) => ValidationError | true | null | undefined;
};

export type ValidationResult = {
  /** Whether the input value is invalid. */
  isInvalid: boolean;
  /** The current error messages for the input if it is invalid, otherwise an empty array. */
  validationErrors: string[];
  /** The native validation details for the input. */
  validationDetails: ValidityState;
};

export type SpectrumFieldValidation<T> = {
  /** Whether the input should display its "valid" or "invalid" visual styling. */
  validationState?: ValidationState;
} & Omit<Validation<T>, "isInvalid" | "validationState">;

export type InputBase = {
  /** Whether the input is disabled. */
  isDisabled?: boolean;
  /** Whether the input can be selected but not changed by the user. */
  isReadOnly?: boolean;
};

export type ValueBase<T, C = T> = {
  /** The current value (controlled). */
  value?: T;
  /** The default value (uncontrolled). */
  defaultValue?: T;
  /** Handler that is called when the value changes. */
  onChange?: (value: C) => void;
};

export type TextInputBase = {
  /** Temporary text that occupies the text input when it is empty. */
  placeholder?: string;
};

export type SpectrumTextInputBase = {
  /**
   * Temporary text that occupies the text input when it is empty.
   * Please use help text instead.
   * @deprecated
   **/
  placeholder?: string;
};

export type RangeValue<T> = {
  /** The start value of the range. */
  start: T;
  /** The end value of the range. */
  end: T;
};

export type RangeInputBase<T> = {
  /** The smallest value allowed for the input. */
  minValue?: T;
  /** The largest value allowed for the input. */
  maxValue?: T;
  /** The amount that the input value changes with each increment or decrement "tick". */
  step?: T; // ??
};

export type HelpTextProps = {
  /** A description for the field. Provides a hint such as specific requirements for what to choose. */
  description?: ReactNode;
  /** An error message for the field. */
  errorMessage?: ReactNode | ((v: ValidationResult) => ReactNode);
};
