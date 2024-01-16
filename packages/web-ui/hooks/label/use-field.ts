import type { DOMAttributes, HelpTextProps, Validation } from "types";
import { useSlotId } from "hooks/shared";
import { mergeProps } from "utilities";
import { type LabelAria, type LabelAriaProps, useLabel } from "./use-label";

export type AriaFieldProps = LabelAriaProps &
  HelpTextProps &
  Omit<Validation<any>, "isRequired">;

export type FieldAria = {
  /** Props for the description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the error message element, if any. */
  errorMessageProps: DOMAttributes;
} & LabelAria;

/**
 * Provides the accessibility implementation for input fields.
 * Fields accept user input, gain context from their label, and may display a description or error message.
 * @param props - Props for the Field.
 */
export function useField(props: AriaFieldProps): FieldAria {
  const { description, errorMessage, isInvalid, validationState } = props;
  let { labelProps, fieldProps } = useLabel(props);

  const descriptionId = useSlotId([
    Boolean(description),
    Boolean(errorMessage),
    isInvalid,
    validationState,
  ]);
  const errorMessageId = useSlotId([
    Boolean(description),
    Boolean(errorMessage),
    isInvalid,
    validationState,
  ]);

  fieldProps = mergeProps(fieldProps, {
    "aria-describedby":
      [
        descriptionId,
        // Use aria-describedby for error message because aria-errormessage is unsupported using VoiceOver or NVDA. See https://github.com/adobe/react-spectrum/issues/1346#issuecomment-740136268
        errorMessageId,
        props["aria-describedby"],
      ]
        .filter(Boolean)
        .join(" ") || undefined,
  });

  return {
    labelProps,
    fieldProps,
    descriptionProps: {
      id: descriptionId,
    },
    errorMessageProps: {
      id: errorMessageId,
    },
  };
}
