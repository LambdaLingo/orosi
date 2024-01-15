import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  RefObject,
} from "react";
import type { AriaToggleProps, ToggleState } from "types";
import { filterDOMProps, mergeProps } from "utilities";
import { useFocusable } from "hooks/focus";
import { usePress } from "hooks/interactions";
import { useFormReset } from "hooks/form";

export type ToggleAria = {
  /** Props to be spread on the label element. */
  labelProps: LabelHTMLAttributes<HTMLLabelElement>;
  /** Props to be spread on the input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  /** Whether the toggle is selected. */
  isSelected: boolean;
  /** Whether the toggle is in a pressed state. */
  isPressed: boolean;
  /** Whether the toggle is disabled. */
  isDisabled: boolean;
  /** Whether the toggle is read only. */
  isReadOnly: boolean;
  /** Whether the toggle is invalid. */
  isInvalid: boolean;
};

/**
 * Handles interactions for toggle elements, e.g. Checkboxes and Switches.
 */
export function useToggle(
  props: AriaToggleProps,
  state: ToggleState,
  ref: RefObject<HTMLInputElement>
): ToggleAria {
  const {
    isDisabled = false,
    isReadOnly = false,
    value,
    name,
    children,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    validationState = "valid",
    isInvalid,
  } = props;

  const onChange = (e) => {
    // since we spread props on label, onChange will end up there as well as in here.
    // so we have to stop propagation at the lowest level that we care about
    e.stopPropagation();
    state.setSelected(e.target.checked);
  };

  const hasChildren = children != null;
  const hasAriaLabel = ariaLabel != null || ariaLabelledby != null;
  if (!hasChildren && !hasAriaLabel) {
    console.warn(
      "If you do not provide children, you must specify an aria-label for accessibility"
    );
  }

  // This handles focusing the input on pointer down, which Safari does not do by default.
  const { pressProps, isPressed } = usePress({
    isDisabled,
  });

  // iOS does not toggle checkboxes if you drag off and back onto the label, so handle it ourselves.
  const { pressProps: labelProps, isPressed: isLabelPressed } = usePress({
    isDisabled: isDisabled || isReadOnly,
    onPress() {
      state.toggle();
    },
  });

  const { focusableProps } = useFocusable(props, ref);
  const interactions = mergeProps(pressProps, focusableProps);
  const domProps = filterDOMProps(props, { labelable: true });

  useFormReset(ref, state.isSelected, state.setSelected);

  return {
    labelProps: mergeProps(labelProps, { onClick: (e) => e.preventDefault() }),
    inputProps: mergeProps(domProps, {
      "aria-invalid": isInvalid || validationState === "invalid" || undefined,
      "aria-errormessage": props["aria-errormessage"],
      "aria-controls": props["aria-controls"],
      "aria-readonly": isReadOnly || undefined,
      onChange,
      disabled: isDisabled,
      ...(value == null ? {} : { value }),
      name,
      type: "checkbox",
      ...interactions,
    }),
    isSelected: state.isSelected,
    isPressed: isPressed || isLabelPressed,
    isDisabled,
    isReadOnly,
    isInvalid: isInvalid || validationState === "invalid",
  };
}
