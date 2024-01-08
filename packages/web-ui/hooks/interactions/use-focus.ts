// Portions of the code in this file are based on code from react.
// Original licensing for the following can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/facebook/react/tree/cc7c1aece46a6b69b41958d731e0fd27c94bfc6c/packages/react-interactions

import type { FocusEvent } from "react";
import { useCallback } from "react";
import type { DOMAttributes, FocusableElement } from "../../types/shared/dom";
import { useSyntheticBlurEvent } from "../../utilities/interactions/utils";
import type { FocusEvents } from "../../types/shared/events";

export interface FocusProps<Target = FocusableElement>
  extends FocusEvents<Target> {
  /** Whether the focus events should be disabled. */
  isDisabled?: boolean;
}

export interface FocusResult<Target = FocusableElement> {
  /** Props to spread onto the target element. */
  focusProps: DOMAttributes<Target>;
}

/**
 * Handles focus events for the immediate target.
 * Focus events on child elements will be ignored.
 */
export function useFocus<Target extends FocusableElement = FocusableElement>(
  props: FocusProps<Target>
): FocusResult<Target> {
  let {
    isDisabled,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    onFocusChange,
  } = props;

  const onBlur: FocusProps<Target>["onBlur"] = useCallback(
    (e: FocusEvent<Target>) => {
      if (e.target === e.currentTarget) {
        if (onBlurProp) {
          onBlurProp(e);
        }

        if (onFocusChange) {
          onFocusChange(false);
        }

        return true;
      }
    },
    [onBlurProp, onFocusChange]
  );

  const onSyntheticFocus = useSyntheticBlurEvent<Target>(onBlur);

  const onFocus: FocusProps<Target>["onFocus"] = useCallback(
    (e: FocusEvent<Target>) => {
      // Double check that document.activeElement actually matches e.target in case a previously chained
      // focus handler already moved focus somewhere else.
      if (e.target === e.currentTarget && document.activeElement === e.target) {
        if (onFocusProp) {
          onFocusProp(e);
        }

        if (onFocusChange) {
          onFocusChange(true);
        }

        onSyntheticFocus(e);
      }
    },
    [onFocusChange, onFocusProp, onSyntheticFocus]
  );

  return {
    focusProps: {
      onFocus:
        !isDisabled && (onFocusProp || onFocusChange || onBlurProp)
          ? onFocus
          : undefined,
      onBlur: !isDisabled && (onBlurProp || onFocusChange) ? onBlur : undefined,
    },
  };
}
