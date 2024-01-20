import {
  type ForwardedRef,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
} from "react";
import type { FocusableElement, PressProps } from "types";
import { PressResponderContext } from "store";
import { useObjectRef, useSyncRef } from "hooks";
import { mergeProps } from "utilities";

type PressResponderProps = {
  children: ReactNode;
} & PressProps;

export const PressResponder = forwardRef(
  (
    { children, ...props }: PressResponderProps,
    ref: ForwardedRef<FocusableElement>
  ) => {
    let isRegistered = useRef(false);
    let prevContext = useContext(PressResponderContext);
    ref = useObjectRef(ref || prevContext?.ref);
    let context = mergeProps(prevContext || {}, {
      ...props,
      ref,
      register() {
        isRegistered.current = true;
        if (prevContext) {
          prevContext.register();
        }
      },
    });

    useSyncRef(prevContext, ref);

    useEffect(() => {
      if (!isRegistered.current) {
        console.warn(
          "A PressResponder was rendered without a pressable child. " +
            "Either call the usePress hook, or wrap your DOM node with <Pressable> component."
        );
        isRegistered.current = true; // only warn once in strict mode.
      }
    }, []);

    return (
      <PressResponderContext.Provider value={context}>
        {children}
      </PressResponderContext.Provider>
    );
  }
);

export function ClearPressResponder({ children }: { children: ReactNode }) {
  let context = useMemo(() => ({ register: () => {} }), []);
  return (
    <PressResponderContext.Provider value={context}>
      {children}
    </PressResponderContext.Provider>
  );
}
