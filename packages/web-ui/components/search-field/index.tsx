import { createContext, type ForwardedRef, forwardRef, useRef } from "react";
import type {
  AriaSearchFieldProps,
  SearchFieldState,
  ContextValue,
  ForwardRefType,
  RenderChildren,
  SlotProps,
  RACValidation,
} from "types";
import {
  ButtonContext,
  TextContext,
  LabelContext,
  InputContext,
  GroupContext,
  FieldErrorContext,
} from "store";
import {
  useSearchField,
  useContextProps,
  useRenderChildren,
  useSearchFieldState,
  useSlot,
} from "hooks";
import { removeDataAttributes, filterDOMProps } from "utilities";
import { Provider } from "components/provider";

export type SearchFieldRenderProps = {
  /**
   * Whether the search field is empty.
   * @selector [data-empty]
   */
  isEmpty: boolean;
  /**
   * Whether the search field is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the search field is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * State of the search field.
   */
  state: SearchFieldState;
};

export type SearchFieldProps = Omit<
  AriaSearchFieldProps,
  | "label"
  | "placeholder"
  | "description"
  | "errorMessage"
  | "validationState"
  | "validationBehavior"
> &
  RACValidation &
  RenderChildren<SearchFieldRenderProps> &
  SlotProps;

export const SearchFieldContext =
  createContext<ContextValue<SearchFieldProps, HTMLDivElement>>(null);

function SearchField(
  props: SearchFieldProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  [props, ref] = useContextProps(props, ref, SearchFieldContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [labelRef, label] = useSlot();
  const state = useSearchFieldState({
    ...props,
    validationBehavior: props.validationBehavior ?? "native",
  });

  const {
    labelProps,
    inputProps,
    clearButtonProps,
    descriptionProps,
    errorMessageProps,
    ...validation
  } = useSearchField(
    {
      ...removeDataAttributes(props),
      label,
      validationBehavior: props.validationBehavior ?? "native",
    },
    state,
    inputRef
  );

  const RenderChildren = useRenderChildren({
    ...props,
    values: {
      isEmpty: state.value === "",
      isDisabled: props.isDisabled || false,
      isInvalid: validation.isInvalid || false,
      state,
    },
  });

  const DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <div
      {...DOMProps}
      {...RenderChildren}
      data-disabled={props.isDisabled || undefined}
      data-empty={state.value === "" || undefined}
      data-invalid={validation.isInvalid || undefined}
      ref={ref}
      slot={props.slot || undefined}
    >
      <Provider
        values={[
          [LabelContext, { ...labelProps, ref: labelRef }],
          [InputContext, { ...inputProps, ref: inputRef }],
          [ButtonContext, clearButtonProps],
          [
            TextContext,
            {
              slots: {
                description: descriptionProps,
                errorMessage: errorMessageProps,
              },
            },
          ],
          [
            GroupContext,
            {
              isInvalid: validation.isInvalid,
              isDisabled: props.isDisabled || false,
            },
          ],
          [FieldErrorContext, validation],
        ]}
      >
        {RenderChildren.children}
      </Provider>
    </div>
  );
}

/**
 * A search field allows a user to enter and clear a search query.
 */
const _SearchField = /*#__PURE__*/ (forwardRef as ForwardRefType)(SearchField);
export { _SearchField as SearchField };
