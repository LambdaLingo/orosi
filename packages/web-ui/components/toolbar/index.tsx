import {
  type ForwardedRef,
  type ReactElement,
  createContext,
  forwardRef,
} from "react";
import type {
  AriaToolbarProps,
  Orientation,
  RenderChildren,
  SlotProps,
  ContextValue,
  ForwardRefType,
} from "types";
import { useContextProps, useRenderChildren, useToolbar } from "hooks";
import { filterDOMProps, mergeProps } from "utilities";

export type ToolbarRenderChildren = {
  /**
   * The current orientation of the toolbar.
   * @selector [data-orientation]
   */
  orientation: Orientation;
};

export type ToolbarProps = AriaToolbarProps &
  SlotProps &
  RenderChildren<ToolbarRenderChildren>;

export const ToolbarContext = createContext<
  ContextValue<ToolbarProps, HTMLDivElement>
>({});

function Toolbar(
  localprops: ToolbarProps,
  localref: ForwardedRef<HTMLDivElement>
): ReactElement {
  const [props, ref] = useContextProps(localprops, localref, ToolbarContext);
  const { toolbarProps } = useToolbar(props, ref);
  const RenderChildren = useRenderChildren({
    ...props,
    values: { orientation: props.orientation || "horizontal" },
  });
  const DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <div
      {...mergeProps(toolbarProps, DOMProps)}
      {...RenderChildren}
      data-orientation={props.orientation || "horizontal"}
      ref={ref}
      slot={props.slot || undefined}
    >
      {RenderChildren.children}
    </div>
  );
}

/**
 * A toolbar is a container for a set of interactive controls, such as buttons, dropdown menus, or checkboxes,
 * with arrow key navigation.
 */
const _Toolbar = /*#__PURE__*/ (forwardRef as ForwardRefType)(Toolbar);
export { _Toolbar as Toolbar };
