// Override forwardRef types so generics work.
declare function forwardRef<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
): (props: P & React.RefAttributes<T>) => React.ReactElement | null;

export type ForwardRefType = typeof forwardRef;

export type WithRef<T, E> = T & { ref?: ForwardedRef<E> };
