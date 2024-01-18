import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  RefObject,
} from "react";
import type {
  AriaSearchFieldProps,
  SearchFieldState,
  ButtonProps,
  DOMAttributes,
  ValidationResult,
} from "types";
import { useTextField, useLocalizedStringFormatter } from "hooks";
import {} from "intl";
import { chain } from "utilities";
import intlMessages from "intl/languages";

export type SearchFieldAria = {
  /** Props for the text field's visible label element (if any). */
  labelProps: LabelHTMLAttributes<HTMLLabelElement>;
  /** Props for the input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  /** Props for the clear button. */
  clearButtonProps: ButtonProps;
  /** Props for the searchfield's description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the searchfield's error message element, if any. */
  errorMessageProps: DOMAttributes;
} & ValidationResult;

/**
 * Provides the behavior and accessibility implementation for a search field.
 * @param props - Props for the search field.
 * @param state - State for the search field, as returned by `useSearchFieldState`.
 * @param inputRef - A ref to the input element.
 */
export function useSearchField(
  props: AriaSearchFieldProps,
  state: SearchFieldState,
  inputRef: RefObject<HTMLInputElement>
): SearchFieldAria {
  let stringFormatter = useLocalizedStringFormatter(
    intlMessages,
    "@react-aria/searchfield"
  );
  let {
    isDisabled,
    isReadOnly,
    onSubmit = () => {},
    onClear,
    type = "search",
  } = props;

  let onKeyDown = (e) => {
    const key = e.key;

    if (key === "Enter") {
      e.preventDefault();
    }

    if (isDisabled || isReadOnly) {
      return;
    }

    if (key === "Enter") {
      onSubmit(state.value);
    }

    if (key === "Escape") {
      if (state.value === "") {
        e.continuePropagation();
      } else {
        state.setValue("");
        if (onClear) {
          onClear();
        }
      }
    }
  };

  let onClearButtonClick = () => {
    state.setValue("");

    if (onClear) {
      onClear();
    }
  };

  let onPressStart = () => {
    // this is in PressStart for mobile so that touching the clear button doesn't remove focus from
    // the input and close the keyboard
    inputRef.current?.focus();
  };

  let {
    labelProps,
    inputProps,
    descriptionProps,
    errorMessageProps,
    ...validation
  } = useTextField(
    {
      ...props,
      value: state.value,
      onChange: state.setValue,
      onKeyDown: !isReadOnly
        ? chain(onKeyDown, props.onKeyDown)
        : props.onKeyDown,
      type,
    },
    inputRef
  );

  return {
    labelProps,
    inputProps: {
      ...inputProps,
      // already handled by useSearchFieldState
      defaultValue: undefined,
    },
    clearButtonProps: {
      "aria-label": stringFormatter.format("Clear search"),
      excludeFromTabOrder: true,
      // @ts-ignore
      preventFocusOnPress: true,
      isDisabled: isDisabled || isReadOnly,
      onPress: onClearButtonClick,
      onPressStart,
    },
    descriptionProps,
    errorMessageProps,
    ...validation,
  };
}
