import type { ButtonHTMLAttributes, ElementType, RefObject } from "react";
import type { AriaToggleButtonProps, ButtonResult, ToggleState } from "types";
import { useButton } from "hooks";
import { chain, mergeProps } from "utilities";

export type AriaToggleButtonOptions<E extends ElementType> = Omit<
  AriaToggleButtonProps<E>,
  "children"
>;

export type ToggleButtonResult = Omit<
  ButtonResult<ButtonHTMLAttributes<HTMLButtonElement>>,
  "isHovered" | "isFocused" | "isFocusVisible"
>;

/**
 * Provides the behavior and accessibility implementation for a toggle button component.
 * ToggleButtons allow users to toggle a selection on or off, for example switching between two states or modes.
 */
export function useToggleButton(
  props: AriaToggleButtonOptions<ElementType>,
  state: ToggleState,
  ref: RefObject<any>
): ToggleButtonResult {
  const { isSelected } = state;
  const { isPressed, buttonProps } = useButton(
    {
      ...props,
      onPress: chain(state.toggle, props.onPress),
    },
    ref
  );

  return {
    isPressed,
    buttonProps: mergeProps(buttonProps, {
      "aria-pressed": isSelected,
    }),
  };
}
