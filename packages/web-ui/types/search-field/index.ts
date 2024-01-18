import type { AriaTextFieldProps, TextFieldProps } from "types";

export type SearchFieldProps = {
  /** Handler that is called when the SearchField is submitted. */
  onSubmit?: (value: string) => void;

  /** Handler that is called when the clear button is pressed. */
  onClear?: () => void;
} & TextFieldProps;

export type AriaSearchFieldProps = SearchFieldProps & AriaTextFieldProps;

export type SearchFieldState = {
  /** The current value of the search field. */
  readonly value: string;

  /** Sets the value of the search field. */
  setValue: (value: string) => void;
};
