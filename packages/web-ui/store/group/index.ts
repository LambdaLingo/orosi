import { createContext } from "react";
import type { ContextValue } from "types";
import type { GroupProps } from "components/group";

export const GroupContext = createContext<
  ContextValue<GroupProps, HTMLDivElement>
>({});
