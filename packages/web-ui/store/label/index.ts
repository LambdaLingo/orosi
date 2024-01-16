import { createContext } from "react";
import type { ContextValue } from "types";
import type { LabelProps } from "components";

export const LabelContext = createContext<
  ContextValue<LabelProps, HTMLLabelElement>
>({});
