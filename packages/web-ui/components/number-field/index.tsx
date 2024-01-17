import { type ForwardedRef, createContext, forwardRef, useRef } from "react";
import type {
  AriaNumberFieldProps,
  NumberFieldState,
  SlotProps,
  ContextValue,
  ForwardRefType,
  RACValidation,
  RenderChildren,
  InputDOMProps,
} from "types";
import {
  ButtonContext,
  FieldErrorContext,
  GroupContext,
  InputContext,
  LabelContext,
  TextContext,
} from "store";
import {
  useLocale,
  useNumberField,
  useNumberFieldState,
  useContextProps,
  useRenderChildren,
  useSlot,
} from "hooks";
import { removeDataAttributes, filterDOMProps } from "utilities";
import { Provider } from "components/provider";

export interface NumberFieldRenderProps {
  /**
   * Whether the number field is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the number field is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * State of the number field.
   */
  state: NumberFieldState;
}

export interface NumberFieldProps
  extends Omit<
      AriaNumberFieldProps,
      | "label"
      | "placeholder"
      | "description"
      | "errorMessage"
      | "validationState"
      | "validationBehavior"
    >,
    RACValidation,
    InputDOMProps,
    RenderChildren<NumberFieldRenderProps>,
    SlotProps {}

export const NumberFieldContext =
  createContext<ContextValue<NumberFieldProps, HTMLDivElement>>(null);
export const NumberFieldStateContext = createContext<NumberFieldState | null>(
  null
);

function NumberField(
  props: NumberFieldProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  [props, ref] = useContextProps(props, ref, NumberFieldContext);
  let { locale } = useLocale();
  let state = useNumberFieldState({
    ...props,
    locale,
    validationBehavior: props.validationBehavior ?? "native",
  });

  let inputRef = useRef<HTMLInputElement>(null);
  let [labelRef, label] = useSlot();
  let {
    labelProps,
    groupProps,
    inputProps,
    incrementButtonProps,
    decrementButtonProps,
    descriptionProps,
    errorMessageProps,
    ...validation
  } = useNumberField(
    {
      ...removeDataAttributes(props),
      label,
      validationBehavior: props.validationBehavior ?? "native",
    },
    state,
    inputRef
  );

  let RenderChildren = useRenderChildren({
    ...props,
    values: {
      state,
      isDisabled: props.isDisabled || false,
      isInvalid: validation.isInvalid || false,
    },
    defaultClassName: "react-aria-NumberField",
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <Provider
      values={[
        [NumberFieldStateContext, state],
        [GroupContext, groupProps],
        [InputContext, { ...inputProps, ref: inputRef }],
        [LabelContext, { ...labelProps, ref: labelRef }],
        [
          ButtonContext,
          {
            slots: {
              increment: incrementButtonProps,
              decrement: decrementButtonProps,
            },
          },
        ],
        [
          TextContext,
          {
            slots: {
              description: descriptionProps,
              errorMessage: errorMessageProps,
            },
          },
        ],
        [FieldErrorContext, validation],
      ]}
    >
      <div
        {...DOMProps}
        {...RenderChildren}
        ref={ref}
        slot={props.slot || undefined}
        data-disabled={props.isDisabled || undefined}
        data-invalid={validation.isInvalid || undefined}
      />
      {props.name && (
        <input
          type="hidden"
          name={props.name}
          value={isNaN(state.numberValue) ? "" : state.numberValue}
        />
      )}
    </Provider>
  );
}

/**
 * A number field allows a user to enter a number, and increment or decrement the value using stepper buttons.
 */
const _NumberField = /*#__PURE__*/ (forwardRef as ForwardRefType)(NumberField);
export { _NumberField as NumberField };
