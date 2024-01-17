import type {
  AriaLabelingProps,
  AriaValidationProps,
  FocusableDOMProps,
  FocusableProps,
  FocusableRefValue,
  HelpTextProps,
  InputBase,
  LabelableProps,
  TextInputBase,
  TextInputDOMProps,
  Validation,
  ValueBase,
} from "types";

export type TextFieldProps = InputBase &
  Validation<string> &
  HelpTextProps &
  FocusableProps &
  TextInputBase &
  ValueBase<string> &
  LabelableProps;

export type AriaTextFieldProps = {
  // https://www.w3.org/TR/wai-aria-1.2/#textbox
  /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
  "aria-activedescendant"?: string;
  /**
   * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
   * presented if they are made.
   */
  "aria-autocomplete"?: "none" | "inline" | "list" | "both";
  /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
  "aria-haspopup"?:
    | boolean
    | "false"
    | "true"
    | "menu"
    | "listbox"
    | "tree"
    | "grid"
    | "dialog";
} & TextFieldProps &
  AriaLabelingProps &
  FocusableDOMProps &
  TextInputDOMProps &
  AriaValidationProps;
export type TextFieldRef = {
  select: () => void;
  getInputElement: () => HTMLInputElement | HTMLTextAreaElement | null;
} & FocusableRefValue<HTMLInputElement | HTMLTextAreaElement, HTMLDivElement>;
