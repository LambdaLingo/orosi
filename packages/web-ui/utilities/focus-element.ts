import type { FocusableElement } from "types";
import { focusSafely } from "./focus-safely";

export function focusElement(
  element: FocusableElement | null,
  scroll = false
): void {
  if (element != null && !scroll) {
    try {
      focusSafely(element);
    } catch (err) {
      // ignore
    }
  } else if (element !== null) {
    try {
      element.focus();
    } catch (err) {
      // ignore
    }
  }
}
