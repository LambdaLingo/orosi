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
} from "../../types/shared/dom";
import type { FocusableProps } from "../../types/shared/events";
import { mergeProps } from "../../utilities/merge-props";
import { useObjectRef } from "../shared/use-object-ref";
import { useSyncRef } from "../shared/use-sync-ref";
import { useFocus } from "../interactions/use-focus";
import { useKeyboard } from "../interactions/use-keyboard";
import type { IsDisabledProp } from "../../types/shared/component";
import { focusSafely } from "./focus-safely";

type FocusableOptions = FocusableProps & FocusableDOMProps & IsDisabledProp;

export interface FocusableProviderProps extends DOMAttributes {
  /** The child element to provide DOM props to. */
  children?: ReactNode;
}

interface FocusableContextValue extends FocusableProviderProps {
  ref?: MutableRefObject<FocusableElement>;
}

let FocusableContext = createContext<FocusableContextValue | null>(null);

function useFocusableContext(
  ref: RefObject<FocusableElement>
): FocusableContextValue {
  let context = useContext(FocusableContext) || {};
  useSyncRef(context, ref);

  // eslint-disable-next-line
  let { ref: _, ...otherProps } = context;
  return otherProps;
}

/**
 * Provides DOM props to the nearest focusable child.
 */
function FocusableProvider(
  props: FocusableProviderProps,
  ref: ForwardedRef<FocusableElement>
) {
  let { children, ...otherProps } = props;
  let objRef = useObjectRef(ref);
  let context = {
    ...otherProps,
    ref: objRef,
  };

  return (
    <FocusableContext.Provider value={context}>
      {children}
    </FocusableContext.Provider>
  );
}

let _FocusableProvider = forwardRef(FocusableProvider);
export { _FocusableProvider as FocusableProvider };

export interface FocusableAria {
  /** Props for the focusable element. */
  focusableProps: DOMAttributes;
}

/**
 * Used to make an element focusable and capable of auto focus.
 */
export function useFocusable(
  props: FocusableOptions,
  domRef: RefObject<FocusableElement>
): FocusableAria {
  let { focusProps } = useFocus(props);
  let { keyboardProps } = useKeyboard(props);
  let interactions = mergeProps(focusProps, keyboardProps);
  let domProps = useFocusableContext(domRef);
  let interactionProps = props.isDisabled ? {} : domProps;
  let autoFocusRef = useRef(props.autoFocus);

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
