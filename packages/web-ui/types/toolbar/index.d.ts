import type { AriaLabelingProps } from "types/shared";

export type AriaToolbarProps = {
  /**
   * The orientation of the entire toolbar.
   * @default 'horizontal'
   */
  orientation?: Orientation;
} & AriaLabelingProps;
