import type {
  CheckboxGroupState,
  CheckboxGroupProps,
  ValidationResult,
} from "types";
import { useFormValidationState, mergeValidation } from "hooks/form";
import { useControlledState } from "hooks/shared";
import { useRef } from "react";

/**
 * Provides state management for a checkbox group component. Provides a name for the group,
 * and manages selection and focus state.
 */
export function useCheckboxGroupState(
  props: CheckboxGroupProps = {}
): CheckboxGroupState {
  const [selectedValues, setValue] = useControlledState(
    props.value,
    props.defaultValue || [],
    props.onChange
  );
  const isRequired = !!props.isRequired && selectedValues.length === 0;

  const invalidValues = useRef(new Map<string, ValidationResult>());
  const validation = useFormValidationState({
    ...props,
    value: selectedValues,
  });

  const isInvalid = validation.displayValidation.isInvalid;
  const state: CheckboxGroupState = {
    ...validation,
    value: selectedValues,
    setValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }

      setValue(value);
    },
    isDisabled: props.isDisabled || false,
    isReadOnly: props.isReadOnly || false,
    isSelected(value) {
      return selectedValues.includes(value);
    },
    addValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }
      if (!selectedValues.includes(value)) {
        setValue(selectedValues.concat(value));
      }
    },
    removeValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }
      if (selectedValues.includes(value)) {
        setValue(
          selectedValues.filter((existingValue) => existingValue !== value)
        );
      }
    },
    toggleValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }
      if (selectedValues.includes(value)) {
        setValue(
          selectedValues.filter((existingValue) => existingValue !== value)
        );
      } else {
        setValue(selectedValues.concat(value));
      }
    },
    setInvalid(value, v) {
      const s = new Map(invalidValues.current);
      if (v.isInvalid) {
        s.set(value, v);
      } else {
        s.delete(value);
      }

      invalidValues.current = s;
      validation.updateValidation(mergeValidation(...s.values()));
    },
    validationState: props.validationState ?? (isInvalid ? "invalid" : null),
    isInvalid,
    isRequired,
  };

  return state;
}
