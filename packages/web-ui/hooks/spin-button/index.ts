import type {
  ButtonProps,
  DOMAttributes,
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
  textValue?: string;
  onIncrement?: () => void;
  onIncrementPage?: () => void;
  onDecrement?: () => void;
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

  const clearAsync = () => clearTimeout(_async.current);

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => clearAsync();
  }, []);

  let onKeyDown = (e) => {
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

  let isFocused = useRef(false);
  let onFocus = () => {
    isFocused.current = true;
  };

  let onBlur = () => {
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
      if (isNaN(maxValue) || isNaN(value) || value < maxValue) {
        onIncrementPressStart(60);
      }
    }, initialStepDelay);
  });

  const onDecrementPressStart = useEffectEvent((initialStepDelay: number) => {
    clearAsync();
    onDecrement();
    // Start spinning after initial delay
    _async.current = window.setTimeout(() => {
      if (isNaN(minValue) || isNaN(value) || value > minValue) {
        onDecrementPressStart(60);
      }
    }, initialStepDelay);
  });

  let cancelContextMenu = (e) => {
    e.preventDefault();
  };

  let { addGlobalListener, removeAllGlobalListeners } = useGlobalListeners();

  return {
    spinButtonProps: {
      role: "spinbutton",
      "aria-valuenow": !isNaN(value) ? value : null,
      "aria-valuetext": textValue,
      "aria-valuemin": minValue,
      "aria-valuemax": maxValue,
      "aria-disabled": isDisabled || null,
      "aria-readonly": isReadOnly || null,
      "aria-required": isRequired || null,
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
