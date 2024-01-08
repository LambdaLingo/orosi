import { createContext, type MutableRefObject } from "react";
import type { FocusableElement } from "../../types/shared/dom";
import type { PressProps } from "./use-press";

interface IPressResponderContext extends PressProps {
  register: () => void;
  ref?: MutableRefObject<FocusableElement>;
}

export const PressResponderContext = createContext<IPressResponderContext>({
  register: () => {},
});
PressResponderContext.displayName = "PressResponderContext";
