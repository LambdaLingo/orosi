import {
  type ReactElement,
  type ForwardedRef,
  createContext,
  forwardRef,
  useRef,
} from "react";
import type {
  AriaSwitchProps,
  HoverEvents,
  ContextValue,
  ForwardRefType,
  RenderChildren,
  SlotProps,
  ToggleState,
} from "types";
import {
  useFocusRing,
  useHover,
  useSwitch,
  useContextProps,
  useRenderChildren,
  useToggleState,
} from "hooks";
import { mergeProps, removeDataAttributes, filterDOMProps } from "utilities";
import { VisuallyHidden } from "components/visually-hidden";

export type SwitchProps = Omit<AriaSwitchProps, "children"> &
  HoverEvents &
  RenderChildren<SwitchRenderProps> &
  SlotProps;

export type SwitchRenderProps = {
  /**
   * Whether the switch is selected.
   * @selector [data-selected]
   */
  isSelected: boolean;
  /**
   * Whether the switch is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the switch is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean;
  /**
   * Whether the switch is focused, either via a mouse or keyboard.
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the switch is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the switch is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the switch is read only.
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
  /**
   * State of the switch.
   */
  state: ToggleState;
};

export const SwitchContext =
  createContext<ContextValue<SwitchProps, HTMLLabelElement>>(null);

function Switch(
  props: SwitchProps,
  ref: ForwardedRef<HTMLLabelElement>
): ReactElement {
  [props, ref] = useContextProps(props, ref, SwitchContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const state = useToggleState(props);
  const {
    labelProps,
    inputProps,
    isSelected,
    isDisabled,
    isReadOnly,
    isPressed,
  } = useSwitch(
    {
      ...removeDataAttributes(props),
      // ReactNode type doesn't allow function children.
      children: typeof props.children === "function" ? true : props.children,
    },
    state,
    inputRef
  );
  const { isFocused, isFocusVisible, focusProps } = useFocusRing();
  const isInteractionDisabled = props.isDisabled || props.isReadOnly;

  const { hoverProps, isHovered } = useHover({
    ...props,
    isDisabled: isInteractionDisabled,
  });

  const renderChildren = useRenderChildren({
    ...props,
    values: {
      isSelected,
      isPressed,
      isHovered,
      isFocused,
      isFocusVisible,
      isDisabled,
      isReadOnly,
      state,
    },
  });

  const DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <label
      {...mergeProps(DOMProps, labelProps, hoverProps, renderChildren)}
      data-disabled={isDisabled || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-focused={isFocused || undefined}
      data-hovered={isHovered || undefined}
      data-pressed={isPressed || undefined}
      data-readonly={isReadOnly || undefined}
      data-selected={isSelected || undefined}
      ref={ref}
      slot={props.slot || undefined}
    >
      <VisuallyHidden elementType="span">
        <input {...inputProps} {...focusProps} ref={inputRef} />
      </VisuallyHidden>
      {renderChildren.children}
    </label>
  );
}

/**
 * A switch allows a user to turn a setting on or off.
 */
const _Switch = /*#__PURE__*/ (forwardRef as ForwardRefType)(Switch);
export { _Switch as Switch };
