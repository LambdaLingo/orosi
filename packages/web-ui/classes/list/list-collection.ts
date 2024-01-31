import type { Collection, Key, Node } from "types";

export class ListCollection<T> implements Collection<Node<T>> {
  private keyMap = new Map<Key, Node<T>>();
  private iterable: Iterable<Node<T>>;
  private firstKey: Key;
  private lastKey: Key;

  constructor(nodes: Iterable<Node<T>>) {
    this.iterable = nodes;

    const visit = (node: Node<T>) => {
      this.keyMap.set(node.key, node);

      if (node.childNodes && node.type === "section") {
        for (const child of node.childNodes) {
          visit(child);
        }
      }
    };

    for (const node of nodes) {
      visit(node);
    }

    let last: Node<T>;
    let index = 0;
    for (const [key, node] of this.keyMap) {
      if (last) {
        last.nextKey = key;
        node.prevKey = last.key;
      } else {
        this.firstKey = key;
        node.prevKey = undefined;
      }

      if (node.type === "item") {
        node.index = index++;
      }

      last = node;

      // Set nextKey as undefined since this might be the last node
      // If it isn't the last node, last.nextKey will properly set at start of new loop
      last.nextKey = undefined;
    }

    this.lastKey = last.key;
  }

  *[Symbol.iterator](): Iterator<Node<T>> {
    yield* this.iterable;
  }

  get size(): number {
    return this.keyMap.size;
  }

  getKeys(): Iterable<Key> {
    return this.keyMap.keys();
  }

  getKeyBefore(key: Key): Key {
    const node = this.keyMap.get(key);
    return node ? node.prevKey : null;
  }

  getKeyAfter(key: Key): Key {
    const node = this.keyMap.get(key);
    return node ? node.nextKey : null;
  }

  getFirstKey(): Key {
    return this.firstKey;
  }

  getLastKey(): Key {
    return this.lastKey;
  }

  getItem(key: Key): Node<T> {
    return this.keyMap.get(key);
  }

  at(idx: number): Node<T> {
    const keys = [...this.getKeys()];
    return this.getItem(keys[idx]);
  }

  getChildren(key: Key): Iterable<Node<T>> {
    const node = this.keyMap.get(key);
    return node?.childNodes || [];
  }
}
