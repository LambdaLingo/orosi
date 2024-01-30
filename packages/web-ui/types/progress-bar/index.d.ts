import type { ReactNode } from "react";
import type { AriaLabelingProps, DOMProps } from "types";

type ProgressBaseProps = {
  /**
   * The current value (controlled).
   * @default 0
   */
  value?: number;
  /**
   * The smallest value allowed for the input.
   * @default 0
   */
  minValue?: number;
  /**
   * The largest value allowed for the input.
   * @default 100
   */
  maxValue?: number;
};

export type ProgressBarBaseProps = {
  /** The content to display as the label. */
  label?: ReactNode;
  /**
   * The display format of the value label.
   * @default {style: 'percent'}
   */
  formatOptions?: Intl.NumberFormatOptions;
  /** The content to display as the value's label (e.g. 1 of 4). */
  valueLabel?: ReactNode;
} & ProgressBaseProps;

export type AriaProgressBarBaseProps = ProgressBarBaseProps &
  DOMProps &
  AriaLabelingProps;

export type ProgressBarProps = {
  /**
   * Whether presentation is indeterminate when progress isn't known.
   */
  isIndeterminate?: boolean;
} & ProgressBarBaseProps;

export type AriaProgressBarProps = ProgressBarProps &
  DOMProps &
  AriaLabelingProps;

export type ProgressCircleProps = {
  /**
   * Whether presentation is indeterminate when progress isn't known.
   */
  isIndeterminate?: boolean;
} & ProgressBaseProps;

export type AriaProgressCircleProps = ProgressCircleProps &
  DOMProps &
  AriaLabelingProps;
