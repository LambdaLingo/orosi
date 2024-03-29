import {
  type ForwardedRef,
  type ReactElement,
  createContext,
  forwardRef,
} from "react";
import type {
  AriaProgressBarProps,
  ContextValue,
  RenderChildren,
  SlotProps,
} from "types";
import {
  useProgressBar,
  useContextProps,
  useRenderChildren,
  useSlot,
} from "hooks";
import { clamp } from "utilities";
import { LabelContext } from "store";

export type ProgressBarProps = Omit<AriaProgressBarProps, "label"> &
  RenderChildren<ProgressBarRenderProps> &
  SlotProps;

export type ProgressBarRenderProps = {
  /**
   * The value as a percentage between the minimum and maximum.
   */
  percentage?: number;
  /**
   * A formatted version of the value.
   * @selector [aria-valuetext]
   */
  valueText: string | undefined;
  /**
   * Whether the progress bar is indeterminate.
   * @selector :not([aria-valuenow])
   */
  isIndeterminate: boolean;
};

export const ProgressBarContext =
  createContext<ContextValue<ProgressBarProps, HTMLDivElement>>(null);

function ProgressBar(
  props: ProgressBarProps,
  ref: ForwardedRef<HTMLDivElement>
): ReactElement {
  [props, ref] = useContextProps(props, ref, ProgressBarContext);
  let {
    value = 0,
    minValue = 0,
    maxValue = 100,
    isIndeterminate = false,
  } = props;
  value = clamp(value, minValue, maxValue);

  const [labelRef, label] = useSlot();
  const { progressBarProps, labelProps } = useProgressBar({ ...props, label });

  // Calculate the width of the progress bar as a percentage
  const percentage = isIndeterminate
    ? undefined
    : ((value - minValue) / (maxValue - minValue)) * 100;

  const RenderChildren = useRenderChildren({
    ...props,
    values: {
      percentage,
      valueText: progressBarProps["aria-valuetext"],
      isIndeterminate,
    },
  });

  return (
    <div
      {...progressBarProps}
      {...RenderChildren}
      ref={ref}
      slot={props.slot || undefined}
    >
      <LabelContext.Provider
        value={{ ...labelProps, ref: labelRef, elementType: "span" }}
      >
        {RenderChildren.children}
      </LabelContext.Provider>
    </div>
  );
}

/**
 * Progress bars show either determinate or indeterminate progress of an operation
 * over time.
 */
const _ProgressBar = forwardRef(ProgressBar);
export { _ProgressBar as ProgressBar };
