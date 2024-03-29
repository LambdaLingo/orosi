import type { FocusableElement } from "../types/shared/dom";
import { getInteractionModality } from "../hooks/interactions/use-focus-visible";
import { focusWithoutScrolling } from "./focus-without-scrolling";
import { getOwnerDocument } from "./get-owner-document";
import { runAfterTransition } from "./run-after-transition";

/**
 * A utility function that focuses an element while avoiding undesired side effects such
 * as page scrolling and screen reader issues with CSS transitions.
 */
export function focusSafely(element: FocusableElement): void {
  // If the user is interacting with a virtual cursor, e.g. screen reader, then
  // wait until after any animated transitions that are currently occurring on
  // the page before shifting focus. This avoids issues with VoiceOver on iOS
  // causing the page to scroll when moving focus if the element is transitioning
  // from off the screen.
  const ownerDocument = getOwnerDocument(element);
  if (getInteractionModality() === "virtual") {
    const lastFocusedElement = ownerDocument.activeElement;
    runAfterTransition(() => {
      // If focus did not move and the element is still in the document, focus it.
      if (
        ownerDocument.activeElement === lastFocusedElement &&
        element.isConnected
      ) {
        focusWithoutScrolling(element);
      }
    });
  } else {
    focusWithoutScrolling(element);
  }
}
