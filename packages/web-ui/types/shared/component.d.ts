import type { ComponentPropsWithRef, ForwardedRef, ReactNode } from "react";
import type { WithRef } from "./ref";

export type IsDisabledProp = {
  /** Whether the component is disabled. */
  isDisabled?: boolean;
};

export type RenderChildren<T> = {
  /** The children of the component. A function may be provided to alter the children based on component state. */
  children?: ReactNode | ((values: T) => ReactNode);
};

export type RenderChildrenHookOptions<T> = RenderChildren<T> & {
  values: T;
  defaultChildren?: ReactNode;
};

/**
 * A helper function that accepts a user-provided render prop value (either a static value or a function),
 * and combines it with another value to create a final result.
 */
export function composeRenderProps<T, U, V extends T>(
  // https://stackoverflow.com/questions/60898079/typescript-type-t-or-function-t-usage
  value: T extends any ? T | ((renderProps: U) => V) : never,
  wrap: (prevValue: T, renderProps: U) => V
): (renderProps: U) => V {
  return (renderProps) =>
    wrap(typeof value === "function" ? value(renderProps) : value, renderProps);
}

/**
 * Represents a generic prop that allows specifying the component type.
 * @template C - The component type.
 */
type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

// This is the first reusable type utility we built
type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {},
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

// This is a new type utitlity with ref!
export type PolymorphicComponentPropWithRef<
  C extends React.ElementType,
  Props = {},
> = PolymorphicComponentProp<C, Props> & { ref?: PolymorphicRef<C> };

// This is the type for the "ref" only
export type PolymorphicRef<C extends React.ElementType> = ForwardedRef<
  (typeof ComponentPropsWithRef<C>)["ref"]
>;
