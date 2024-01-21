import type { ContextValue, ToggleButtonProps } from "types";
import { createContext } from "react";

export const ToggleButtonContext = createContext<
  ContextValue<ToggleButtonProps, HTMLButtonElement>
>({});
