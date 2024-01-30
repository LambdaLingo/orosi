import {
  type ForwardedRef,
  type ReactElement,
  createContext,
  forwardRef,
} from "react";
import type {
  AriaMeterProps,
  ContextValue,
  ForwardRefType,
  RenderChildren,
  SlotProps,
} from "types";
import { useContextProps, useRenderChildren, useSlot, useMeter } from "hooks";
import { clamp } from "utilities";
import { LabelContext } from "store";

export type MeterProps = Omit<AriaMeterProps, "label"> &
  RenderChildren<MeterRenderProps> &
  SlotProps;

export type MeterRenderProps = {
  /**
   * The value as a percentage between the minimum and maximum.
   */
  percentage: number;
  /**
   * A formatted version of the value.
   * @selector [aria-valuetext]
   */
  valueText: string | undefined;
};

export const MeterContext =
  createContext<ContextValue<MeterProps, HTMLDivElement>>(null);

function Meter(
  localprops: MeterProps,
  localref: ForwardedRef<HTMLDivElement>
): ReactElement {
  const [props, ref] = useContextProps(localprops, localref, MeterContext);
  let { value = 0, minValue = 0, maxValue = 100 } = props;
  value = clamp(value, minValue, maxValue);

  const [labelRef, label] = useSlot();
  const { meterProps, labelProps } = useMeter({ ...props, label });

  // Calculate the width of the progress bar as a percentage
  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;

  const RenderChildren = useRenderChildren({
    ...props,
    values: {
      percentage,
      valueText: meterProps["aria-valuetext"],
    },
  });

  return (
    <div
      {...meterProps}
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
 * A meter represents a quantity within a known range, or a fractional value.
 */
const _Meter = /*#__PURE__*/ (forwardRef as ForwardRefType)(Meter);
export { _Meter as Meter };
