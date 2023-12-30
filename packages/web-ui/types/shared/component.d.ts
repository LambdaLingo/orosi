import type { WithRef } from "./ref";

/**
 * Represents a generic prop that allows specifying the component type.
 * @template E - The component type.
 */
export type AsProp<E extends React.ElementType> = {
  as?: E;
};

/**
 * Represents a generic component prop.
 * @template E - The type of the React element.
 * @template P - The type of the prop.
 */
export type ComponentProp<
  E extends React.ElementType,
  P extends Record<string, unknown> = Record<string, never>,
> = React.PropsWithChildren<P> &
  Omit<React.ComponentPropsWithoutRef<E>, keyof P>;

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
  React.PropsWithChildren<AsProp<E> & P> &
    Omit<React.ComponentPropsWithoutRef<E>, keyof (AsProp<E> & P)>,
  E
>;
