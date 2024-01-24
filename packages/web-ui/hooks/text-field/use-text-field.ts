import {
  type ChangeEvent,
  type DOMFactory,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactDOM,
  type RefObject,
  useEffect,
} from "react";
import type {
  DOMAttributes,
  ValidationResult,
  AriaTextFieldProps,
} from "types";
import {
  useFormReset,
  useControlledState,
  useField,
  useFocusable,
  useFormValidation,
  useFormValidationState,
} from "hooks";
import { filterDOMProps, getOwnerWindow, mergeProps } from "utilities";

/**
 * A map of HTML element names and their interface types.
 * For example `'a'` -> `HTMLAnchorElement`.
 */
type IntrinsicHTMLElements = {
  [K in keyof IntrinsicHTMLAttributes]: IntrinsicHTMLAttributes[K] extends HTMLAttributes<
    infer T
  >
    ? T
    : never;
};

/**
 * A map of HTML element names and their attribute interface types.
 * For example `'a'` -> `AnchorHTMLAttributes<HTMLAnchorElement>`.
 */
type IntrinsicHTMLAttributes = {
  [K in keyof ReactDOM]: ReactDOM[K] extends DOMFactory<infer T, any>
    ? T
    : never;
};

type DefaultElementType = "input";

/**
 * The intrinsic HTML element names that `useTextField` supports; e.g. `input`,
 * `textarea`.
 */
type TextFieldIntrinsicElements = keyof Pick<
  IntrinsicHTMLElements,
  "input" | "textarea"
>;

/**
 * The HTML element interfaces that `useTextField` supports based on what is
 * defined for `TextFieldIntrinsicElements`; e.g. `HTMLInputElement`,
 * `HTMLTextAreaElement`.
 */
type TextFieldHTMLElementType = Pick<
  IntrinsicHTMLElements,
  TextFieldIntrinsicElements
>;

/**
 * The HTML attributes interfaces that `useTextField` supports based on what
 * is defined for `TextFieldIntrinsicElements`; e.g. `InputHTMLAttributes`,
 * `TextareaHTMLAttributes`.
 */
type TextFieldHTMLAttributesType = Pick<
  IntrinsicHTMLAttributes,
  TextFieldIntrinsicElements
>;

/**
 * The type of `inputProps` returned by `useTextField`; e.g. `InputHTMLAttributes`,
 * `TextareaHTMLAttributes`.
 */
type TextFieldInputProps<T extends TextFieldIntrinsicElements> =
  TextFieldHTMLAttributesType[T];

export type AriaTextFieldOptions<T extends TextFieldIntrinsicElements> = {
  /**
   * The HTML element used to render the input, e.g. 'input', or 'textarea'.
   * It determines whether certain HTML attributes will be included in `inputProps`.
   * For example, [`type`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-type).
   * @default 'input'
   */
  inputElementType?: T;
  /**
   * Controls whether inputted text is automatically capitalized and, if so, in what manner.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize).
   */
  autoCapitalize?: "off" | "none" | "on" | "sentences" | "words" | "characters";
} & AriaTextFieldProps;

/**
 * The type of `ref` object that can be passed to `useTextField` based on the given
 * intrinsic HTML element name; e.g.`RefObject<HTMLInputElement>`,
 * `RefObject<HTMLTextAreaElement>`.
 */
type TextFieldRefObject<T extends TextFieldIntrinsicElements> = RefObject<
  TextFieldHTMLElementType[T]
>;

export type TextFieldAria<
  T extends TextFieldIntrinsicElements = DefaultElementType,
> = {
  /** Props for the input element. */
  inputProps: TextFieldInputProps<T>;
  /** Props for the text field's visible label element, if any. */
  labelProps: DOMAttributes | LabelHTMLAttributes<HTMLLabelElement>;
  /** Props for the text field's description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the text field's error message element, if any. */
  errorMessageProps: DOMAttributes;
} & ValidationResult;

/**
 * Provides the behavior and accessibility implementation for a text field.
 * @param props - Props for the text field.
 * @param ref - Ref to the HTML input or textarea element.
 */
export function useTextField<
  T extends TextFieldIntrinsicElements = DefaultElementType,
>(
  props: AriaTextFieldOptions<T>,
  ref: TextFieldRefObject<T>
): TextFieldAria<T> {
  const {
    inputElementType = "input",
    isDisabled = false,
    isRequired = false,
    isReadOnly = false,
    type = "text",
    validationBehavior = "aria",
  }: AriaTextFieldOptions<TextFieldIntrinsicElements> = props;
  const [value, setValue] = useControlledState<string>(
    props.value,
    props.defaultValue || "",
    props.onChange
  );
  const { focusableProps } = useFocusable(props, ref);
  const validationState = useFormValidationState({
    ...props,
    value,
  });
  const { isInvalid, validationErrors, validationDetails } =
    validationState.displayValidation;
  const { labelProps, fieldProps, descriptionProps, errorMessageProps } =
    useField({
      ...props,
      isInvalid,
      errorMessage: props.errorMessage || validationErrors,
    });
  const domProps = filterDOMProps(props, { labelable: true });

  const inputOnlyProps = {
    type,
    pattern: props.pattern,
  };

  useFormReset(ref, value, setValue);
  useFormValidation(props, validationState, ref);

  useEffect(() => {
    // This works around a React/Chrome bug that prevents textarea elements from validating when controlled.
    // We prevent React from updating defaultValue (i.e. children) of textarea when `value` changes,
    // which causes Chrome to skip validation. Only updating `value` is ok in our case since our
    // textareas are always controlled. React is planning on removing this synchronization in a
    // future major version.
    // https://github.com/facebook/react/issues/19474
    // https://github.com/facebook/react/issues/11896
    if (
      ref.current instanceof getOwnerWindow(ref.current).HTMLTextAreaElement
    ) {
      const input = ref.current;
      Object.defineProperty(input, "defaultValue", {
        get: () => input.value,
        set: () => {},
        configurable: true,
      });
    }
  }, [ref]);

  return {
    labelProps,
    inputProps: mergeProps(
      domProps,
      inputElementType === "input" ? inputOnlyProps : undefined,
      {
        disabled: isDisabled,
        readOnly: isReadOnly,
        required: isRequired && validationBehavior === "native",
        "aria-required":
          (isRequired && validationBehavior === "aria") || undefined,
        "aria-invalid": isInvalid || undefined,
        "aria-errormessage": props["aria-errormessage"],
        "aria-activedescendant": props["aria-activedescendant"],
        "aria-autocomplete": props["aria-autocomplete"],
        "aria-haspopup": props["aria-haspopup"],
        value,
        onChange: (e: ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
        },
        autoComplete: props.autoComplete,
        autoCapitalize: props.autoCapitalize,
        maxLength: props.maxLength,
        minLength: props.minLength,
        name: props.name,
        placeholder: props.placeholder,
        inputMode: props.inputMode,

        // Clipboard events
        onCopy: props.onCopy,
        onCut: props.onCut,
        onPaste: props.onPaste,

        // Composition events
        onCompositionEnd: props.onCompositionEnd,
        onCompositionStart: props.onCompositionStart,
        onCompositionUpdate: props.onCompositionUpdate,

        // Selection events
        onSelect: props.onSelect,

        // Input events
        onBeforeInput: props.onBeforeInput,
        onInput: props.onInput,
        ...focusableProps,
        ...fieldProps,
      }
    ),
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
    validationDetails,
  };
}
