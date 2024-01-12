import type {
  ForwardedRef,
  MutableRefObject,
  ReactNode,
  RefObject,
} from "react";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
} from "react";
import type {
  DOMAttributes,
  FocusableDOMProps,
  FocusableElement,
  IsDisabledProp,
  FocusableProps,
} from "types";
import { mergeProps, focusSafely } from "utilities";
import { useFocus, useKeyboard } from "hooks/interactions";
import { useObjectRef, useSyncRef } from "hooks/shared";

type FocusableOptions = FocusableProps & FocusableDOMProps & IsDisabledProp;

type FocusableProviderProps = DOMAttributes & {
  /** The child element to provide DOM props to. */
  children?: ReactNode;
};

type FocusableContextValue = FocusableProviderProps & {
  ref?: MutableRefObject<FocusableElement>;
};

const FocusableContext = createContext<FocusableContextValue | null>(null);

function useFocusableContext(
  ref: RefObject<FocusableElement>
): FocusableContextValue {
  const context = useContext(FocusableContext) || {};
  useSyncRef(context, ref);

  const { ref: _, ...otherProps } = context;
  return otherProps;
}

/**
 * Provides DOM props to the nearest focusable child.
 */
function FocusableProvider(
  props: FocusableProviderProps,
  ref: ForwardedRef<FocusableElement>
): JSX.Element {
  const { children, ...otherProps } = props;
  const objRef = useObjectRef(ref);

  const context = {
    ...otherProps,
    ref: objRef as MutableRefObject<FocusableElement>, //review this line later
  };

  return (
    <FocusableContext.Provider value={context}>
      {children}
    </FocusableContext.Provider>
  );
}

const _FocusableProvider = forwardRef(FocusableProvider);
export { _FocusableProvider as FocusableProvider };

export type FocusableAria = {
  /** Props for the focusable element. */
  focusableProps: DOMAttributes;
};

/**
 * Used to make an element focusable and capable of auto focus.
 */
export function useFocusable(
  props: FocusableOptions,
  domRef: RefObject<FocusableElement>
): FocusableAria {
  const { focusProps } = useFocus(props);
  const { keyboardProps } = useKeyboard(props);
  const interactions = mergeProps(focusProps, keyboardProps);
  const domProps = useFocusableContext(domRef);
  const interactionProps = props.isDisabled ? {} : domProps;
  const autoFocusRef = useRef(props.autoFocus);

  useEffect(() => {
    if (autoFocusRef.current && domRef.current) {
      focusSafely(domRef.current);
    }
    autoFocusRef.current = false;
  }, [domRef]);

  return {
    focusableProps: mergeProps(
      {
        ...interactions,
        tabIndex:
          props.excludeFromTabOrder && !props.isDisabled ? -1 : undefined,
      },
      interactionProps
    ),
  };
}
