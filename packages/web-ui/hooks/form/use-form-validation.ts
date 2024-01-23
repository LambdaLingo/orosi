import { type RefObject, useEffect } from "react";
import type {
  FormValidationState,
  ValidationResult,
  ValidatableElement,
  FormValidationProps,
} from "types";
import { setInteractionModality } from "hooks/interactions";
import { useEffectEvent, useLayoutEffect } from "hooks/shared";

export function useFormValidation<T>(
  props: FormValidationProps<T>,
  state: FormValidationState,
  ref: RefObject<ValidatableElement> | undefined
): void {
  const { validationBehavior, focus } = props;

  // This is a useLayoutEffect so that it runs before the useEffect in useFormValidationState, which commits the validation change.
  useLayoutEffect(() => {
    if (validationBehavior === "native" && ref?.current) {
      const errorMessage = state.realtimeValidation.isInvalid
        ? state.realtimeValidation.validationErrors.join(" ") ||
          "Invalid value."
        : "";
      ref.current.setCustomValidity(errorMessage);

      // Prevent default tooltip for validation message.
      // https://bugzilla.mozilla.org/show_bug.cgi?id=605277
      if (!ref.current.hasAttribute("title")) {
        ref.current.title = "";
      }

      if (!state.realtimeValidation.isInvalid) {
        state.updateValidation(getNativeValidity(ref.current));
      }
    }
  });

  const onReset = useEffectEvent(() => {
    state.resetValidation();
  });

  const onInvalid = useEffectEvent((e: Event) => {
    // Only commit validation if we are not already displaying one.
    // This avoids clearing server errors that the user didn't actually fix.
    if (!state.displayValidation.isInvalid) {
      state.commitValidation();
    }

    // Auto focus the first invalid input in a form, unless the error already had its default prevented.
    const form = ref?.current?.form;
    if (
      !e.defaultPrevented &&
      ref &&
      form &&
      getFirstInvalidInput(form) === ref.current
    ) {
      if (focus) {
        focus();
      } else {
        ref.current?.focus();
      }

      // Always show focus ring.
      setInteractionModality("keyboard");
    }

    // Prevent default browser error UI from appearing.
    e.preventDefault();
  });

  const onChange = useEffectEvent(() => {
    state.commitValidation();
  });

  useEffect(() => {
    const input = ref?.current;
    if (!input) {
      return;
    }

    const form = input.form;
    input.addEventListener("invalid", onInvalid);
    input.addEventListener("change", onChange);
    form?.addEventListener("reset", onReset);
    return () => {
      input!.removeEventListener("invalid", onInvalid);
      input!.removeEventListener("change", onChange);
      form?.removeEventListener("reset", onReset);
    };
  }, [ref, onInvalid, onChange, onReset, validationBehavior]);
}

function getValidity(input: ValidatableElement): ValidityState {
  // The native ValidityState object is live, meaning each property is a getter that returns the current state.
  // We need to create a snapshot of the validity state at the time this function is called to avoid unpredictable React renders.
  const validity = input.validity;
  return {
    badInput: validity.badInput,
    customError: validity.customError,
    patternMismatch: validity.patternMismatch,
    rangeOverflow: validity.rangeOverflow,
    rangeUnderflow: validity.rangeUnderflow,
    stepMismatch: validity.stepMismatch,
    tooLong: validity.tooLong,
    tooShort: validity.tooShort,
    typeMismatch: validity.typeMismatch,
    valueMissing: validity.valueMissing,
    valid: validity.valid,
  };
}

function getNativeValidity(input: ValidatableElement): ValidationResult {
  return {
    isInvalid: !input.validity.valid,
    validationDetails: getValidity(input),
    validationErrors: input.validationMessage ? [input.validationMessage] : [],
  };
}

function getFirstInvalidInput(
  form: HTMLFormElement
): ValidatableElement | null {
  for (const element of Array.from(form.elements) as ValidatableElement[]) {
    if (!element.validity.valid) {
      return element;
    }
  }

  return null;
}
