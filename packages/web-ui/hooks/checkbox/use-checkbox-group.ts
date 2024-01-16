import type {
  AriaCheckboxGroupProps,
  CheckboxGroupState,
  DOMAttributes,
  ValidationResult,
} from "types";
import { filterDOMProps, mergeProps } from "utilities";
import { useField } from "hooks/label/use-field";
import { checkboxGroupData } from "store";

export type CheckboxGroupAria = {
  /** Props for the checkbox group wrapper element. */
  groupProps: DOMAttributes;
  /** Props for the checkbox group's visible label (if any). */
  labelProps: DOMAttributes;
  /** Props for the checkbox group description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the checkbox group error message element, if any. */
  errorMessageProps: DOMAttributes;
} & ValidationResult;

/**
 * Provides the behavior and accessibility implementation for a checkbox group component.
 * Checkbox groups allow users to select multiple items from a list of options.
 * @param props - Props for the checkbox group.
 * @param state - State for the checkbox group, as returned by `useCheckboxGroupState`.
 */
export function useCheckboxGroup(
  props: AriaCheckboxGroupProps,
  state: CheckboxGroupState
): CheckboxGroupAria {
  const { isDisabled, name, validationBehavior = "aria" } = props;
  const { isInvalid, validationErrors, validationDetails } =
    state.displayValidation;

  const { labelProps, fieldProps, descriptionProps, errorMessageProps } =
    useField({
      ...props,
      // Checkbox group is not an HTML input element so it
      // shouldn't be labeled by a <label> element.
      labelElementType: "span",
      isInvalid,
      errorMessage: props.errorMessage || validationErrors,
    });

  checkboxGroupData.set(state, {
    name,
    descriptionId: descriptionProps.id,
    errorMessageId: errorMessageProps.id,
    validationBehavior,
  });

  const domProps = filterDOMProps(props, { labelable: true });

  return {
    groupProps: mergeProps(domProps, {
      role: "group",
      "aria-disabled": isDisabled || undefined,
      ...fieldProps,
    }),
    labelProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
    validationDetails,
  };
}
