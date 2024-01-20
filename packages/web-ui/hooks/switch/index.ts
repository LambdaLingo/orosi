import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  RefObject,
} from "react";
import type { AriaSwitchProps, ToggleState } from "types";
import { useToggle } from "hooks";

export type SwitchAria = {
  /** Props for the label wrapper element. */
  labelProps: LabelHTMLAttributes<HTMLLabelElement>;
  /** Props for the input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  /** Whether the switch is selected. */
  isSelected: boolean;
  /** Whether the switch is in a pressed state. */
  isPressed: boolean;
  /** Whether the switch is disabled. */
  isDisabled: boolean;
  /** Whether the switch is read only. */
  isReadOnly: boolean;
};

/**
 * Provides the behavior and accessibility implementation for a switch component.
 * A switch is similar to a checkbox, but represents on/off values as opposed to selection.
 * @param props - Props for the switch.
 * @param state - State for the switch, as returned by `useToggleState`.
 * @param ref - Ref to the HTML input element.
 */
export function useSwitch(
  props: AriaSwitchProps,
  state: ToggleState,
  ref: RefObject<HTMLInputElement>
): SwitchAria {
  const {
    labelProps,
    inputProps,
    isSelected,
    isPressed,
    isDisabled,
    isReadOnly,
  } = useToggle(props, state, ref);

  return {
    labelProps,
    inputProps: {
      ...inputProps,
      role: "switch",
      checked: isSelected,
    },
    isSelected,
    isPressed,
    isDisabled,
    isReadOnly,
  };
}
