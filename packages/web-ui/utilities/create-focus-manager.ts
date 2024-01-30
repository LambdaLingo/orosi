import type { RefObject } from "react";
import type {
  FocusManager,
  FocusManagerOptions,
  FocusableElement,
} from "types";
import { getOwnerDocument } from "./get-owner-document";
import { getFocusableTreeWalker } from "./get-focusable-tree-walker";
import { focusElement } from "./focus-element";
import { last } from "./last";

/**
 * Creates a FocusManager object that can be used to move focus within an element.
 */
export function createFocusManager(
  ref: RefObject<Element>,
  defaultOptions: FocusManagerOptions = {}
): FocusManager {
  return {
    focusNext(opts: FocusManagerOptions = {}) {
      const root = ref.current;
      if (!root) {
        return null;
      }
      const {
        from,
        tabbable = defaultOptions.tabbable,
        wrap = defaultOptions.wrap,
        accept = defaultOptions.accept,
      } = opts;
      const node = from || getOwnerDocument(root).activeElement;
      const walker = getFocusableTreeWalker(root, { tabbable, accept });
      if (root.contains(node)) {
        walker.currentNode = node!;
      }
      let nextNode = walker.nextNode() as FocusableElement;
      if (!nextNode && wrap) {
        walker.currentNode = root;
        nextNode = walker.nextNode() as FocusableElement;
      }
      if (nextNode) {
        focusElement(nextNode, true);
      }
      return nextNode;
    },
    focusPrevious(opts: FocusManagerOptions = defaultOptions) {
      const root = ref.current;
      if (!root) {
        return null;
      }
      const {
        from,
        tabbable = defaultOptions.tabbable,
        wrap = defaultOptions.wrap,
        accept = defaultOptions.accept,
      } = opts;
      const node = from || getOwnerDocument(root).activeElement;
      const walker = getFocusableTreeWalker(root, { tabbable, accept });
      if (root.contains(node)) {
        walker.currentNode = node!;
      } else {
        const next = last(walker);
        if (next) {
          focusElement(next, true);
        }
        return next ?? null;
      }
      let previousNode = walker.previousNode() as FocusableElement;
      if (!previousNode && wrap) {
        walker.currentNode = root;
        const lastNode = last(walker);
        if (!lastNode) {
          // couldn't wrap
          return null;
        }
        previousNode = lastNode;
      }
      if (previousNode) {
        focusElement(previousNode, true);
      }
      return previousNode ?? null;
    },
    focusFirst(opts = defaultOptions) {
      const root = ref.current;
      if (!root) {
        return null;
      }
      const {
        tabbable = defaultOptions.tabbable,
        accept = defaultOptions.accept,
      } = opts;
      const walker = getFocusableTreeWalker(root, { tabbable, accept });
      const nextNode = walker.nextNode() as FocusableElement;
      if (nextNode) {
        focusElement(nextNode, true);
      }
      return nextNode;
    },
    focusLast(opts = defaultOptions) {
      const root = ref.current;
      if (!root) {
        return null;
      }
      const {
        tabbable = defaultOptions.tabbable,
        accept = defaultOptions.accept,
      } = opts;
      const walker = getFocusableTreeWalker(root, { tabbable, accept });
      const next = last(walker);
      if (next) {
        focusElement(next, true);
      }
      return next ?? null;
    },
  };
}
