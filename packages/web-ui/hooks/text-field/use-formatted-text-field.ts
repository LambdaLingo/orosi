import { type RefObject, useEffect, useRef } from "react";
import type { AriaTextFieldProps } from "types";
import { useEffectEvent } from "hooks";
import { mergeProps } from "utilities";
import { type TextFieldAria, useTextField } from "./use-text-field";

type FormattedTextFieldState = {
  validate: (val: string) => boolean;
  setInputValue: (val: string) => void;
};

function supportsNativeBeforeInputEvent(): boolean {
  return (
    window?.InputEvent &&
    typeof InputEvent.prototype.getTargetRanges === "function"
  );
}

export function useFormattedTextField(
  props: AriaTextFieldProps,
  state: FormattedTextFieldState,
  inputRef: RefObject<HTMLInputElement>
): TextFieldAria {
  // All browsers implement the 'beforeinput' event natively except Firefox
  // (currently behind a flag as of Firefox 84). React's polyfill does not
  // run in all cases that the native event fires, e.g. when deleting text.
  // Use the native event if available so that we can prevent invalid deletions.
  // We do not attempt to polyfill this in Firefox since it would be very complicated,
  // the benefit of doing so is fairly minor, and it's going to be natively supported soon.
  const onBeforeInputFallback = useEffectEvent((e: InputEvent) => {
    const input = inputRef.current!;

    // Compute the next value of the input if the event is allowed to proceed.
    // See https://www.w3.org/TR/input-events-2/#interface-InputEvent-Attributes for a full list of input types.
    let nextValue: string | null = null;
    switch (e.inputType) {
      case "historyUndo":
      case "historyRedo":
        // Explicitly allow undo/redo. e.data is null in this case, but there's no need to validate,
        // because presumably the input would have already been validated previously.
        return;
      case "deleteContent":
      case "deleteByCut":
      case "deleteByDrag":
        nextValue =
          input.value.slice(0, input.selectionStart!) +
          input.value.slice(input.selectionEnd!);
        break;
      case "deleteContentForward":
        // This is potentially incorrect, since the browser may actually delete more than a single UTF-16
        // character. In reality, a full Unicode grapheme cluster consisting of multiple UTF-16 characters
        // or code points may be deleted. However, in our currently supported locales, there are no such cases.
        // If we support additional locales in the future, this may need to change.
        nextValue =
          input.selectionEnd === input.selectionStart
            ? input.value.slice(0, input.selectionStart!) +
              input.value.slice(input.selectionEnd! + 1)
            : input.value.slice(0, input.selectionStart!) +
              input.value.slice(input.selectionEnd!);
        break;
      case "deleteContentBackward":
        nextValue =
          input.selectionEnd === input.selectionStart
            ? input.value.slice(0, input.selectionStart! - 1) +
              input.value.slice(input.selectionStart!)
            : input.value.slice(0, input.selectionStart!) +
              input.value.slice(input.selectionEnd!);
        break;
      case "deleteSoftLineBackward":
      case "deleteHardLineBackward":
        nextValue = input.value.slice(input.selectionStart!);
        break;
      default:
        if (e.data !== null) {
          nextValue =
            input.value.slice(0, input.selectionStart!) +
            e.data +
            input.value.slice(input.selectionEnd!);
        }
        break;
    }

    // If we did not compute a value, or the new value is invalid, prevent the event
    // so that the browser does not update the input text, move the selection, or add to
    // the undo/redo stack.
    if (nextValue === null || !state.validate(nextValue)) {
      e.preventDefault();
    }
  });

  useEffect(() => {
    if (!supportsNativeBeforeInputEvent()) {
      return;
    }

    const input = inputRef.current!;
    input.addEventListener("beforeinput", onBeforeInputFallback, false);
    return () => {
      input.removeEventListener("beforeinput", onBeforeInputFallback, false);
    };
  }, [inputRef, onBeforeInputFallback]);

  const onBeforeInput = !supportsNativeBeforeInputEvent()
    ? (e: InputEvent) => {
        const nextValue =
          (e.target as HTMLInputElement).value.slice(
            0,
            (e.target as HTMLInputElement).selectionStart!
          ) +
          e.data +
          (e.target as HTMLInputElement).value.slice(
            (e.target as HTMLInputElement).selectionEnd!
          );

        if (!state.validate(nextValue)) {
          e.preventDefault();
        }
      }
    : null;

  const {
    labelProps,
    inputProps: textFieldProps,
    descriptionProps,
    errorMessageProps,
    ...validation
  } = useTextField(props, inputRef);

  const compositionStartState = useRef<{
    value: string;
    selectionStart: number | null;
    selectionEnd: number | null;
  } | null>(null);
  return {
    inputProps: mergeProps(textFieldProps, {
      onBeforeInput,
      onCompositionStart() {
        // Chrome does not implement Input Events Level 2, which specifies the insertFromComposition
        // and deleteByComposition inputType values for the beforeinput event. These are meant to occur
        // at the end of a composition (e.g. Pinyin IME, Android auto correct, etc.), and crucially, are
        // cancelable. The insertCompositionText and deleteCompositionText input types are not cancelable,
        // nor would we want to cancel them because the input from the user is incomplete at that point.
        // In Safari, insertFromComposition/deleteFromComposition will fire, however, allowing us to cancel
        // the final composition result if it is invalid. As a fallback for Chrome and Firefox, which either
        // don't support Input Events Level 2, or beforeinput at all, we store the state of the input when
        // the compositionstart event fires, and undo the changes in compositionend (below) if it is invalid.
        // Unfortunately, this messes up the undo/redo stack, but until insertFromComposition/deleteByComposition
        // are implemented, there is no other way to prevent composed input.
        // See https://bugs.chromium.org/p/chromium/issues/detail?id=1022204
        if (inputRef.current !== null) {
          const { value, selectionStart, selectionEnd } = inputRef.current;
          compositionStartState.current = {
            value,
            selectionStart,
            selectionEnd,
          };
        }
      },
      onCompositionEnd() {
        if (
          inputRef.current !== null &&
          compositionStartState.current !== null
        ) {
          if (!state.validate(inputRef.current.value)) {
            // Restore the input value in the DOM immediately so we can synchronously update the selection position.
            // But also update the value in React state as well so it is correct for future updates.
            const { value, selectionStart, selectionEnd } =
              compositionStartState.current;
            inputRef.current.value = value;
            inputRef.current.setSelectionRange(selectionStart, selectionEnd);
            state.setInputValue(value);
          }
        }
      },
    }),
    labelProps,
    descriptionProps,
    errorMessageProps,
    ...validation,
  };
}
