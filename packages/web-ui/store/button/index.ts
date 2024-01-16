import { createContext } from "react";
import type { ButtonContextValue, ContextValue } from "types";

export const additionalButtonHTMLAttributes = new Set([
  "form",
  "formAction",
  "formEncType",
  "formMethod",
  "formNoValidate",
  "formTarget",
  "name",
  "value",
  "preventFocusOnPress",
  "preventScrollOnPress",
]);

export const ButtonContext = createContext<
  ContextValue<ButtonContextValue, HTMLButtonElement>
>({});
