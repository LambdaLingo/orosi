import { useMemo } from "react";
import type {
  CollectionStateBase,
  Key,
  Node,
  SingleSelection,
  ListState,
} from "types";
import { useControlledState } from "hooks/shared";
import { useListState } from "./use-list-state";

export type SingleSelectListProps<T> = {
  /** Filter function to generate a filtered list of nodes. */
  filter?: (nodes: Iterable<Node<T>>) => Iterable<Node<T>>;
  /** @private */
  suppressTextValueWarning?: boolean;
} & CollectionStateBase<T> &
  Omit<SingleSelection, "disallowEmptySelection">;

export type SingleSelectListState<T> = {
  /** The key for the currently selected item. */
  readonly selectedKey: Key;

  /** Sets the selected key. */
  setSelectedKey: (key: Key | null) => void;

  /** The value of the currently selected item. */
  readonly selectedItem: Node<T>;
} & ListState<T>;

/**
 * Provides state management for list-like components with single selection.
 * Handles building a collection of items from props, and manages selection state.
 */
export function useSingleSelectListState<T extends object>(
  props: SingleSelectListProps<T>
): SingleSelectListState<T> {
  const [selectedKey, setSelectedKey] = useControlledState(
    props.selectedKey,
    props.defaultSelectedKey ?? null,
    props.onSelectionChange
  );
  const selectedKeys = useMemo(
    () => (selectedKey !== null ? [selectedKey] : []),
    [selectedKey]
  );
  const { collection, disabledKeys, selectionManager } = useListState({
    ...props,
    selectionMode: "single",
    disallowEmptySelection: true,
    allowDuplicateSelectionEvents: true,
    selectedKeys,
    onSelectionChange: (keys: Set<Key>) => {
      let key = keys.values().next().value ?? null;

      // Always fire onSelectionChange, even if the key is the same
      // as the current key (useControlledState does not).
      if (key === selectedKey && props.onSelectionChange) {
        props.onSelectionChange(key);
      }

      setSelectedKey(key);
    },
  });

  const selectedItem =
    selectedKey !== null ? collection.getItem(selectedKey) : null;

  return {
    collection,
    disabledKeys,
    selectionManager,
    selectedKey,
    setSelectedKey,
    selectedItem,
  };
}
