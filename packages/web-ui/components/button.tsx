import React, { type ForwardedRef, createContext } from "react";
import type { ComponentProp } from "../types/shared/component.d.ts";
import type { ContextValue } from "../types/shared/context.js";
import { useContextProps } from "../hooks/shared/use-context-prop.js";
import { filterDOMProps } from "../utilities/filter-dom-props.js";
import { mergeProps } from "../utilities/merge-props.js";
import { useButton } from "../hooks/shared/use-button.js";
import { useFocusRing } from "../hooks/shared/use-focus-ring.js";
import { useHover } from "../hooks/shared/use-hover.js";
import { useRenderProps } from "../hooks/shared/use-render-props.js";
import { createHideableComponent } from "../utilities/create-hideable-component.js";

/**
 * This is the updated component props using ComponentPropWithRef
 */
type ButtonProps = ComponentProp<"button", { color?: "white" | "black" }>;

type ButtonContextValue = ButtonProps & {
  isPressed?: boolean;
};

export const ButtonContext = createContext<
  ContextValue<ButtonContextValue, HTMLButtonElement>
>({});

function Button(props: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  [props, ref] = useContextProps(props, ref, ButtonContext);
  const ctx = props as ButtonContextValue;
  const { buttonProps, isPressed } = useButton(props, ref);
  const { focusProps, isFocused, isFocusVisible } = useFocusRing(props);
  const { hoverProps, isHovered } = useHover(props);
  const renderProps = useRenderProps({
    ...props,
    values: {
      isHovered,
      isPressed,
      isFocused,
      isFocusVisible,
      isDisabled: props.isDisabled || false,
    },
    defaultClassName: "react-aria-Button",
  });

  return (
    <button
      {...filterDOMProps(props, { propNames: additionalButtonHTMLAttributes })}
      {...mergeProps(buttonProps, focusProps, hoverProps)}
      {...renderProps}
      ref={ref}
      slot={props.slot || undefined}
      data-disabled={props.isDisabled || undefined}
      data-pressed={ctx.isPressed || isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
    />
  );
}

/**
 * A button allows a user to perform an action, with mouse, touch, and keyboard interactions.
 */
const _Button = /*#__PURE__*/ createHideableComponent(Button);
export { _Button as Button };
