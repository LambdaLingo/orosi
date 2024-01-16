import { InputProps } from "components";
import { createContext } from "react";
import { ContextValue } from "types";

export const InputContext = createContext<
  ContextValue<InputProps, HTMLInputElement>
>({});
