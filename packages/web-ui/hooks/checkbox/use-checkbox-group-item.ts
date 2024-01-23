import { type RefObject, useEffect, useRef } from "react";
import type {
  AriaCheckboxGroupItemProps,
  CheckboxGroupState,
  ValidationResult,
} from "types";
import {
  checkboxGroupData,
  DEFAULT_VALIDATION_RESULT,
  privateValidationStateProp,
} from "store";
import { useFormValidationState } from "hooks/form";
import { useToggleState } from "hooks/toggle";
import { type CheckboxAria, useCheckbox } from "./use-checkbox";

/**
 * Provides the behavior and accessibility implementation for a checkbox component contained within a checkbox group.
 * Checkbox groups allow users to select multiple items from a list of options.
 * @param props - Props for the checkbox.
 * @param state - State for the checkbox, as returned by `useCheckboxGroupState`.
 * @param inputRef - A ref for the HTML input element.
 */
export function useCheckboxGroupItem(
  props: AriaCheckboxGroupItemProps,
  state: CheckboxGroupState,
  inputRef: RefObject<HTMLInputElement>
): CheckboxAria {
  const toggleState = useToggleState({
    isReadOnly: props.isReadOnly || state.isReadOnly,
    isSelected: state.isSelected(props.value),
    onChange(isSelected) {
      if (isSelected) {
        state.addValue(props.value);
      } else {
        state.removeValue(props.value);
      }

      if (props.onChange) {
        props.onChange(isSelected);
      }
    },
  });

  let { name, descriptionId, errorMessageId, validationBehavior } =
    checkboxGroupData.get(state)!;
  validationBehavior = props.validationBehavior ?? validationBehavior;

  // Local validation for this checkbox.
  const { realtimeValidation } = useFormValidationState({
    ...props,
    value: toggleState.isSelected,
    // Server validation is handled at the group level.
    name: undefined,
    validationBehavior: "aria",
  });

  // Update the checkbox group state when realtime validation changes.
  const nativeValidation = useRef(DEFAULT_VALIDATION_RESULT);
  const updateValidation = () => {
    state.setInvalid(
      props.value,
      realtimeValidation.isInvalid
        ? realtimeValidation
        : nativeValidation.current
    );
  };

  useEffect(updateValidation);

  // Combine group and checkbox level validation.
  const combinedRealtimeValidation = state.realtimeValidation.isInvalid
    ? state.realtimeValidation
    : realtimeValidation;
  const displayValidation =
    validationBehavior === "native"
      ? state.displayValidation
      : combinedRealtimeValidation;

  const res = useCheckbox(
    {
      ...props,
      isReadOnly: props.isReadOnly || state.isReadOnly,
      isDisabled: props.isDisabled || state.isDisabled,
      name: props.name || name,
      isRequired: props.isRequired ?? state.isRequired,
      validationBehavior,
      [privateValidationStateProp]: {
        realtimeValidation: combinedRealtimeValidation,
        displayValidation,
        resetValidation: state.resetValidation,
        commitValidation: state.commitValidation,
        updateValidation(v: ValidationResult) {
          nativeValidation.current = v;
          updateValidation();
        },
      },
    },
    toggleState,
    inputRef
  );

  return {
    ...res,
    inputProps: {
      ...res.inputProps,
      "aria-describedby":
        [
          props["aria-describedby"],
          state.isInvalid ? errorMessageId : null,
          descriptionId,
        ]
          .filter(Boolean)
          .join(" ") || undefined,
    },
  };
}
