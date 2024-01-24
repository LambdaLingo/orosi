import type {
  ButtonProps,
  DOMAttributes,
  FocusableElement,
  InputBase,
  RangeInputBase,
  Validation,
  ValueBase,
} from "types";
import { announce, clearAnnouncer } from "utilities";
// @ts-ignore
import intlMessages from "store/i18n/builtin-strings/*.json";
import { useEffect, useRef } from "react";
import {
  useEffectEvent,
  useGlobalListeners,
  useLocalizedStringFormatter,
} from "hooks";

export type SpinButtonProps = {
  textValue: string;
  onIncrement: () => void;
  onIncrementPage?: () => void;
  onDecrement: () => void;
  onDecrementPage?: () => void;
  onDecrementToMin?: () => void;
  onIncrementToMax?: () => void;
} & InputBase &
  Validation<number> &
  ValueBase<number> &
  RangeInputBase<number>;

export type SpinbuttonAria = {
  spinButtonProps: DOMAttributes;
  incrementButtonProps: ButtonProps;
  decrementButtonProps: ButtonProps;
};

export function useSpinButton(props: SpinButtonProps): SpinbuttonAria {
  const _async = useRef<number>();
  let {
    value,
    textValue,
    minValue,
    maxValue,
    isDisabled,
    isReadOnly,
    isRequired,
    onIncrement,
    onIncrementPage,
    onDecrement,
    onDecrementPage,
    onDecrementToMin,
    onIncrementToMax,
  } = props;
  const stringFormatter = useLocalizedStringFormatter(
    intlMessages,
    "@react-aria/spinbutton"
  );

  const clearAsync = (): void => {
    clearTimeout(_async.current);
  };

  useEffect(() => {
    return () => {
      clearAsync();
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<FocusableElement>): void => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || isReadOnly) {
      return;
    }

    switch (e.key) {
      case "PageUp":
        if (onIncrementPage) {
          e.preventDefault();
          onIncrementPage();
          break;
        }
      // fallthrough!
      case "ArrowUp":
      case "Up":
        if (onIncrement) {
          e.preventDefault();
          onIncrement();
        }
        break;
      case "PageDown":
        if (onDecrementPage) {
          e.preventDefault();
          onDecrementPage();
          break;
        }
      // fallthrough
      case "ArrowDown":
      case "Down":
        if (onDecrement) {
          e.preventDefault();
          onDecrement();
        }
        break;
      case "Home":
        if (onDecrementToMin) {
          e.preventDefault();
          onDecrementToMin();
        }
        break;
      case "End":
        if (onIncrementToMax) {
          e.preventDefault();
          onIncrementToMax();
        }
        break;
    }
  };

  const isFocused = useRef(false);
  const onFocus = (): void => {
    isFocused.current = true;
  };

  const onBlur = (): void => {
    isFocused.current = false;
  };

  // Replace Unicode hyphen-minus (U+002D) with minus sign (U+2212).
  // This ensures that macOS VoiceOver announces it as "minus" even with other characters between the minus sign
  // and the number (e.g. currency symbol). Otherwise it announces nothing because it assumes the character is a hyphen.
  // In addition, replace the empty string with the word "Empty" so that iOS VoiceOver does not read "50%" for an empty field.
  textValue =
    textValue === ""
      ? stringFormatter.format("Empty")
      : (textValue || `${value}`).replace("-", "\u2212");

  useEffect(() => {
    if (isFocused.current) {
      clearAnnouncer("assertive");
      announce(textValue, "assertive");
    }
  }, [textValue]);

  const onIncrementPressStart = useEffectEvent((initialStepDelay: number) => {
    clearAsync();
    onIncrement();
    // Start spinning after initial delay
    _async.current = window.setTimeout(() => {
      if (
        maxValue &&
        value &&
        (isNaN(maxValue) || isNaN(value) || value < maxValue)
      ) {
        onIncrementPressStart(60);
      }
    }, initialStepDelay);
  });

  const onDecrementPressStart = useEffectEvent((initialStepDelay: number) => {
    clearAsync();
    onDecrement();
    // Start spinning after initial delay
    _async.current = window.setTimeout(() => {
      if (
        minValue &&
        value &&
        (isNaN(minValue) || isNaN(value) || value > minValue)
      ) {
        onDecrementPressStart(60);
      }
    }, initialStepDelay);
  });

  const cancelContextMenu = (e: MouseEvent): void => {
    e.preventDefault();
  };

  const { addGlobalListener, removeAllGlobalListeners } = useGlobalListeners();

  return {
    spinButtonProps: {
      role: "spinbutton",
      "aria-valuenow": value && !isNaN(value) ? value : undefined,
      "aria-valuetext": textValue,
      "aria-valuemin": minValue,
      "aria-valuemax": maxValue,
      "aria-disabled": isDisabled || undefined,
      "aria-readonly": isReadOnly || undefined,
      "aria-required": isRequired || undefined,
      onKeyDown,
      onFocus,
      onBlur,
    },
    incrementButtonProps: {
      onPressStart: () => {
        onIncrementPressStart(400);
        addGlobalListener(window, "contextmenu", cancelContextMenu);
      },
      onPressEnd: () => {
        clearAsync();
        removeAllGlobalListeners();
      },
      onFocus,
      onBlur,
    },
    decrementButtonProps: {
      onPressStart: () => {
        onDecrementPressStart(400);
        addGlobalListener(window, "contextmenu", cancelContextMenu);
      },
      onPressEnd: () => {
        clearAsync();
        removeAllGlobalListeners();
      },
      onFocus,
      onBlur,
    },
  };
}
