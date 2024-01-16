import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { FormValidationContext } from "store";
import type {
  ValidationFunction,
  ValidationResult,
  Validation,
  FormValidationState,
} from "types";

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

const CUSTOM_VALIDITY_STATE: ValidityState = {
  ...VALID_VALIDITY_STATE,
  customError: true,
  valid: false,
};

export const DEFAULT_VALIDATION_RESULT: ValidationResult = {
  isInvalid: false,
  validationDetails: VALID_VALIDITY_STATE,
  validationErrors: [],
};

export const privateValidationStateProp = "__formValidationState" + Date.now();

type FormValidationProps<T> = {
  builtinValidation?: ValidationResult;
  name?: string | string[];
  value: T;
} & Validation<T>;

export function useFormValidationState<T>(
  props: FormValidationProps<T>
): FormValidationState {
  // Private prop for parent components to pass state to children.
  if (props[privateValidationStateProp]) {
    const {
      realtimeValidation,
      displayValidation,
      updateValidation,
      resetValidation,
      commitValidation,
    } = props[privateValidationStateProp] as FormValidationState;
    return {
      realtimeValidation,
      displayValidation,
      updateValidation,
      resetValidation,
      commitValidation,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useFormValidationStateImpl(props);
}

function useFormValidationStateImpl<T>(
  props: FormValidationProps<T>
): FormValidationState {
  let {
    isInvalid,
    validationState,
    name,
    value,
    builtinValidation,
    validate,
    validationBehavior = "aria",
  } = props;

  // backward compatibility.
  if (validationState) {
    isInvalid ||= validationState === "invalid";
  }

  // If the isInvalid prop is true, update validation result in realtime (controlled).
  const controlledError: ValidationResult | null = isInvalid
    ? {
        isInvalid: true,
        validationErrors: [],
        validationDetails: CUSTOM_VALIDITY_STATE,
      }
    : null;

  // Perform custom client side validation.
  const clientError: ValidationResult | null = useMemo(
    () => getValidationResult(runValidate(validate, value)),
    [validate, value]
  );

  if (builtinValidation?.validationDetails.valid) {
    builtinValidation = null;
  }

  // Get relevant server errors from the form.
  const serverErrors = useContext(FormValidationContext);
  const serverErrorMessages = useMemo(() => {
    if (name) {
      return Array.isArray(name)
        ? name.flatMap((name) => asArray(serverErrors[name]))
        : asArray(serverErrors[name]);
    }
    return [];
  }, [serverErrors, name]);

  // Show server errors when the form gets a new value, and clear when the user changes the value.
  const [lastServerErrors, setLastServerErrors] = useState(serverErrors);
  const [isServerErrorCleared, setServerErrorCleared] = useState(false);
  if (serverErrors !== lastServerErrors) {
    setLastServerErrors(serverErrors);
    setServerErrorCleared(false);
  }

  const serverError: ValidationResult | null = useMemo(
    () => getValidationResult(isServerErrorCleared ? [] : serverErrorMessages),
    [isServerErrorCleared, serverErrorMessages]
  );

  // Track the next validation state in a ref until commitValidation is called.
  const nextValidation = useRef(DEFAULT_VALIDATION_RESULT);
  const [currentValidity, setCurrentValidity] = useState(
    DEFAULT_VALIDATION_RESULT
  );

  const lastError = useRef(DEFAULT_VALIDATION_RESULT);
  const commitValidation = () => {
    if (!commitQueued) {
      return;
    }

    setCommitQueued(false);
    let error = clientError || builtinValidation || nextValidation.current;
    if (!isEqualValidation(error, lastError.current)) {
      lastError.current = error;
      setCurrentValidity(error);
    }
  };

  const [commitQueued, setCommitQueued] = useState(false);
  useEffect(commitValidation);

  // realtimeValidation is used to update the native input element's state based on custom validation logic.
  // displayValidation is the currently displayed validation state that the user sees (e.g. on input change/form submit).
  // With validationBehavior="aria", all errors are displayed in realtime rather than on submit.
  const realtimeValidation =
    controlledError ||
    serverError ||
    clientError ||
    builtinValidation ||
    DEFAULT_VALIDATION_RESULT;
  const displayValidation =
    validationBehavior === "native"
      ? controlledError || serverError || currentValidity
      : controlledError ||
        serverError ||
        clientError ||
        builtinValidation ||
        currentValidity;

  return {
    realtimeValidation,
    displayValidation,
    updateValidation(value) {
      // If validationBehavior is 'aria', update in realtime. Otherwise, store in a ref until commit.
      if (
        validationBehavior === "aria" &&
        !isEqualValidation(currentValidity, value)
      ) {
        setCurrentValidity(value);
      } else {
        nextValidation.current = value;
      }
    },
    resetValidation() {
      // Update the currently displayed validation state to valid on form reset,
      // even if the native validity says it isn't. It'll show again on the next form submit.
      const error = DEFAULT_VALIDATION_RESULT;
      if (!isEqualValidation(error, lastError.current)) {
        lastError.current = error;
        setCurrentValidity(error);
      }

      // Do not commit validation after the next render. This avoids a condition where
      // useSelect calls commitValidation inside an onReset handler.
      if (validationBehavior === "native") {
        setCommitQueued(false);
      }

      setServerErrorCleared(true);
    },
    commitValidation() {
      // Commit validation state so the user sees it on blur/change/submit. Also clear any server errors.
      // Wait until after the next render to commit so that the latest value has been validated.
      if (validationBehavior === "native") {
        setCommitQueued(true);
      }
      setServerErrorCleared(true);
    },
  };
}

function asArray<T>(v: T | T[]): T[] {
  if (!v) {
    return [];
  }

  return Array.isArray(v) ? v : [v];
}

function runValidate<T>(validate: ValidationFunction<T>, value: T): string[] {
  if (typeof validate === "function") {
    const e = validate(value);
    if (e && typeof e !== "boolean") {
      return asArray(e);
    }
  }

  return [];
}

function getValidationResult(errors: string[]): ValidationResult | null {
  return errors.length
    ? {
        isInvalid: true,
        validationErrors: errors,
        validationDetails: CUSTOM_VALIDITY_STATE,
      }
    : null;
}

function isEqualValidation(
  a: ValidationResult | null,
  b: ValidationResult | null
): boolean {
  if (a === b) {
    return true;
  }

  return (
    a &&
    b &&
    a.isInvalid === b.isInvalid &&
    a.validationErrors.length === b.validationErrors.length &&
    a.validationErrors.every((a, i) => a === b.validationErrors[i]) &&
    Object.entries(a.validationDetails).every(
      ([k, v]) => b.validationDetails[k] === v
    )
  );
}

export function mergeValidation(
  ...results: ValidationResult[]
): ValidationResult {
  const errors = new Set<string>();
  let isInvalid = false;
  const validationDetails = {
    ...VALID_VALIDITY_STATE,
  };

  for (const v of results) {
    for (const e of v.validationErrors) {
      errors.add(e);
    }

    // Only these properties apply for checkboxes.
    isInvalid ||= v.isInvalid;
    for (const key in validationDetails) {
      validationDetails[key] ||= v.validationDetails[key];
    }
  }

  validationDetails.valid = !isInvalid;
  return {
    isInvalid,
    validationErrors: [...errors],
    validationDetails,
  };
}
