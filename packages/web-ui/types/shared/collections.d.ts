import type { ReactElement, ReactNode } from "react";
import type { Key } from "./key";
import type { LinkDOMProps } from "./dom";

export type ItemProps<T> = {
  /** Rendered contents of the item or child items. */
  children: ReactNode;
  /** Rendered contents of the item if `children` contains child items. */
  title?: ReactNode; // label?? contents?
  /** A string representation of the item's contents, used for features like typeahead. */
  textValue?: string;
  /** An accessibility label for this item. */
  "aria-label"?: string;
  /** A list of child item objects. Used for dynamic collections. */
  childItems?: Iterable<T>;
  /** Whether this item has children, even if not loaded yet. */
  hasChildItems?: boolean;
} & LinkDOMProps;

export type ItemElement<T> = ReactElement<ItemProps<T>>;
export type ItemRenderer<T> = (item: T) => ItemElement<T>;
export type LoadingState =
  | "loading"
  | "sorting"
  | "loadingMore"
  | "error"
  | "idle"
  | "filtering";

export type AsyncLoadable = {
  /** Whether the items are currently loading. */
  isLoading?: boolean; // possibly isLoadingMore
  /** Handler that is called when more items should be loaded, e.g. while scrolling near the bottom. */
  onLoadMore?: () => any;
};

export type SectionProps<T> = {
  /** Rendered contents of the section, e.g. a header. */
  title?: ReactNode;
  /** An accessibility label for the section. */
  "aria-label"?: string;
  /** Static child items or a function to render children. */
  children: ItemElement<T> | ItemElement<T>[] | ItemRenderer<T>;
  /** Item objects in the section. */
  items?: Iterable<T>;
};

export type SectionElement<T> = ReactElement<SectionProps<T>>;

export type CollectionElement<T> = SectionElement<T> | ItemElement<T>;
export type CollectionChildren<T> =
  | CollectionElement<T>
  | CollectionElement<T>[]
  | ((item: T) => CollectionElement<T>);
export type CollectionBase<T> = {
  /** The contents of the collection. */
  children: CollectionChildren<T>;
  /** Item objects in the collection. */
  items?: Iterable<T>;
  /** The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with. */
  disabledKeys?: Iterable<Key>;
};

export type CollectionStateBase<
  T,
  C extends Collection<Node<T>> = Collection<Node<T>>,
> = {
  /** A pre-constructed collection to use instead of building one from items and children. */
  collection?: C;
} & Partial<CollectionBase<T>>;

export type Expandable = {
  /** The currently expanded keys in the collection (controlled). */
  expandedKeys?: Iterable<Key>;
  /** The initial expanded keys in the collection (uncontrolled). */
  defaultExpandedKeys?: Iterable<Key>;
  /** Handler that is called when items are expanded or collapsed. */
  onExpandedChange?: (keys: Set<Key>) => any;
};

export type Sortable = {
  /** The current sorted column and direction. */
  sortDescriptor?: SortDescriptor;
  /** Handler that is called when the sorted column or direction changes. */
  onSortChange?: (descriptor: SortDescriptor) => any;
};

export type SortDescriptor = {
  /** The key of the column to sort by. */
  column?: Key;
  /** The direction to sort by. */
  direction?: SortDirection;
};

export type SortDirection = "ascending" | "descending";

export type KeyboardDelegate = {
  /** Returns the key visually below the given one, or `null` for none. */
  getKeyBelow?: (key: Key) => Key | null;

  /** Returns the key visually above the given one, or `null` for none. */
  getKeyAbove?: (key: Key) => Key | null;

  /** Returns the key visually to the left of the given one, or `null` for none. */
  getKeyLeftOf?: (key: Key) => Key | null;

  /** Returns the key visually to the right of the given one, or `null` for none. */
  getKeyRightOf?: (key: Key) => Key | null;

  /** Returns the key visually one page below the given one, or `null` for none. */
  getKeyPageBelow?: (key: Key) => Key | null;

  /** Returns the key visually one page above the given one, or `null` for none. */
  getKeyPageAbove?: (key: Key) => Key | null;

  /** Returns the first key, or `null` for none. */
  getFirstKey?: (key?: Key, global?: boolean) => Key | null;

  /** Returns the last key, or `null` for none. */
  getLastKey?: (key?: Key, global?: boolean) => Key | null;

  /** Returns the next key after `fromKey` that matches the given search string, or `null` for none. */
  getKeyForSearch?: (search: string, fromKey?: Key) => Key | null;
};

/**
 * A generic interface to access a readonly sequential
 * collection of unique keyed items.
 */
export type Collection<T> = {
  /** The number of items in the collection. */
  readonly size: number;

  /** Iterate over all keys in the collection. */
  getKeys: () => Iterable<Key>;

  /** Get an item by its key. */
  getItem: (key: Key) => T | null;

  /** Get an item by the index of its key. */
  at: (idx: number) => T | null;

  /** Get the key that comes before the given key in the collection. */
  getKeyBefore: (key: Key) => Key | null;

  /** Get the key that comes after the given key in the collection. */
  getKeyAfter: (key: Key) => Key | null;

  /** Get the first key in the collection. */
  getFirstKey: () => Key | null;

  /** Get the last key in the collection. */
  getLastKey: () => Key | null;

  /** Iterate over the child items of the given key. */
  getChildren?: (key: Key) => Iterable<T>;

  /** Returns a string representation of the item's contents. */
  getTextValue?: (key: Key) => string;
} & Iterable<T>;

export type Node<T> = {
  /** The type of item this node represents. */
  type: string;
  /** A unique key for the node. */
  key: Key;
  /** The object value the node was created from. */
  value: T | null;
  /** The level of depth this node is at in the heirarchy. */
  level: number;
  /** Whether this item has children, even if not loaded yet. */
  hasChildNodes: boolean;
  /**
   * The loaded children of this node.
   * @deprecated Use `collection.getChildren(node.key)` instead.
   */
  childNodes: Iterable<Node<T>>;
  /** The rendered contents of this node (e.g. JSX). */
  rendered: ReactNode;
  /** A string value for this node, used for features like typeahead. */
  textValue: string;
  /** An accessibility label for this node. */
  "aria-label"?: string;
  /** The index of this node within its parent. */
  index?: number;
  /** A function that should be called to wrap the rendered node. */
  wrapper?: (element: ReactElement) => ReactElement;
  /** The key of the parent node. */
  parentKey?: Key | null;
  /** The key of the node before this node. */
  prevKey?: Key | null;
  /** The key of the node after this node. */
  nextKey?: Key | null;
  /** Additional properties specific to a particular node type. */
  props?: any;
  /** @private */
  shouldInvalidate?: (context: unknown) => boolean;
};
