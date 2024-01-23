import type {
  AriaRadioGroupProps,
  RadioGroupState,
  DOMAttributes,
  ValidationResult,
} from "types";
import { radioGroupData } from "store";
import { useId, useField, useFocusWithin, useLocale } from "hooks";
import { filterDOMProps, mergeProps, getFocusableTreeWalker } from "utilities";

export type RadioGroupAria = {
  /** Props for the radio group wrapper element. */
  radioGroupProps: DOMAttributes;
  /** Props for the radio group's visible label (if any). */
  labelProps: DOMAttributes;
  /** Props for the radio group description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the radio group error message element, if any. */
  errorMessageProps: DOMAttributes;
} & ValidationResult;

/**
 * Provides the behavior and accessibility implementation for a radio group component.
 * Radio groups allow users to select a single item from a list of mutually exclusive options.
 * @param props - Props for the radio group.
 * @param state - State for the radio group, as returned by `useRadioGroupState`.
 */
export function useRadioGroup(
  props: AriaRadioGroupProps,
  state: RadioGroupState
): RadioGroupAria {
  const {
    name,
    isReadOnly,
    isRequired,
    isDisabled,
    orientation = "vertical",
    validationBehavior = "aria",
  } = props;
  const { direction } = useLocale();

  const { isInvalid, validationErrors, validationDetails } =
    state.displayValidation;
  const { labelProps, fieldProps, descriptionProps, errorMessageProps } =
    useField({
      ...props,
      // Radio group is not an HTML input element so it
      // shouldn't be labeled by a <label> element.
      labelElementType: "span",
      isInvalid: state.isInvalid,
      errorMessage: props.errorMessage || validationErrors,
    });

  const domProps = filterDOMProps(props, { labelable: true });

  // When the radio group loses focus, reset the focusable radio to null if
  // there is no selection. This allows tabbing into the group from either
  // direction to go to the first or last radio.
  const { focusWithinProps } = useFocusWithin({
    onBlurWithin(e: React.FocusEvent) {
      props.onBlur?.(e);
      if (!state.selectedValue) {
        state.setLastFocusedValue(null);
      }
    },
    onFocusWithin: props.onFocus,
    onFocusWithinChange: props.onFocusChange,
  });

  const onKeyDown = (e: React.KeyboardEvent): void => {
    let nextDir;
    switch (e.key) {
      case "ArrowRight":
        if (direction === "rtl" && orientation !== "vertical") {
          nextDir = "prev";
        } else {
          nextDir = "next";
        }
        break;
      case "ArrowLeft":
        if (direction === "rtl" && orientation !== "vertical") {
          nextDir = "next";
        } else {
          nextDir = "prev";
        }
        break;
      case "ArrowDown":
        nextDir = "next";
        break;
      case "ArrowUp":
        nextDir = "prev";
        break;
      default:
        return;
    }
    e.preventDefault();
    if (e.currentTarget instanceof Element) {
      const walker = getFocusableTreeWalker(e.currentTarget, {
        from: e.target as Element,
      });
      let nextElem;
      if (nextDir === "next") {
        nextElem = walker.nextNode();
        if (!nextElem) {
          walker.currentNode = e.currentTarget;
          nextElem = walker.firstChild();
        }
      } else {
        nextElem = walker.previousNode();
        if (!nextElem) {
          walker.currentNode = e.currentTarget;
          nextElem = walker.lastChild();
        }
      }
      if (nextElem instanceof HTMLInputElement) {
        // Call focus on nextElem so that keyboard navigation scrolls the radio into view
        nextElem.focus();
        state.setSelectedValue(nextElem.value);
      }
    }
  };

  const groupName = useId(name);
  radioGroupData.set(state, {
    name: groupName,
    descriptionId: descriptionProps.id,
    errorMessageId: errorMessageProps.id,
    validationBehavior,
  });

  return {
    radioGroupProps: mergeProps(domProps, {
      // https://www.w3.org/TR/wai-aria-1.2/#radiogroup
      role: "radiogroup",
      onKeyDown,
      "aria-invalid": state.isInvalid || undefined,
      "aria-errormessage": props["aria-errormessage"],
      "aria-readonly": isReadOnly || undefined,
      "aria-required": isRequired || undefined,
      "aria-disabled": isDisabled || undefined,
      "aria-orientation": orientation,
      ...fieldProps,
      ...focusWithinProps,
    }),
    labelProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
    validationDetails,
  };
}
