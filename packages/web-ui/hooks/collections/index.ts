import { type ReactElement, useMemo } from "react";
import type { Collection, CollectionStateBase, Node } from "types";
import { CollectionBuilder } from "classes";

type CollectionOptions<T, C extends Collection<Node<T>>> = {
  children?: ReactElement | ReactElement[] | ((item: T) => ReactElement);
} & Omit<CollectionStateBase<T, C>, "children">;

type CollectionFactory<T, C extends Collection<Node<T>>> = (
  node: Iterable<Node<T>>
) => C;

export function useCollection<
  T extends object,
  C extends Collection<Node<T>> = Collection<Node<T>>,
>(
  props: CollectionOptions<T, C>,
  factory: CollectionFactory<T, C>,
  context?: unknown
): C {
  const builder = useMemo(() => new CollectionBuilder<T>(), []);
  const { children, items, collection } = props;
  const result = useMemo(() => {
    if (collection) {
      return collection;
    }
    const nodes = builder.build({ children, items }, context);
    return factory(nodes);
  }, [builder, children, items, collection, context, factory]);
  return result;
}
