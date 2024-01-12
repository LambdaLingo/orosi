import {
  type ForwardedRef,
  type ReactElement,
  createContext,
  forwardRef,
} from "react";
import { useContextProps, useButton, useRenderChildren } from "hooks";
import { filterDOMProps } from "utilities";
import type {
  ButtonContextValue,
  ButtonProps,
  ButtonUIStates,
  ContextValue,
} from "types";

const additionalButtonHTMLAttributes = new Set([
  "form",
  "formAction",
  "formEncType",
  "formMethod",
  "formNoValidate",
  "formTarget",
  "name",
  "value",
  "preventFocusOnPress",
  "preventScrollOnPress",
]);

export const ButtonContext = createContext<
  ContextValue<ButtonContextValue, HTMLButtonElement>
>({});

function Button(
  localprops: ButtonProps,
  localref: ForwardedRef<HTMLButtonElement>
): ReactElement {
  const [props, ref] = useContextProps(localprops, localref, ButtonContext);
  const ctx = props as ButtonContextValue;
  const { buttonProps, isPressed, isHovered, isFocused, isFocusVisible } =
    useButton(props, ref);
  const renderChildren = useRenderChildren<ButtonUIStates>({
    ...props,
    values: {
      isPressed,
      isFocused,
      isFocusVisible,
      isHovered,
      isDisabled: props.isDisabled || false,
    },
  });

  return (
    <button
      {...filterDOMProps(props, { propNames: additionalButtonHTMLAttributes })}
      {...buttonProps}
      {...renderChildren}
      data-disabled={props.isDisabled || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-focused={isFocused || undefined}
      data-hovered={isHovered || undefined}
      data-pressed={ctx.isPressed || isPressed || undefined}
      ref={ref}
      slot={props.slot || undefined}
      type={props.type ?? "button"}
    />
  );
}

/**
 * A button allows a user to perform an action, with mouse, touch, and keyboard interactions.
 */
const _Button = forwardRef(Button);
export { _Button as Button };
