import { type ElementType, type LabelHTMLAttributes, useId } from "react";
import type {
  AriaLabelingProps,
  DOMAttributes,
  DOMProps,
  LabelableProps,
} from "types";
import { useLabels } from "hooks/shared";

export type LabelAriaProps = {
  /**
   * The HTML element used to render the label, e.g. 'label', or 'span'.
   * @default 'label'
   */
  labelElementType?: ElementType;
} & LabelableProps &
  DOMProps &
  AriaLabelingProps;

export type LabelAria = {
  /** Props to apply to the label container element. */
  labelProps: DOMAttributes | LabelHTMLAttributes<HTMLLabelElement>;
  /** Props to apply to the field container element being labeled. */
  fieldProps: AriaLabelingProps & DOMProps;
};

/**
 * Provides the accessibility implementation for labels and their associated elements.
 * Labels provide context for user inputs.
 * @param props - The props for labels and fields.
 */
export function useLabel(props: LabelAriaProps): LabelAria {
  let {
    id,
    label,
    "aria-labelledby": ariaLabelledby,
    "aria-label": ariaLabel,
    labelElementType = "label",
  } = props;

  id = useId(id);
  let labelId = useId();
  let labelProps = {};
  if (label) {
    ariaLabelledby = ariaLabelledby ? `${labelId} ${ariaLabelledby}` : labelId;
    labelProps = {
      id: labelId,
      htmlFor: labelElementType === "label" ? id : undefined,
    };
  } else if (!ariaLabelledby && !ariaLabel) {
    console.warn(
      "If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility"
    );
  }

  let fieldProps = useLabels({
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  });

  return {
    labelProps,
    fieldProps,
  };
}
