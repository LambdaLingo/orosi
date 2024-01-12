import type { ButtonHTMLAttributes, RefObject } from "react";
import { usePress, useHover } from "hooks/interactions";
import { useFocusable, useFocusRing } from "hooks/focus";
import { filterDOMProps, mergeProps } from "utilities";
import type { ButtonProps } from "types";

export type ButtonPropsWithoutChildren = Omit<ButtonProps, "children">;

export interface ButtonResult<T> {
  /** Props for the button element. */
  buttonProps: T;
  /** Whether the button is currently pressed. */
  isPressed: boolean;
  /** Whether the button is currently hovered. */
  isHovered: boolean;
  /** Whether the button is currently focused. */
  isFocused: boolean;
  /** Whether the button is currently focused and the focus is visible. */
  isFocusVisible: boolean;
}
/**
 * Provides the behavior and accessibility implementation for a button component. Handles mouse, keyboard, and touch interactions,
 * focus behavior, and ARIA props for both native button elements and custom element types.
 * @param props - Props to be applied to the button.
 * @param ref - A ref to a DOM element for the button.
 */
export function useButton(
  props: ButtonPropsWithoutChildren,
  ref: RefObject<HTMLButtonElement>
): ButtonResult<ButtonHTMLAttributes<HTMLButtonElement>> {
  const {
    isDisabled,
    onPress,
    onPressStart,
    onPressEnd,
    onPressUp,
    onPressChange,
    preventFocusOnPress,
    allowFocusWhenDisabled,
    onHoverStart,
    onHoverEnd,
    onHoverChange,
    type = "button",
  } = props;
  const additionalProps = {
    type,
    disabled: isDisabled,
  };

  const { pressProps, isPressed } = usePress({
    onPressStart,
    onPressEnd,
    onPressChange,
    onPress,
    onPressUp,
    isDisabled,
    preventFocusOnPress,
    ref,
  });

  const { hoverProps, isHovered } = useHover({
    onHoverStart,
    onHoverEnd,
    onHoverChange,
    isDisabled,
  });

  const { focusProps, isFocused, isFocusVisible } = useFocusRing();

  const { focusableProps } = useFocusable(props, ref);
  if (allowFocusWhenDisabled) {
    focusableProps.tabIndex = isDisabled ? -1 : focusableProps.tabIndex;
  }
  const buttonProps = mergeProps(
    focusableProps,
    pressProps,
    hoverProps,
    focusProps,
    filterDOMProps(props, { labelable: true })
  );

  return {
    isPressed, // Used to indicate press state for visual
    isHovered, // Used to indicate hover state for visual
    isFocused, // Used to indicate focus state for visual
    isFocusVisible, // Used to indicate focus state for visual
    buttonProps: mergeProps(additionalProps, buttonProps, {
      "aria-haspopup": props["aria-haspopup"],
      "aria-expanded": props["aria-expanded"],
      "aria-controls": props["aria-controls"],
      "aria-pressed": props["aria-pressed"],
    }),
  };
}
