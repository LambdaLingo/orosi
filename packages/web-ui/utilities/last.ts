import type { FocusableElement } from "types";

export function last(walker: TreeWalker): FocusableElement | undefined {
  let next: FocusableElement | undefined;
  let last: FocusableElement;
  do {
    last = walker.lastChild() as FocusableElement;
    if (last) {
      next = last;
    }
  } while (last);
  return next;
}
