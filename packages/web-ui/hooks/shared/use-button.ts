import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  HTMLAttributes,
  InputHTMLAttributes,
  RefObject,
} from "react";
import { AriaButtonProps } from "@react-types/button";
import { DOMAttributes } from "@react-types/shared";
import { filterDOMProps, mergeProps } from "@react-aria/utils";
import { useFocusable } from "@react-aria/focus";
import { usePress } from "@react-aria/interactions";

export interface AriaButtonOptions<E extends ElementType>
  extends Omit<AriaButtonProps<E>, "children"> {}

export interface ButtonAria<T> {
  /** Props for the button element. */
  buttonProps: T;
  /** Whether the button is currently pressed. */
  isPressed: boolean;
}

// Order with overrides is important: 'button' should be default
export function useButton(
  props: AriaButtonOptions<"button">,
  ref: RefObject<HTMLButtonElement>
): ButtonAria<ButtonHTMLAttributes<HTMLButtonElement>>;
export function useButton(
  props: AriaButtonOptions<"a">,
  ref: RefObject<HTMLAnchorElement>
): ButtonAria<AnchorHTMLAttributes<HTMLAnchorElement>>;
export function useButton(
  props: AriaButtonOptions<"div">,
  ref: RefObject<HTMLDivElement>
): ButtonAria<HTMLAttributes<HTMLDivElement>>;
export function useButton(
  props: AriaButtonOptions<"input">,
  ref: RefObject<HTMLInputElement>
): ButtonAria<InputHTMLAttributes<HTMLInputElement>>;
export function useButton(
  props: AriaButtonOptions<"span">,
  ref: RefObject<HTMLSpanElement>
): ButtonAria<HTMLAttributes<HTMLSpanElement>>;
export function useButton(
  props: AriaButtonOptions<ElementType>,
  ref: RefObject<Element>
): ButtonAria<DOMAttributes>;
/**
 * Provides the behavior and accessibility implementation for a button component. Handles mouse, keyboard, and touch interactions,
 * focus behavior, and ARIA props for both native button elements and custom element types.
 * @param props - Props to be applied to the button.
 * @param ref - A ref to a DOM element for the button.
 */
export function useButton(
  props: AriaButtonOptions<ElementType>,
  ref: RefObject<any>
): ButtonAria<HTMLAttributes<any>> {
  const {
    elementType = "button",
    isDisabled,
    onPress,
    onPressStart,
    onPressEnd,
    onPressUp,
    onPressChange,
    preventFocusOnPress,
    allowFocusWhenDisabled,
    onClick: deprecatedOnClick,
    href,
    target,
    rel,
    type = "button",
  } = props;
  let additionalProps;
  if (elementType === "button") {
    additionalProps = {
      type,
      disabled: isDisabled,
    };
  } else {
    additionalProps = {
      role: "button",
      tabIndex: isDisabled ? undefined : 0,
      href: elementType === "a" && isDisabled ? undefined : href,
      target: elementType === "a" ? target : undefined,
      type: elementType === "input" ? type : undefined,
      disabled: elementType === "input" ? isDisabled : undefined,
      "aria-disabled":
        !isDisabled || elementType === "input" ? undefined : isDisabled,
      rel: elementType === "a" ? rel : undefined,
    };
  }

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
      onClick: (e) => {
        if (deprecatedOnClick) {
          deprecatedOnClick(e);
          console.warn("onClick is deprecated, please use onPress");
        }
      },
    }),
  };
}