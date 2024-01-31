import type { Key } from "types/shared";

export type ListOptions<T> = {
  /** Initial items in the list. */
  initialItems?: T[];
  /** The keys for the initially selected items. */
  initialSelectedKeys?: "all" | Iterable<Key>;
  /** The initial text to filter the list by. */
  initialFilterText?: string;
  /** A function that returns a unique key for an item object. */
  getKey?: (item: T) => Key;
  /** A function that returns whether a item matches the current filter text. */
  filter?: (item: T, filterText: string) => boolean;
};

export type ListData<T> = {
  /** The items in the list. */
  items: T[];

  /** The keys of the currently selected items in the list. */
  selectedKeys: Selection;

  /** Sets the selected keys. */
  setSelectedKeys: (keys: Selection) => void;

  /** The current filter text. */
  filterText: string;

  /** Sets the filter text. */
  setFilterText: (filterText: string) => void;

  /**
   * Gets an item from the list by key.
   * @param key - The key of the item to retrieve.
   */
  getItem: (key: Key) => T;

  /**
   * Inserts items into the list at the given index.
   * @param index - The index to insert into.
   * @param values - The values to insert.
   */
  insert: (index: number, ...values: T[]) => void;

  /**
   * Inserts items into the list before the item at the given key.
   * @param key - The key of the item to insert before.
   * @param values - The values to insert.
   */
  insertBefore: (key: Key, ...values: T[]) => void;

  /**
   * Inserts items into the list after the item at the given key.
   * @param key - The key of the item to insert after.
   * @param values - The values to insert.
   */
  insertAfter: (key: Key, ...values: T[]) => void;

  /**
   * Appends items to the list.
   * @param values - The values to insert.
   */
  append: (...values: T[]) => void;

  /**
   * Prepends items to the list.
   * @param value - The value to insert.
   */
  prepend: (...values: T[]) => void;

  /**
   * Removes items from the list by their keys.
   * @param keys - The keys of the item to remove.
   */
  remove: (...keys: Key[]) => void;

  /**
   * Removes all items from the list that are currently
   * in the set of selected items.
   */
  removeSelectedItems: () => void;

  /**
   * Moves an item within the list.
   * @param key - The key of the item to move.
   * @param toIndex - The index to move the item to.
   */
  move: (key: Key, toIndex: number) => void;

  /**
   * Moves one or more items before a given key.
   * @param key - The key of the item to move the items before.
   * @param keys - The keys of the items to move.
   */
  moveBefore: (key: Key, keys: Iterable<Key>) => void;

  /**
   * Moves one or more items after a given key.
   * @param key - The key of the item to move the items after.
   * @param keys - The keys of the items to move.
   */
  moveAfter: (key: Key, keys: Iterable<Key>) => void;

  /**
   * Updates an item in the list.
   * @param key - The key of the item to update.
   * @param newValue - The new value for the item.
   */
  update: (key: Key, newValue: T) => void;
};

export type ListState<T> = {
  items: T[];
  selectedKeys: Selection;
  filterText: string;
};

type CreateListOptions<T, C> = {
  cursor?: C;
} & ListOptions<T>;
