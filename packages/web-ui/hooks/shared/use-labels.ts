import { useId } from "react";
import type { AriaLabelingProps, DOMProps } from "types";

/**
 * Merges aria-label and aria-labelledby into aria-labelledby when both exist.
 * @param props - Aria label props.
 * @param defaultLabel - Default value for aria-label when not present.
 */
export function useLabels(
  props: DOMProps & AriaLabelingProps,
  defaultLabel?: string
): DOMProps & AriaLabelingProps {
  let { id, "aria-label": label, "aria-labelledby": labelledBy } = props;

  // If there is both an aria-label and aria-labelledby,
  // combine them by pointing to the element itself.
  id = useId(id);
  if (labelledBy && label) {
    const ids = new Set([id, ...labelledBy.trim().split(/\s+/)]);
    labelledBy = [...ids].join(" ");
  } else if (labelledBy) {
    labelledBy = labelledBy.trim().split(/\s+/).join(" ");
  }

  // If no labels are provided, use the default
  if (!label && !labelledBy && defaultLabel) {
    label = defaultLabel;
  }

  return {
    id,
    "aria-label": label,
    "aria-labelledby": labelledBy,
  };
}
