import { createContext } from "react";
import type { PressResponderContextType } from "types";

export const PressResponderContext = createContext<PressResponderContextType>({
  register: () => {},
});
PressResponderContext.displayName = "PressResponderContext";
