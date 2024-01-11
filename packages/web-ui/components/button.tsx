import {
  type ForwardedRef,
  createContext,
  type ReactElement,
  forwardRef,
} from "react";
import type { ContextValue } from "../types/shared/context.js";
import { useContextProps } from "../hooks/shared/use-context-prop.js";
import { filterDOMProps } from "../utilities/filter-dom-props.js";
import { useButton } from "../hooks/button/use-button.js";
import { useRenderChildren } from "../hooks/shared/use-render-children.js";
import type {
  ButtonContextValue,
  ButtonProps,
  ButtonUIStates,
} from "../types/button/button.js";

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
  /**
   * Merge the local props and ref with the ones provided via context.
   */
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
      /* eslint-disable react/button-has-type -- because the button type is set dynamically using props. 
      see this link: https://github.com/jsx-eslint/eslint-plugin-react/issues/1555 */
      type={props.type ?? "button"}
    />
  );
}

/**
 * A button allows a user to perform an action, with mouse, touch, and keyboard interactions.
 */
const _Button = forwardRef(Button);
export { _Button as Button };
