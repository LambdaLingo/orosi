export type ValidationError = string | string[];
export type ValidationErrors = Record<string, ValidationError>;
export type ValidationResult = {
  /** Whether the input value is invalid. */
  isInvalid: boolean;
  /** The current error messages for the input if it is invalid, otherwise an empty array. */
  validationErrors: string[];
  /** The native validation details for the input. */
  validationDetails: ValidityState;
};
