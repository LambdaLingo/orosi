import type {
  AriaLabelingProps,
  DOMProps,
  FocusableProps,
  FormValidationState,
  HelpTextProps,
  InputBase,
  LabelableProps,
  RangeInputBase,
  TextInputBase,
  TextInputDOMEvents,
  Validation,
  ValueBase,
} from "types";

export type NumberFieldProps = {
  /**
   * Formatting options for the value displayed in the number field.
   * This also affects what characters are allowed to be typed by the user.
   */
  formatOptions?: Intl.NumberFormatOptions;
} & InputBase &
  Validation<number> &
  FocusableProps &
  TextInputBase &
  ValueBase<number> &
  RangeInputBase<number> &
  LabelableProps &
  HelpTextProps;

export type AriaNumberFieldProps = {
  /** A custom aria-label for the decrement button. If not provided, the localized string "Decrement" is used. */
  decrementAriaLabel?: string;
  /** A custom aria-label for the increment button. If not provided, the localized string "Increment" is used. */
  incrementAriaLabel?: string;
} & NumberFieldProps &
  DOMProps &
  AriaLabelingProps &
  TextInputDOMEvents;
export type NumberFieldState = {
  /**
   * The current text value of the input. Updated as the user types,
   * and formatted according to `formatOptions` on blur.
   */
  inputValue: string;
  /**
   * The currently parsed number value, or NaN if a valid number could not be parsed.
   * Updated based on the `inputValue` as the user types.
   */
  numberValue: number;
  /** The minimum value of the number field. */
  minValue?: number;
  /** The maximum value of the number field. */
  maxValue?: number;
  /** Whether the current value can be incremented according to the maximum value and step. */
  canIncrement: boolean;
  /** Whether the current value can be decremented according to the minimum value and step. */
  canDecrement: boolean;
  /**
   * Validates a user input string according to the current locale and format options.
   * Values can be partially entered, and may be valid even if they cannot currently be parsed to a number.
   * Can be used to implement validation as a user types.
   */
  validate: (value: string) => boolean;
  /** Sets the current text value of the input. */
  setInputValue: (val: string) => void;
  /** Sets the number value. */
  setNumberValue: (val: number) => void;
  /**
   * Commits the current input value. The value is parsed to a number, clamped according
   * to the minimum and maximum values of the field, and snapped to the nearest step value.
   * This will fire the `onChange` prop with the new value, and if uncontrolled, update the `numberValue`.
   * Typically this is called when the field is blurred.
   */
  commit: () => void;
  /** Increments the current input value to the next step boundary, and fires `onChange`. */
  increment: () => void;
  /** Decrements the current input value to the next step boundary, and fires `onChange`. */
  decrement: () => void;
  /** Sets the current value to the `maxValue` if any, and fires `onChange`. */
  incrementToMax: () => void;
  /** Sets the current value to the `minValue` if any, and fires `onChange`. */
  decrementToMin: () => void;
} & FormValidationState;

export type NumberFieldStateOptions = {
  /**
   * The locale that should be used for parsing.
   * @default 'en-US'
   */
  locale: string;
} & NumberFieldProps;
