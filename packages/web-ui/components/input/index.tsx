import {
  forwardRef,
  type ForwardedRef,
  type InputHTMLAttributes,
  type ReactElement,
} from "react";
import type { ForwardRefType, HoverEvents, RenderChildren } from "types";
import {
  useContextProps,
  useRenderChildren,
  useFocusRing,
  useHover,
} from "hooks";
import { mergeProps } from "utilities";
import { InputContext } from "store";

export type InputRenderProps = {
  /**
   * Whether the input is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the input is focused, either via a mouse or keyboard.
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the input is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the input is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the input is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean;
};

export type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "style"
> &
  HoverEvents &
  RenderChildren<InputRenderProps>;

const filterHoverProps = (props: InputProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onHoverStart, onHoverChange, onHoverEnd, ...otherProps } = props;
  return otherProps;
};

function Input(
  props: InputProps,
  ref: ForwardedRef<HTMLInputElement>
): ReactElement {
  [props, ref] = useContextProps(props, ref, InputContext);

  const { hoverProps, isHovered } = useHover(props);
  const { isFocused, isFocusVisible, focusProps } = useFocusRing({
    isTextInput: true,
    autoFocus: props.autoFocus,
  });

  const isInvalid =
    !!props["aria-invalid"] && props["aria-invalid"] !== "false";
  const renderChildren = useRenderChildren({
    ...props,
    values: {
      isHovered,
      isFocused,
      isFocusVisible,
      isDisabled: props.disabled || false,
      isInvalid,
    },
  });

  return (
    <input
      {...mergeProps(filterHoverProps(props), focusProps, hoverProps)}
      {...renderChildren}
      data-disabled={props.disabled || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-focused={isFocused || undefined}
      data-hovered={isHovered || undefined}
      data-invalid={isInvalid || undefined}
      ref={ref}
    />
  );
}

/**
 * An input allows a user to input text.
 */
const _Input = /*#__PURE__*/ (forwardRef as ForwardRefType)(Input);
export { _Input as Input };
