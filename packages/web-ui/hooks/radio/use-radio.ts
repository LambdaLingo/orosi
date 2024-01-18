import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  RefObject,
} from "react";
import type { AriaRadioProps, RadioGroupState } from "types";
import { radioGroupData } from "store";
import { useFormReset, useFocusable, useFormValidation, usePress } from "hooks";
import { filterDOMProps, mergeProps } from "utilities";

export type RadioAria = {
  /** Props for the label wrapper element. */
  labelProps: LabelHTMLAttributes<HTMLLabelElement>;
  /** Props for the input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  /** Whether the radio is disabled. */
  isDisabled: boolean;
  /** Whether the radio is currently selected. */
  isSelected: boolean;
  /** Whether the radio is in a pressed state. */
  isPressed: boolean;
};

/**
 * Provides the behavior and accessibility implementation for an individual
 * radio button in a radio group.
 * @param props - Props for the radio.
 * @param state - State for the radio group, as returned by `useRadioGroupState`.
 * @param ref - Ref to the HTML input element.
 */
export function useRadio(
  props: AriaRadioProps,
  state: RadioGroupState,
  ref: RefObject<HTMLInputElement>
): RadioAria {
  let {
    value,
    children,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  } = props;

  const isDisabled = props.isDisabled || state.isDisabled;

  let hasChildren = children != null;
  let hasAriaLabel = ariaLabel != null || ariaLabelledby != null;
  if (!hasChildren && !hasAriaLabel) {
    console.warn(
      "If you do not provide children, you must specify an aria-label for accessibility"
    );
  }

  let checked = state.selectedValue === value;

  let onChange = (e) => {
    e.stopPropagation();
    state.setSelectedValue(value);
  };

  let { pressProps, isPressed } = usePress({
    isDisabled,
  });

  // iOS does not toggle radios if you drag off and back onto the label, so handle it ourselves.
  let { pressProps: labelProps, isPressed: isLabelPressed } = usePress({
    isDisabled,
    onPress() {
      state.setSelectedValue(value);
    },
  });

  let { focusableProps } = useFocusable(
    mergeProps(props, {
      onFocus: () => state.setLastFocusedValue(value),
    }),
    ref
  );
  let interactions = mergeProps(pressProps, focusableProps);
  let domProps = filterDOMProps(props, { labelable: true });
  let tabIndex: number | undefined = -1;
  if (state.selectedValue != null) {
    if (state.selectedValue === value) {
      tabIndex = 0;
    }
  } else if (
    state.lastFocusedValue === value ||
    state.lastFocusedValue == null
  ) {
    tabIndex = 0;
  }
  if (isDisabled) {
    tabIndex = undefined;
  }

  let { name, descriptionId, errorMessageId, validationBehavior } =
    radioGroupData.get(state)!;
  useFormReset(ref, state.selectedValue, state.setSelectedValue);
  useFormValidation({ validationBehavior }, state, ref);

  return {
    labelProps: mergeProps(labelProps, { onClick: (e) => e.preventDefault() }),
    inputProps: mergeProps(domProps, {
      ...interactions,
      type: "radio",
      name,
      tabIndex,
      disabled: isDisabled,
      required: state.isRequired && validationBehavior === "native",
      checked,
      value,
      onChange,
      "aria-describedby":
        [
          props["aria-describedby"],
          state.isInvalid ? errorMessageId : null,
          descriptionId,
        ]
          .filter(Boolean)
          .join(" ") || undefined,
    }),
    isDisabled,
    isSelected: checked,
    isPressed: isPressed || isLabelPressed,
  };
}
