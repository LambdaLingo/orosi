import type { ProviderProps } from "types";

export function Provider<A, B, C, D, E, F, G, H, I, J, K>({
  values,
  children,
}: ProviderProps<A, B, C, D, E, F, G, H, I, J, K>): JSX.Element {
  for (const [Context, value] of values) {
    // @ts-ignore
    children = <Context.Provider value={value}>{children}</Context.Provider>;
  }

  return children as JSX.Element;
}
