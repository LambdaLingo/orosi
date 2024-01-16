import { type ForwardedRef, type HTMLAttributes, forwardRef } from "react";
import type {
  AriaLabelingProps,
  ForwardRefType,
  DOMProps,
  RenderChildren,
  SlotProps,
} from "types";
import { GroupContext } from "store";
import {
  useContextProps,
  useRenderChildren,
  useFocusRing,
  useHover,
  type HoverProps,
} from "hooks";
import { mergeProps } from "utilities";

export type GroupRenderProps = {
  /**
   * Whether the group is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether an element within the group is focused, either via a mouse or keyboard.
   * @selector [data-focus-within]
   */
  isFocusWithin: boolean;
  /**
   * Whether an element within the group is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the group is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the group is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean;
};

export type GroupProps = {
  /** Whether the group is disabled. */
  isDisabled?: boolean;
  /** Whether the group is invalid. */
  isInvalid?: boolean;
  /**
   * An accessibility role for the group. By default, this is set to `'group'`.
   * Use `'region'` when the contents of the group is important enough to be
   * included in the page table of contents. Use `'presentation'` if the group
   * is visual only and does not represent a semantic grouping of controls.
   * @default 'group'
   */
  role?: "group" | "region" | "presentation";
} & AriaLabelingProps &
  Omit<
    HTMLAttributes<HTMLElement>,
    "children" | "className" | "style" | "role" | "slot"
  > &
  DOMProps &
  HoverProps &
  RenderChildren<GroupRenderProps> &
  SlotProps;

function Group(props: GroupProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, GroupContext);
  let {
    isDisabled,
    isInvalid,
    onHoverStart,
    onHoverChange,
    onHoverEnd,
    ...otherProps
  } = props;

  const { hoverProps, isHovered } = useHover({
    onHoverStart,
    onHoverChange,
    onHoverEnd,
    isDisabled,
  });
  const { isFocused, isFocusVisible, focusProps } = useFocusRing({
    within: true,
  });

  isDisabled ??= !!props["aria-disabled"] && props["aria-disabled"] !== "false";
  isInvalid ??= !!props["aria-invalid"] && props["aria-invalid"] !== "false";
  const RenderChildren = useRenderChildren({
    ...props,
    values: {
      isHovered,
      isFocusWithin: isFocused,
      isFocusVisible,
      isDisabled,
      isInvalid,
    },
  });

  return (
    <div
      {...mergeProps(otherProps, focusProps, hoverProps)}
      {...RenderChildren}
      ref={ref}
      role={props.role ?? "group"}
      slot={props.slot ?? undefined}
      data-focus-within={isFocused || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}
    >
      {RenderChildren.children}
    </div>
  );
}

/**
 * A group represents a set of related UI controls, and supports interactive states for styling.
 */
const _Group = /*#__PURE__*/ (forwardRef as ForwardRefType)(Group);
export { _Group as Group };
