import type { RadioGroupProps, RadioGroupState } from "types";
import { useFormValidationState } from "hooks/form";
import { useControlledState } from "hooks/shared";
import { useMemo, useState } from "react";

const instance = Math.round(Math.random() * 10000000000);
let i = 0;

/**
 * Provides state management for a radio group component. Provides a name for the group,
 * and manages selection and focus state.
 */
export function useRadioGroupState(props: RadioGroupProps): RadioGroupState {
  // Preserved here for backward compatibility. React Aria now generates the name instead of stately.
  const name = useMemo(
    () => props.name || `radio-group-${instance}-${++i}`,
    [props.name]
  );
  const [selectedValue, setSelected] = useControlledState(
    props.value,
    props.defaultValue ?? null,
    props.onChange
  );
  const [lastFocusedValue, setLastFocusedValue] = useState<string | null>(null);

  const validation = useFormValidationState({
    ...props,
    value: selectedValue,
  });

  const setSelectedValue = (value: string | null): void => {
    if (!props.isReadOnly && !props.isDisabled) {
      setSelected(value);
      validation.commitValidation();
    }
  };

  const isInvalid = validation.displayValidation.isInvalid;

  return {
    ...validation,
    name,
    selectedValue,
    setSelectedValue,
    lastFocusedValue,
    setLastFocusedValue,
    isDisabled: props.isDisabled || false,
    isReadOnly: props.isReadOnly || false,
    isRequired: props.isRequired || false,
    validationState: props.validationState || (isInvalid ? "invalid" : null),
    isInvalid,
  };
}
