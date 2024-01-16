import {
  type ForwardedRef,
  type ReactElement,
  type PropsWithChildren,
  forwardRef,
} from "react";
import { FormValidationContext } from "store";
import type { FormProps } from "types";

export type FormLocalProps = PropsWithChildren<FormProps>;

function Form(
  props: FormLocalProps,
  ref: ForwardedRef<HTMLFormElement>
): ReactElement {
  const { validationErrors, children, ...domProps } = props;
  return (
    <form {...domProps} ref={ref}>
      <FormValidationContext.Provider value={validationErrors ?? {}}>
        {children}
      </FormValidationContext.Provider>
    </form>
  );
}

Form.displayName = "Form";
/**
 * A form is a group of inputs that allows users to submit data to a server,
 * with support for providing field validation errors.
 */
const _Form = forwardRef(Form) as (
  props: FormLocalProps,
  ref: ForwardedRef<HTMLFormElement>
) => ReactElement;
export { _Form as Form };
