import type { ReactNode } from "react";

export type LabelPosition = "top" | "side";
export type Alignment = "start" | "end";
export type NecessityIndicator = "icon" | "label";

export type LabelableProps = {
  /** The content to display as the label. */
  label?: ReactNode;
};
