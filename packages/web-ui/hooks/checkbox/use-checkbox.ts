import {
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type RefObject,
  useEffect,
} from "react";
import type { AriaCheckboxProps, ToggleState, ValidationResult } from "types";
import { useFormValidation, useFormValidationState } from "hooks/form";
import { useToggle } from "hooks/toggle";

export type CheckboxAria = {
  /** Props for the label wrapper element. */
  labelProps: LabelHTMLAttributes<HTMLLabelElement>;
  /** Props for the input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  /** Whether the checkbox is selected. */
  isSelected: boolean;
  /** Whether the checkbox is in a pressed state. */
  isPressed: boolean;
  /** Whether the checkbox is disabled. */
  isDisabled: boolean;
  /** Whether the checkbox is read only. */
  isReadOnly: boolean;
} & ValidationResult;

/**
 * Provides the behavior and accessibility implementation for a checkbox component.
 * Checkboxes allow users to select multiple items from a list of individual items, or
 * to mark one individual item as selected.
 * @param props - Props for the checkbox.
 * @param state - State for the checkbox, as returned by `useToggleState`.
 * @param inputRef - A ref for the HTML input element.
 */
export function useCheckbox(
  props: AriaCheckboxProps,
  state: ToggleState,
  inputRef: RefObject<HTMLInputElement>
): CheckboxAria {
  // Create validation state here because it doesn't make sense to add to general useToggleState.
  const validationState = useFormValidationState({
    ...props,
    value: state.isSelected,
  });
  const { isInvalid, validationErrors, validationDetails } =
    validationState.displayValidation;
  const {
    labelProps,
    inputProps,
    isSelected,
    isPressed,
    isDisabled,
    isReadOnly,
  } = useToggle(
    {
      ...props,
      isInvalid,
    },
    state,
    inputRef
  );

  useFormValidation(props, validationState, inputRef);

  const { isIndeterminate, isRequired, validationBehavior = "aria" } = props;
  useEffect(() => {
    // indeterminate is a property, but it can only be set via javascript
    // https://css-tricks.com/indeterminate-checkboxes/
    if (inputRef.current) {
      inputRef.current.indeterminate = !!isIndeterminate;
    }
  });

  return {
    labelProps,
    inputProps: {
      ...inputProps,
      checked: isSelected,
      "aria-required":
        (isRequired && validationBehavior === "aria") || undefined,
      required: isRequired && validationBehavior === "native",
    },
    isSelected,
    isPressed,
    isDisabled,
    isReadOnly,
    isInvalid,
    validationErrors,
    validationDetails,
  };
}
