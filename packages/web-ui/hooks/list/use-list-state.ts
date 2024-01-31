import { useCallback, useEffect, useMemo, useRef } from "react";
import type {
  Collection,
  CollectionStateBase,
  Key,
  Node,
  MultipleSelectionStateProps,
} from "types";
import { ListCollection, SelectionManager } from "classes";
import { useMultipleSelectionState } from "hooks/selection";
import { useCollection } from "hooks/collections";

export type ListProps<T> = {
  /** Filter function to generate a filtered list of nodes. */
  filter?: (nodes: Iterable<Node<T>>) => Iterable<Node<T>>;
  /** @private */
  suppressTextValueWarning?: boolean;
} & CollectionStateBase<T> &
  MultipleSelectionStateProps;

export type ListState<T> = {
  /** A collection of items in the list. */
  collection: Collection<Node<T>>;

  /** A set of items that are disabled. */
  disabledKeys: Set<Key>;

  /** A selection manager to read and update multiple selection state. */
  selectionManager: SelectionManager;
};

/**
 * Provides state management for list-like components. Handles building a collection
 * of items from props, and manages multiple selection state.
 */
export function useListState<T extends object>(
  props: ListProps<T>
): ListState<T> {
  const { filter } = props;

  const selectionState = useMultipleSelectionState(props);
  const disabledKeys = useMemo(
    () => (props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()),
    [props.disabledKeys]
  );

  const factory = useCallback(
    (nodes: Iterable<Node<T>>) =>
      filter ? new ListCollection(filter(nodes)) : new ListCollection(nodes),
    [filter]
  );
  const context = useMemo(
    () => ({ suppressTextValueWarning: props.suppressTextValueWarning }),
    [props.suppressTextValueWarning]
  );

  const collection = useCollection(props, factory, context);

  const selectionManager = useMemo(
    () => new SelectionManager(collection, selectionState),
    [collection, selectionState]
  );

  // Reset focused key if that item is deleted from the collection.
  const cachedCollection = useRef(null);
  useEffect(() => {
    if (
      selectionState.focusedKey !== null &&
      !collection.getItem(selectionState.focusedKey)
    ) {
      const startItem = cachedCollection.current.getItem(
        selectionState.focusedKey
      );
      const cachedItemNodes = [...cachedCollection.current.getKeys()]
        .map((key) => {
          const itemNode = cachedCollection.current.getItem(key);
          return itemNode.type === "item" ? itemNode : null;
        })
        .filter((node) => node !== null);
      const itemNodes = [...collection.getKeys()]
        .map((key) => {
          const itemNode = collection.getItem(key);
          return itemNode.type === "item" ? itemNode : null;
        })
        .filter((node) => node !== null);
      const diff = cachedItemNodes.length - itemNodes.length;
      let index = Math.min(
        diff > 1 ? Math.max(startItem.index - diff + 1, 0) : startItem.index,
        itemNodes.length - 1
      );
      let newNode: Node<T>;
      while (index >= 0) {
        if (!selectionManager.isDisabled(itemNodes[index].key)) {
          newNode = itemNodes[index];
          break;
        }
        // Find next, not disabled item.
        if (index < itemNodes.length - 1) {
          index++;
          // Otherwise, find previous, not disabled item.
        } else {
          if (index > startItem.index) {
            index = startItem.index;
          }
          index--;
        }
      }
      selectionState.setFocusedKey(newNode ? newNode.key : null);
    }
    cachedCollection.current = collection;
  }, [collection, selectionManager, selectionState, selectionState.focusedKey]);

  return {
    collection,
    disabledKeys,
    selectionManager,
  };
}
