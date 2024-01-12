import { createContext, type MutableRefObject } from "react";
import type { FocusableElement } from "../types/shared/dom";
import type { PressProps } from "../hooks/interactions/use-press";

type PressResponderContextType = {
  register: () => void;
  ref?: MutableRefObject<FocusableElement>;
} & PressProps;

export const PressResponderContext = createContext<PressResponderContextType>({
  register: () => {},
});
PressResponderContext.displayName = "PressResponderContext";
