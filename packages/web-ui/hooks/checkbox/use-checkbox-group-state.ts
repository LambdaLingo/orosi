import type {
  FormValidationState,
  CheckboxGroupProps,
  ValidationResult,
  ValidationState,
} from "types";
import { useFormValidationState, mergeValidation } from "hooks/form";
import { useControlledState } from "hooks/shared";
import { useRef } from "react";

export type CheckboxGroupState = {
  /** Current selected values. */
  readonly value: readonly string[];

  /** Whether the checkbox group is disabled. */
  readonly isDisabled: boolean;

  /** Whether the checkbox group is read only. */
  readonly isReadOnly: boolean;

  /**
   * The current validation state of the checkbox group.
   * @deprecated Use `isInvalid` instead.
   */
  readonly validationState: ValidationState | null;

  /** Whether the checkbox group is invalid. */
  readonly isInvalid: boolean;

  /**
   * Whether the checkboxes in the group are required.
   * This changes to false once at least one item is selected.
   */
  readonly isRequired: boolean;

  /** Returns whether the given value is selected. */
  isSelected: (value: string) => boolean;

  /** Sets the selected values. */
  setValue: (value: string[]) => void;

  /** Adds a value to the set of selected values. */
  addValue: (value: string) => void;

  /** Removes a value from the set of selected values. */
  removeValue: (value: string) => void;

  /** Toggles a value in the set of selected values. */
  toggleValue: (value: string) => void;

  /** Sets whether one of the checkboxes is invalid. */
  setInvalid: (value: string, validation: ValidationResult) => void;
} & FormValidationState;

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
