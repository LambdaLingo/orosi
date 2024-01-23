import { createContext } from "react";
import type { ValidationErrors, ValidationResult } from "types";

export const FormValidationContext = createContext<ValidationErrors>({});

export const VALID_VALIDITY_STATE: ValidityState = {
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valueMissing: false,
  valid: true,
};

export const CUSTOM_VALIDITY_STATE: ValidityState = {
  ...VALID_VALIDITY_STATE,
  customError: true,
  valid: false,
};

export const DEFAULT_VALIDATION_RESULT: ValidationResult = {
  isInvalid: false,
  validationDetails: VALID_VALIDITY_STATE,
  validationErrors: [],
};

export const privateValidationStateProp = `__formValidationState${Date.now()}`;
