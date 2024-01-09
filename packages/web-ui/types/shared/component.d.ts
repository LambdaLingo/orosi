import type { ReactNode } from "react";
import type { WithRef } from "./ref";
import type { AriaLabelingProps } from "./a11y";
import type { DOMProps } from "./dom";

/**
 * Represents a generic prop that allows specifying the component type.
 * @template E - The component type.
 */
export type AsProp<E extends React.ElementType> = {
  as?: E;
};

export type isDisabledProp = {
  /** Whether the component is disabled. */
  isDisabled?: boolean;
};

/**
 * Represents a generic component prop.
 * @template E - The type of the React element.
 * @template P - The type of the prop.
 */
export type ComponentProp<
  E extends React.ElementType,
  P extends Record<string, unknown> = Record<string, never>,
> = P & Omit<React.ComponentPropsWithoutRef<E>, keyof P>;

/**
 * Represents a type for a component prop with a ref.
 *
 * @template E - The React element type.
 * @template P - The prop type.
 */
export type PolymorphicComponentProp<
  E extends React.ElementType,
  P extends Record<string, unknown> = Record<string, never>,
> = WithRef<
  AsProp<E> &
    P &
    Omit<React.ComponentPropsWithoutRef<E>, keyof (AsProp<E> & P)>,
  E
>;

export type RenderChildren<T> = {
  /** The children of the component. A function may be provided to alter the children based on component state. */
  children?: ReactNode | ((values: T) => ReactNode);
};

export type RenderChildrenHookOptions<T> = RenderChildren<T> &
  DOMProps &
  AriaLabelingProps & {
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
