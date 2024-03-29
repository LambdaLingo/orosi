import React, {
  type ForwardedRef,
  type JSX,
  type ReactElement,
  type ReactNode,
  cloneElement,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import type {
  CollectionBase,
  Key,
  StyleProps,
  ForwardRefType,
  SelectionBehavior,
  SelectionMode,
  SectionProps as SharedSectionProps,
  Collection as ICollection,
  Node,
} from "types";
import { useIsSSR } from "hooks";
import { mergeProps } from "utilities";
import { useSyncExternalStore as useSyncExternalStoreShim } from "use-sync-external-store/shim/index.js";

// This Collection implementation is perhaps a little unusual. It works by rendering the React tree into a
// Portal to a fake DOM implementation. This gives us efficient access to the tree of rendered objects, and
// supports React features like composition and context. We use this fake DOM to access the full set of elements
// before we render into the real DOM, which allows us to render a subset of the elements (e.g. virtualized scrolling),
// and compute properties like the total number of items. It also enables keyboard navigation, selection, and other features.
// React takes care of efficiently rendering components and updating the collection for us via this fake DOM.
//
// The DOM is a mutable API, and React expects the node instances to remain stable over time. So the implementation is split
// into two parts. Each mutable fake DOM node owns an instance of an immutable collection node. When a fake DOM node is updated,
// it queues a second render for the collection. Multiple updates to a collection can be queued at once. Collection nodes are
// lazily copied on write, so only the changed nodes need to be cloned. During the second render, the new immutable collection
// is finalized by updating the map of Key -> Node with the new cloned nodes. Then the new collection is frozen so it can no
// longer be mutated, and returned to the calling component to render.

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/** An immutable object representing a Node in a Collection. */
export class NodeValue<T> implements Node<T> {
  readonly type: string;
  readonly key: Key;
  readonly value: T | null = null;
  readonly level: number = 0;
  readonly hasChildNodes: boolean = false;
  readonly rendered: ReactNode = null;
  readonly textValue: string = "";
  readonly "aria-label"?: string = undefined;
  readonly index: number = 0;
  readonly parentKey: Key | null = null;
  readonly prevKey: Key | null = null;
  readonly nextKey: Key | null = null;
  readonly firstChildKey: Key | null = null;
  readonly lastChildKey: Key | null = null;
  readonly props: unknown = {};

  constructor(type: string, key: Key) {
    this.type = type;
    this.key = key;
  }

  get childNodes(): Iterable<Node<T>> {
    throw new Error("childNodes is not supported");
  }

  clone(): NodeValue<T> {
    const node: Mutable<NodeValue<T>> = new NodeValue(this.type, this.key);
    node.value = this.value;
    node.level = this.level;
    node.hasChildNodes = this.hasChildNodes;
    node.rendered = this.rendered;
    node.textValue = this.textValue;
    node["aria-label"] = this["aria-label"];
    node.index = this.index;
    node.parentKey = this.parentKey;
    node.prevKey = this.prevKey;
    node.nextKey = this.nextKey;
    node.firstChildKey = this.firstChildKey;
    node.lastChildKey = this.lastChildKey;
    node.props = this.props;
    return node;
  }
}

/**
 * A mutable node in the fake DOM tree. When mutated, it marks itself as dirty
 * and queues an update with the owner document.
 */
class BaseNode<T> {
  private _firstChild: ElementNode<T> | null = null;
  private _lastChild: ElementNode<T> | null = null;
  private _previousSibling: ElementNode<T> | null = null;
  private _nextSibling: ElementNode<T> | null = null;
  private _parentNode: BaseNode<T> | null = null;
  ownerDocument: Document<T, any>;

  constructor(ownerDocument: Document<T, any>) {
    this.ownerDocument = ownerDocument;
  }

  *[Symbol.iterator](): IterableIterator<ElementNode<T>> {
    let node = this.firstChild;
    while (node) {
      yield node;
      node = node.nextSibling;
    }
  }

  get firstChild(): ElementNode<T> | null {
    return this._firstChild;
  }

  set firstChild(firstChild) {
    this._firstChild = firstChild;
    this.ownerDocument.markDirty(this);
  }

  get lastChild(): ElementNode<T> | null {
    return this._lastChild;
  }

  set lastChild(lastChild) {
    this._lastChild = lastChild;
    this.ownerDocument.markDirty(this);
  }

  get previousSibling(): ElementNode<T> | null {
    return this._previousSibling;
  }

  set previousSibling(previousSibling) {
    this._previousSibling = previousSibling;
    this.ownerDocument.markDirty(this);
  }

  get nextSibling(): ElementNode<T> | null {
    return this._nextSibling;
  }

  set nextSibling(nextSibling) {
    this._nextSibling = nextSibling;
    this.ownerDocument.markDirty(this);
  }

  get parentNode(): BaseNode<T> | null {
    return this._parentNode;
  }

  set parentNode(parentNode) {
    this._parentNode = parentNode;
    this.ownerDocument.markDirty(this);
  }

  get isConnected(): boolean {
    return this.parentNode?.isConnected || false;
  }

  appendChild(child: ElementNode<T>): void {
    this.ownerDocument.startTransaction();
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }

    if (this.firstChild === null) {
      this.firstChild = child;
    }

    if (this.lastChild) {
      this.lastChild.nextSibling = child;
      child.index = this.lastChild.index + 1;
      child.previousSibling = this.lastChild;
    } else {
      child.previousSibling = null;
      child.index = 0;
    }

    child.parentNode = this;
    child.nextSibling = null;
    this.lastChild = child;

    this.ownerDocument.markDirty(this);
    if (child.hasSetProps) {
      // Only add the node to the collection if we already received props for it.
      // Otherwise wait until then so we have the correct id for the node.
      this.ownerDocument.addNode(child);
    }

    this.ownerDocument.endTransaction();
    this.ownerDocument.queueUpdate();
  }

  insertBefore(newNode: ElementNode<T>, referenceNode: ElementNode<T>): void {
    if (referenceNode === null) {
      this.appendChild(newNode);
      return;
    }

    this.ownerDocument.startTransaction();
    if (newNode.parentNode) {
      newNode.parentNode.removeChild(newNode);
    }

    newNode.nextSibling = referenceNode;
    newNode.previousSibling = referenceNode.previousSibling;
    newNode.index = referenceNode.index;

    if (this.firstChild === referenceNode) {
      this.firstChild = newNode;
    } else if (referenceNode.previousSibling) {
      referenceNode.previousSibling.nextSibling = newNode;
    }

    referenceNode.previousSibling = newNode;
    newNode.parentNode = referenceNode.parentNode;

    let node: ElementNode<T> | null = referenceNode;
    while (node) {
      node.index++;
      node = node.nextSibling;
    }

    if (newNode.hasSetProps) {
      this.ownerDocument.addNode(newNode);
    }

    this.ownerDocument.endTransaction();
    this.ownerDocument.queueUpdate();
  }

  removeChild(child: ElementNode<T>): void {
    if (child.parentNode !== this) {
      return;
    }

    this.ownerDocument.startTransaction();
    let node = child.nextSibling;
    while (node) {
      node.index--;
      node = node.nextSibling;
    }

    if (child.nextSibling) {
      child.nextSibling.previousSibling = child.previousSibling;
    }

    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling;
    }

    if (this.firstChild === child) {
      this.firstChild = child.nextSibling;
    }

    if (this.lastChild === child) {
      this.lastChild = child.previousSibling;
    }

    child.parentNode = null;
    child.nextSibling = null;
    child.previousSibling = null;
    child.index = 0;

    this.ownerDocument.removeNode(child);
    this.ownerDocument.endTransaction();
    this.ownerDocument.queueUpdate();
  }

  addEventListener(): void {}
  removeEventListener(): void {}
}

/**
 * A mutable element node in the fake DOM tree. It owns an immutable
 * Collection Node which is copied on write.
 */
export class ElementNode<T> extends BaseNode<T> {
  nodeType = 8; // COMMENT_NODE (we'd use ELEMENT_NODE but React DevTools will fail to get its dimensions)
  node: NodeValue<T>;
  private _index = 0;
  hasSetProps = false;

  constructor(type: string, ownerDocument: Document<T, any>) {
    super(ownerDocument);
    this.node = new NodeValue(type, `react-aria-${++ownerDocument.nodeId}`);
    // Start a transaction so that no updates are emitted from the collection
    // until the props for this node are set. We don't know the real id for the
    // node until then, so we need to avoid emitting collections in an inconsistent state.
    this.ownerDocument.startTransaction();
  }

  get index(): number {
    return this._index;
  }

  set index(index) {
    this._index = index;
    this.ownerDocument.markDirty(this);
  }

  get level(): number {
    if (this.parentNode instanceof ElementNode) {
      return this.parentNode.level + (this.node.type === "item" ? 1 : 0);
    }

    return 0;
  }

  updateNode(): void {
    const node = this.ownerDocument.getMutableNode(this);
    node.index = this.index;
    node.level = this.level;
    node.parentKey =
      this.parentNode instanceof ElementNode ? this.parentNode.node.key : null;
    node.prevKey = this.previousSibling?.node.key ?? null;
    node.nextKey = this.nextSibling?.node.key ?? null;
    node.hasChildNodes = Boolean(this.firstChild);
    node.firstChildKey = this.firstChild?.node.key ?? null;
    node.lastChildKey = this.lastChild?.node.key ?? null;
  }

  setProps<T extends Element>(
    obj: any,
    ref: ForwardedRef<T>,
    rendered?: any
  ): void {
    const node = this.ownerDocument.getMutableNode(this);
    const { value, textValue, id, ...props } = obj;
    props.ref = ref;
    node.props = props;
    node.rendered = rendered;
    node.value = value;
    node.textValue =
      textValue ||
      (typeof rendered === "string" ? rendered : "") ||
      obj["aria-label"] ||
      "";
    if (id !== null && id !== node.key) {
      if (this.hasSetProps) {
        throw new Error("Cannot change the id of an item");
      }
      node.key = id;
    }

    // If this is the first time props have been set, end the transaction started in the constructor
    // so this node can be emitted.
    if (!this.hasSetProps) {
      this.ownerDocument.addNode(this);
      this.ownerDocument.endTransaction();
      this.hasSetProps = true;
    }

    this.ownerDocument.queueUpdate();
  }

  get style(): object {
    return {};
  }

  hasAttribute(): void {}
  setAttribute(): void {}
  setAttributeNS(): void {}
  removeAttribute(): void {}
}

/**
 * An immutable Collection implementation. Updates are only allowed
 * when it is not marked as frozen.
 */
export class BaseCollection<T> implements ICollection<Node<T>> {
  private keyMap = new Map<Key, NodeValue<T>>();
  private firstKey: Key | null = null;
  private lastKey: Key | null = null;
  private frozen = false;

  get size(): number {
    return this.keyMap.size;
  }

  getKeys(): Iterable<Key> {
    return this.keyMap.keys();
  }

  *[Symbol.iterator](): IterableIterator<Node<T>> {
    let node: Node<T> | undefined =
      this.firstKey !== null ? this.keyMap.get(this.firstKey) : undefined;
    while (node) {
      yield node;
      node =
        node.nextKey !== null && node.nextKey !== undefined
          ? this.keyMap.get(node.nextKey)
          : undefined;
    }
  }

  getChildren(key: Key): Iterable<Node<T>> {
    const keyMap = this.keyMap;
    return {
      *[Symbol.iterator]() {
        const parent = keyMap.get(key);
        let node =
          parent?.firstChildKey !== null && parent?.firstChildKey !== undefined
            ? keyMap.get(parent.firstChildKey)
            : null;
        while (node) {
          yield node as Node<T>;
          node = node.nextKey !== null ? keyMap.get(node.nextKey) : undefined;
        }
      },
    };
  }

  getKeyBefore(key: Key): Key | null {
    let node = this.keyMap.get(key);
    if (!node) {
      return null;
    }

    if (node.prevKey !== null) {
      node = this.keyMap.get(node.prevKey);

      while (node && node.type !== "item" && node.lastChildKey !== null) {
        node = this.keyMap.get(node.lastChildKey);
      }

      return node?.key ?? null;
    }

    return node.parentKey;
  }

  getKeyAfter(key: Key): Key | null {
    let node = this.keyMap.get(key);
    if (!node) {
      return null;
    }

    if (node.type !== "item" && node.firstChildKey !== null) {
      return node.firstChildKey;
    }

    while (node) {
      if (node.nextKey !== null) {
        return node.nextKey;
      }

      if (node.parentKey !== null) {
        node = this.keyMap.get(node.parentKey);
      } else {
        return null;
      }
    }

    return null;
  }

  getFirstKey(): Key | null {
    return this.firstKey;
  }

  getLastKey(): Key | null {
    let node = this.lastKey !== null ? this.keyMap.get(this.lastKey) : null;
    while (node?.lastChildKey) {
      node = this.keyMap.get(node.lastChildKey);
    }

    return node?.key ?? null;
  }

  getItem(key: Key): Node<T> | null {
    return this.keyMap.get(key) ?? null;
  }

  at(): Node<T> {
    throw new Error("Not implemented");
  }

  clone(): this {
    // We need to clone using this.constructor so that subclasses have the right prototype.
    // TypeScript isn't happy about this yet.
    // https://github.com/microsoft/TypeScript/issues/3841
    const Constructor: any = this.constructor;
    const collection: this = new Constructor();
    collection.keyMap = new Map(this.keyMap);
    collection.firstKey = this.firstKey;
    collection.lastKey = this.lastKey;
    return collection;
  }

  addNode(node: NodeValue<T>): void {
    if (this.frozen) {
      throw new Error("Cannot add a node to a frozen collection");
    }

    this.keyMap.set(node.key, node);
  }

  removeNode(key: Key): void {
    if (this.frozen) {
      throw new Error("Cannot remove a node to a frozen collection");
    }

    this.keyMap.delete(key);
  }

  commit(firstKey: Key | null, lastKey: Key | null, isSSR = false): void {
    if (this.frozen) {
      throw new Error("Cannot commit a frozen collection");
    }

    this.firstKey = firstKey;
    this.lastKey = lastKey;
    this.frozen = !isSSR;
  }
}

/**
 * A mutable Document in the fake DOM. It owns an immutable Collection instance,
 * which is lazily copied on write during updates.
 */
export class Document<
  T,
  C extends BaseCollection<T> = BaseCollection<T>,
> extends BaseNode<T> {
  nodeType = 11; // DOCUMENT_FRAGMENT_NODE
  ownerDocument = this;
  dirtyNodes = new Set<BaseNode<T>>();
  isSSR = false;
  nodeId = 0;
  nodesByProps = new WeakMap<object, ElementNode<T>>();
  private collection: C;
  private collectionMutated: boolean;
  private mutatedNodes = new Set<ElementNode<T>>();
  private subscriptions = new Set<() => void>();
  private transactionCount = 0;

  constructor(collection: C) {
    // @ts-ignore
    super(null);
    this.collection = collection;
    this.collectionMutated = true;
  }

  get isConnected(): boolean {
    return true;
  }

  createElement(type: string): ElementNode<T> {
    return new ElementNode(type, this);
  }

  /**
   * Lazily gets a mutable instance of a Node. If the node has already
   * been cloned during this update cycle, it just returns the existing one.
   */
  getMutableNode(element: ElementNode<T>): Mutable<NodeValue<T>> {
    let node = element.node;
    if (!this.mutatedNodes.has(element)) {
      node = element.node.clone();
      this.mutatedNodes.add(element);
      element.node = node;
    }
    this.markDirty(element);
    return node;
  }

  private getMutableCollection(): C {
    if (!this.isSSR && !this.collectionMutated) {
      this.collection = this.collection.clone();
      this.collectionMutated = true;
    }

    return this.collection;
  }

  markDirty(node: BaseNode<T>): void {
    this.dirtyNodes.add(node);
  }

  startTransaction(): void {
    this.transactionCount++;
  }

  endTransaction(): void {
    this.transactionCount--;
  }

  addNode(element: ElementNode<T>): void {
    const collection = this.getMutableCollection();
    if (!collection.getItem(element.node.key)) {
      collection.addNode(element.node);

      for (const child of element) {
        this.addNode(child);
      }
    }

    this.markDirty(element);
  }

  removeNode(node: ElementNode<T>): void {
    for (const child of node) {
      this.removeNode(child);
    }

    const collection = this.getMutableCollection();
    collection.removeNode(node.node.key);
    this.markDirty(node);
  }

  /** Finalizes the collection update, updating all nodes and freezing the collection. */
  getCollection(): C {
    if (this.transactionCount > 0) {
      return this.collection;
    }

    this.updateCollection();
    return this.collection;
  }

  updateCollection(): void {
    for (const element of this.dirtyNodes) {
      if (element instanceof ElementNode && element.isConnected) {
        element.updateNode();
      }
    }

    this.dirtyNodes.clear();

    if (this.mutatedNodes.size || this.collectionMutated) {
      const collection = this.getMutableCollection();
      for (const element of this.mutatedNodes) {
        if (element.isConnected) {
          collection.addNode(element.node);
        }
      }

      collection.commit(
        this.firstChild?.node.key ?? null,
        this.lastChild?.node.key ?? null,
        this.isSSR
      );
      this.mutatedNodes.clear();
    }

    this.collectionMutated = false;
  }

  queueUpdate(): void {
    // Don't emit any updates if there is a transaction in progress.
    // queueUpdate should be called again after the transaction.
    if (this.dirtyNodes.size === 0 || this.transactionCount > 0) {
      return;
    }

    for (const fn of this.subscriptions) {
      fn();
    }
  }

  subscribe(fn: () => void): () => void {
    this.subscriptions.add(fn);
    return () => this.subscriptions.delete(fn);
  }

  resetAfterSSR(): void {
    if (this.isSSR) {
      this.isSSR = false;
      this.firstChild = null;
      this.lastChild = null;
      this.nodeId = 0;
    }
  }
}

export type CollectionProps<T> = {
  /** The contents of the collection. */
  children?: ReactNode | ((item: T) => ReactNode);
  /** Values that should invalidate the item cache when using dynamic collections. */
  dependencies?: any[];
} & Omit<CollectionBase<T>, "children">;

type CachedChildrenOptions<T> = {
  idScope?: Key;
  addIdAndValue?: boolean;
  dependencies?: any[];
} & CollectionProps<T>;

export function useCachedChildren<T extends object>(
  props: CachedChildrenOptions<T>
): ReactNode {
  const { children, items, idScope, addIdAndValue, dependencies = [] } = props;

  // Invalidate the cache whenever the parent value changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cache = useMemo(() => new WeakMap(), dependencies);
  return useMemo(() => {
    if (items && typeof children === "function") {
      const res: ReactElement[] = [];
      for (const item of items) {
        let rendered = cache.get(item);
        if (!rendered) {
          rendered = children(item);
          // @ts-ignore
          let key = rendered.props.id ?? item.key ?? item.id;
          // eslint-disable-next-line max-depth
          if (key == null) {
            throw new Error("Could not determine key for item");
          }
          // eslint-disable-next-line max-depth
          if (idScope) {
            key = `${idScope}:${key}`;
          }
          // Note: only works if wrapped Item passes through id...
          rendered = cloneElement(
            rendered,
            addIdAndValue ? { key, id: key, value: item } : { key }
          );
          cache.set(item, rendered);
        }
        res.push(rendered);
      }
      return res;
    } else if (typeof children !== "function") {
      return children;
    }
  }, [children, items, cache, idScope, addIdAndValue]);
}

export function useCollectionChildren<T extends object>(
  props: CachedChildrenOptions<T>
): ReactNode {
  return useCachedChildren({ ...props, addIdAndValue: true });
}

const ShallowRenderContext = createContext(false);

type CollectionResult<C> = {
  portal: ReactNode;
  collection: C;
};

export function useCollection<T extends object, C extends BaseCollection<T>>(
  props: CollectionProps<T>,
  initialCollection?: C
): CollectionResult<C> {
  const { collection, document } = useCollectionDocument<T, C>(
    initialCollection
  );
  const portal = useCollectionPortal<T, C>(props, document);
  return { portal, collection };
}

type CollectionDocumentResult<T, C extends BaseCollection<T>> = {
  collection: C;
  document: Document<T, C>;
};

// React 16 and 17 don't support useSyncExternalStore natively, and the shim provided by React does not support getServerSnapshot.
// This wrapper uses the shim, but additionally calls getServerSnapshot during SSR (according to SSRProvider).
function useSyncExternalStoreFallback<C>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => C,
  getServerSnapshot: () => C
): C {
  const isSSR = useIsSSR();
  const isSSRRef = useRef(isSSR);
  // This is read immediately inside the wrapper, which also runs during render.
  // We just need a ref to avoid invalidating the callback itself, which
  // would cause React to re-run the callback more than necessary.
  // eslint-disable-next-line rulesdir/pure-render
  isSSRRef.current = isSSR;

  const getSnapshotWrapper = useCallback(() => {
    return isSSRRef.current ? getServerSnapshot() : getSnapshot();
  }, [getSnapshot, getServerSnapshot]);
  return useSyncExternalStoreShim(subscribe, getSnapshotWrapper);
}

const useSyncExternalStore =
  typeof React.useSyncExternalStore === "function"
    ? React.useSyncExternalStore
    : useSyncExternalStoreFallback;

export function useCollectionDocument<
  T extends object,
  C extends BaseCollection<T>,
>(initialCollection?: C): CollectionDocumentResult<T, C> {
  // The document instance is mutable, and should never change between renders.
  // useSyncExternalStore is used to subscribe to updates, which vends immutable Collection objects.
  const document = useMemo(
    () => new Document<T, C>(initialCollection || (new BaseCollection() as C)),
    [initialCollection]
  );
  const subscribe = useCallback(
    (fn: () => void) => document.subscribe(fn),
    [document]
  );
  const getSnapshot = useCallback(() => {
    const collection = document.getCollection();
    if (document.isSSR) {
      // After SSR is complete, reset the document to empty so it is ready for React to render the portal into.
      // We do this _after_ getting the collection above so that the collection still has content in it from SSR
      // during the current render, before React has finished the client render.
      document.resetAfterSSR();
    }
    return collection;
  }, [document]);
  const getServerSnapshot = useCallback(() => {
    document.isSSR = true;
    return document.getCollection();
  }, [document]);
  const collection = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return { collection, document };
}

const SSRContext = createContext<BaseNode<any> | null>(null);
export const CollectionDocumentContext = createContext<Document<
  any,
  BaseCollection<any>
> | null>(null);

export function useCollectionPortal<
  T extends object,
  C extends BaseCollection<T>,
>(props: CollectionProps<T>, document?: Document<T, C>): ReactNode {
  const ctx = useContext(CollectionDocumentContext);
  const doc = document ?? ctx!;
  const children = useCollectionChildren(props);
  const wrappedChildren = useMemo(
    () => (
      <ShallowRenderContext.Provider value>
        {children}
      </ShallowRenderContext.Provider>
    ),
    [children]
  );
  // During SSR, we render the content directly, and append nodes to the document during render.
  // The collection children return null so that nothing is actually rendered into the HTML.
  return useIsSSR() ? (
    <SSRContext.Provider value={doc}>{wrappedChildren}</SSRContext.Provider>
  ) : (
    createPortal(wrappedChildren, doc as unknown as Element)
  );
}

export function CollectionPortal<T extends object>(
  props: CollectionProps<T>
): ReactNode {
  return <>{useCollectionPortal(props)}</>;
}

/** Renders a DOM element (e.g. separator or header) shallowly when inside a collection. */
export function useShallowRender<P extends object, T extends Element>(
  type: string,
  props: P,
  ref: ForwardedRef<T>
): ReactElement | null {
  const isShallow = useContext(ShallowRenderContext);
  if (isShallow) {
    // Elements cannot be re-parented, so the context will always be there.
    return (
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useSSRCollectionNode(
        type,
        props,
        ref,
        "children" in props ? props.children : null
      ) ?? <></>
    );
  }

  return null;
}

export type ItemRenderProps = {
  /**
   * Whether the item is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the item is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean;
  /**
   * Whether the item is currently selected.
   * @selector [data-selected]
   */
  isSelected: boolean;
  /**
   * Whether the item is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the item is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the item is non-interactive, i.e. both selection and actions are disabled and the item may
   * not be focused. Dependent on `disabledKeys` and `disabledBehavior`.
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * The type of selection that is allowed in the collection.
   * @selector [data-selection-mode="single | multiple"]
   */
  selectionMode: SelectionMode;
  /** The selection behavior for the collection. */
  selectionBehavior: SelectionBehavior;
  /**
   * Whether the item allows dragging.
   * @note This property is only available in collection components that support drag and drop.
   * @selector [data-allows-dragging]
   */
  allowsDragging?: boolean;
  /**
   * Whether the item is currently being dragged.
   * @note This property is only available in collection components that support drag and drop.
   * @selector [data-dragging]
   */
  isDragging?: boolean;
  /**
   * Whether the item is currently an active drop target.
   * @note This property is only available in collection components that support drag and drop.
   * @selector [data-drop-target]
   */
  isDropTarget?: boolean;
};

type MyElement<T> = {
  setProps: (props: any, ref: ForwardedRef<T>, rendered: any) => void;
};
export function useCollectionItemRef<T extends Element>(
  props: any,
  ref: ForwardedRef<T>,
  rendered?: any
): (element: MyElement<T> | null) => void {
  // Return a callback ref that sets the props object on the fake DOM node.
  return useCallback(
    (element: MyElement<T> | null) => {
      element?.setProps(props, ref, rendered);
    },
    [props, ref, rendered]
  );
}

export function useSSRCollectionNode<T extends Element>(
  Type: string,
  props: object,
  ref: ForwardedRef<T>,
  rendered?: any,
  children?: ReactNode
): ReactElement | null {
  // During SSR, portals are not supported, so the collection children will be wrapped in an SSRContext.
  // Since SSR occurs only once, we assume that the elements are rendered in order and never re-render.
  // Therefore we can create elements in our collection document during render so that they are in the
  // collection by the time we need to use the collection to render to the real DOM.
  // After hydration, we switch to client rendering using the portal.
  const itemRef = useCollectionItemRef(props, ref, rendered);
  const parentNode = useContext(SSRContext);
  if (parentNode) {
    // Guard against double rendering in strict mode.
    let element = parentNode.ownerDocument.nodesByProps.get(props);
    if (!element) {
      element = parentNode.ownerDocument.createElement(Type);
      element.setProps(props, ref, rendered);
      parentNode.appendChild(element);
      parentNode.ownerDocument.updateCollection();
      parentNode.ownerDocument.nodesByProps.set(props, element);
    }

    return children ? (
      <SSRContext.Provider value={element}>{children}</SSRContext.Provider>
    ) : null;
  }

  // @ts-ignore
  return <Type ref={itemRef}>{children}</Type>;
}

export type SectionProps<T> = {
  /** The unique id of the section. */
  id?: Key;
  /** The object value that this section represents. When using dynamic collections, this is set automatically. */
  value?: T;
  /** Static child items or a function to render children. */
  children?: ReactNode | ((item: T) => ReactElement);
  /** Values that should invalidate the item cache when using dynamic collections. */
  dependencies?: any[];
} & Omit<SharedSectionProps<T>, "children" | "title"> &
  StyleProps;

function Section<T extends object>(
  props: SectionProps<T>,
  ref: ForwardedRef<HTMLElement>
): JSX.Element | null {
  const children = useCollectionChildren(props);
  return useSSRCollectionNode("section", props, ref, null, children);
}

const _Section = /*#__PURE__*/ (forwardRef as ForwardRefType)(Section);
export { _Section as Section };

export const CollectionContext =
  createContext<CachedChildrenOptions<unknown> | null>(null);
export const CollectionRendererContext =
  createContext<CollectionProps<any>["children"]>(null);

/** A Collection renders a list of items, automatically managing caching and keys. */
export function Collection<T extends object>(
  props: CollectionProps<T>
): JSX.Element {
  const ctx = useContext(CollectionContext)!;
  props = mergeProps(ctx, props);
  props.dependencies = (ctx?.dependencies || []).concat(props.dependencies);
  const renderer = typeof props.children === "function" ? props.children : null;
  return (
    <CollectionRendererContext.Provider value={renderer}>
      {useCollectionChildren(props)}
    </CollectionRendererContext.Provider>
  );
}
