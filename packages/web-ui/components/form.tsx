import {
  type ForwardedRef,
  type ReactElement,
  type PropsWithChildren,
  forwardRef,
  createContext,
} from "react";
import type { FormProps as SharedFormProps, ValidationErrors } from "types";

export type FormProps = PropsWithChildren<SharedFormProps>;

export const FormValidationContext = createContext<ValidationErrors>({});

function Form(
  props: FormProps,
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
  props: FormProps,
  ref: ForwardedRef<HTMLFormElement>
) => ReactElement;
export { _Form as Form };
