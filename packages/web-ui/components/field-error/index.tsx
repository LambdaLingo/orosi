import {
  type ForwardedRef,
  type ReactElement,
  forwardRef,
  useContext,
} from "react";
import { FieldErrorContext } from "store";
import { useRenderChildren } from "hooks";
import type { ValidationResult, RenderChildren } from "types";
import { Text } from "components/text";

export type FieldErrorRenderProps = ValidationResult;
export type FieldErrorProps = RenderChildren<FieldErrorRenderProps>;

function FieldError(
  props: FieldErrorProps,
  ref: ForwardedRef<HTMLElement>
): ReactElement | null {
  const validation = useContext(FieldErrorContext);
  if (!validation?.isInvalid) {
    return null;
  }

  return <FieldErrorInner {...props} ref={ref} />;
}

FieldError.displayName = "FieldError";
/**
 * A FieldError displays validation errors for a form field.
 */
const _FieldError = forwardRef(FieldError);
export { _FieldError as FieldError };

const FieldErrorInner = forwardRef(
  (props: FieldErrorProps, ref: ForwardedRef<HTMLElement>) => {
    const validation = useContext(FieldErrorContext)!;
    const renderProps = useRenderChildren({
      ...props,
      defaultChildren: validation.validationErrors.join(" "),
      values: validation,
    });

    return <Text slot="errorMessage" {...renderProps} ref={ref} />;
  }
);

FieldErrorInner.displayName = "FieldError";
