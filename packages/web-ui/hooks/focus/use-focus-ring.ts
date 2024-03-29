import { useCallback, useRef, useState } from "react";
import type { DOMAttributes } from "types";
import {
  isFocusVisible,
  useFocusVisibleListener,
  useFocus,
  useFocusWithin,
} from "hooks/interactions";

export type FocusRingProps = {
  /**
   * Whether to show the focus ring when something
   * inside the container element has focus (true), or
   * only if the container itself has focus (false).
   * @default 'false'
   */
  within?: boolean;

  /** Whether the element is a text input. */
  isTextInput?: boolean;

  /** Whether the element will be auto focused. */
  autoFocus?: boolean;
};

export type FocusRingResult = {
  /** Whether the element is currently focused. */
  isFocused: boolean;

  /** Whether keyboard focus should be visible. */
  isFocusVisible: boolean;

  /** Props to apply to the container element with the focus ring. */
  focusProps: DOMAttributes;
};

/**
 * Determines whether a focus ring should be shown to indicate keyboard focus.
 * Focus rings are visible only when the user is interacting with a keyboard,
 * not with a mouse, touch, or other input methods.
 */
export function useFocusRing(props: FocusRingProps = {}): FocusRingResult {
  const { autoFocus = false, isTextInput, within } = props;
  const state = useRef({
    isFocused: false,
    isFocusVisible: autoFocus || isFocusVisible(),
  });
  const [isFocused, setIsFocused] = useState(false);
  const [isFocusVisibleState, setIsFocusVisibleState] = useState(
    () => state.current.isFocused && state.current.isFocusVisible
  );

  const updateState = useCallback(() => {
    setIsFocusVisibleState(
      state.current.isFocused && state.current.isFocusVisible
    );
  }, []);

  const onFocusChange = useCallback(
    (isFocused: boolean) => {
      state.current.isFocused = isFocused;
      setIsFocused(isFocused);
      updateState();
    },
    [updateState]
  );

  useFocusVisibleListener(
    (isFocusVisible) => {
      state.current.isFocusVisible = isFocusVisible;
      updateState();
    },
    [],
    { isTextInput }
  );

  const { focusProps } = useFocus({
    isDisabled: within,
    onFocusChange,
  });

  const { focusWithinProps } = useFocusWithin({
    isDisabled: !within,
    onFocusWithinChange: onFocusChange,
  });

  return {
    isFocused,
    isFocusVisible: isFocusVisibleState,
    focusProps: within ? focusWithinProps : focusProps,
  };
}
