import { createContext } from "react";

export const HiddenContext = createContext<boolean>(false);

// Portal to nowhere
export const hiddenFragment =
  typeof DocumentFragment !== "undefined" ? new DocumentFragment() : null;
