import type React, { ForwardedRef } from "react";

/**
 * Override forwardRef types so generics work.
 *
 * @template T - The type of the component's ref.
 * @template P - The type of the component's props.
 * @param render - A function that renders the component and receives the props and ref as arguments.
 * @returns A higher-order component that forwards the ref to the child component.
 */
declare function forwardRef<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
): (props: P & React.RefAttributes<T>) => React.ReactElement | null;

export type ForwardRefType = typeof forwardRef;

export type WithRef<T, E> = T & { ref?: ForwardedRef<E> };
