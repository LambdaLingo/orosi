import {
  createContext,
  type ForwardedRef,
  type InputHTMLAttributes,
} from "react";
import type { HoverEvents, ContextValue, RenderChildren } from "types";
import {
  useContextProps,
  useRenderChildren,
  useFocusRing,
  useHover,
} from "hooks";
import { mergeProps } from "utilities";

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

export const InputContext = createContext<
  ContextValue<InputProps, HTMLInputElement>
>({});

const filterHoverProps = (props: InputProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let { onHoverStart, onHoverChange, onHoverEnd, ...otherProps } = props;
  return otherProps;
};

function Input(props: InputProps, ref: ForwardedRef<HTMLInputElement>) {
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
      ref={ref}
      data-focused={isFocused || undefined}
      data-disabled={props.disabled || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-invalid={isInvalid || undefined}
    />
  );
}

/**
 * An input allows a user to input text.
 */
const _Input = /*#__PURE__*/ createHideableComponent(Input);
export { _Input as Input };
