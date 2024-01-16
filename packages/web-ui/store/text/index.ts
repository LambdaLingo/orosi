import { createContext } from "react";
import type { TextProps } from "components";
import type { ContextValue } from "types";

export const TextContext = createContext<ContextValue<TextProps, HTMLElement>>(
  {}
);
