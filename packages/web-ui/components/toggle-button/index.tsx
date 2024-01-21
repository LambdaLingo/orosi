import { type ForwardedRef, type ReactElement, forwardRef } from "react";
import type { ForwardRefType, ToggleButtonProps } from "types";
import {
  useFocusRing,
  useHover,
  useToggleButton,
  useContextProps,
  useRenderChildren,
  useToggleState,
} from "hooks";
import { mergeProps } from "utilities";
import { ToggleButtonContext } from "store";

function ToggleButton(
  localprops: ToggleButtonProps,
  localref: ForwardedRef<HTMLButtonElement>
): ReactElement {
  const [props, ref] = useContextProps(
    localprops,
    localref,
    ToggleButtonContext
  );
  const state = useToggleState(props);
  const { buttonProps, isPressed } = useToggleButton(props, state, ref);
  const { focusProps, isFocused, isFocusVisible } = useFocusRing(props);
  const { hoverProps, isHovered } = useHover(props);
  const RenderChildren = useRenderChildren({
    ...props,
    values: {
      isHovered,
      isPressed,
      isFocused,
      isSelected: state.isSelected,
      isFocusVisible,
      isDisabled: props.isDisabled || false,
      state,
    },
  });

  return (
    <button
      {...mergeProps(buttonProps, focusProps, hoverProps)}
      {...RenderChildren}
      data-disabled={props.isDisabled || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-focused={isFocused || undefined}
      data-hovered={isHovered || undefined}
      data-pressed={isPressed || undefined}
      data-selected={state.isSelected || undefined}
      ref={ref}
      slot={props.slot || undefined}
      type="button"
    />
  );
}

/**
 * A toggle button allows a user to toggle a selection on or off, for example switching between two states or modes.
 */
const _ToggleButton = /*#__PURE__*/ (forwardRef as ForwardRefType)(
  ToggleButton
) as (
  props: ToggleButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) => ReactElement;
export { _ToggleButton as ToggleButton };
