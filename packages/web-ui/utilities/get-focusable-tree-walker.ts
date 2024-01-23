import {
  FOCUSABLE_ELEMENT_SELECTOR,
  TABBABLE_ELEMENT_SELECTOR,
} from "store/focus";
import type { FocusManagerOptions } from "types";
import { getOwnerDocument } from "./get-owner-document";
import { isElementVisible } from "./is-element-visible";
import { isElementInScope } from "./is-element-in-scope";

/**
 * Create a [TreeWalker]{@link https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker}
 * that matches all focusable/tabbable elements.
 */
export function getFocusableTreeWalker(
  root: Element,
  opts?: FocusManagerOptions,
  scope?: Element[]
): TreeWalker {
  const selector = opts?.tabbable
    ? TABBABLE_ELEMENT_SELECTOR
    : FOCUSABLE_ELEMENT_SELECTOR;
  const walker = getOwnerDocument(root).createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        // Skip nodes inside the starting node.
        if (opts?.from?.contains(node)) {
          return NodeFilter.FILTER_REJECT;
        }

        if (
          (node as Element).matches(selector) &&
          isElementVisible(node as Element) &&
          (!scope || isElementInScope(node as Element, scope)) &&
          (!opts?.accept || opts.accept(node as Element))
        ) {
          return NodeFilter.FILTER_ACCEPT;
        }

        return NodeFilter.FILTER_SKIP;
      },
    }
  );

  if (opts?.from) {
    walker.currentNode = opts.from;
  }

  return walker;
}
