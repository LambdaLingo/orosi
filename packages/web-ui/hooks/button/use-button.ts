import type { ButtonHTMLAttributes, RefObject } from "react";
import { usePress } from "../interactions/use-press";
import { useFocusable } from "../focus/use-focusable";
import { filterDOMProps } from "../../utilities/filter-dom-props";
import { mergeProps } from "../../utilities/merge-props";
import type { ButtonProps } from "../../types/button/button";

export type ButtonPropsWithoutChildren = Omit<ButtonProps, "children">;

export interface ButtonAria<T> {
  /** Props for the button element. */
  buttonProps: T;
  /** Whether the button is currently pressed. */
  isPressed: boolean;
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
): ButtonAria<ButtonHTMLAttributes<HTMLButtonElement>> {
  const {
    isDisabled,
    onPress,
    onPressStart,
    onPressEnd,
    onPressUp,
    onPressChange,
    preventFocusOnPress,
    allowFocusWhenDisabled,
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

  const { focusableProps } = useFocusable(props, ref);
  if (allowFocusWhenDisabled) {
    focusableProps.tabIndex = isDisabled ? -1 : focusableProps.tabIndex;
  }
  const buttonProps = mergeProps(
    focusableProps,
    pressProps,
    filterDOMProps(props, { labelable: true })
  );

  return {
    isPressed, // Used to indicate press state for visual
    buttonProps: mergeProps(additionalProps, buttonProps, {
      "aria-haspopup": props["aria-haspopup"],
      "aria-expanded": props["aria-expanded"],
      "aria-controls": props["aria-controls"],
      "aria-pressed": props["aria-pressed"],
    }),
  };
}
