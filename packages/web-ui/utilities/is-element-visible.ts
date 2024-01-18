/**
 * Adapted from https://github.com/testing-library/jest-dom and
 * https://github.com/vuejs/vue-test-utils-next/.
 * Licensed under the MIT License.
 * @param element - Element to evaluate for display or visibility.
 */

import { getOwnerWindow } from "./get-owner-document";

function isStyleVisible(element: Element): boolean {
  const windowObject = getOwnerWindow(element);
  if (
    !(element instanceof windowObject.HTMLElement) &&
    !(element instanceof windowObject.SVGElement)
  ) {
    return false;
  }

  const { display, visibility } = element.style;

  let isVisible =
    display !== "none" && visibility !== "hidden" && visibility !== "collapse";

  if (isVisible) {
    const { getComputedStyle } = element.ownerDocument
      .defaultView as unknown as Window;
    const { display: computedDisplay, visibility: computedVisibility } =
      getComputedStyle(element);

    isVisible =
      computedDisplay !== "none" &&
      computedVisibility !== "hidden" &&
      computedVisibility !== "collapse";
  }

  return isVisible;
}

function isAttributeVisible(element: Element, childElement?: Element): boolean {
  return (
    !element.hasAttribute("hidden") &&
    (element.nodeName === "DETAILS" &&
    childElement &&
    childElement.nodeName !== "SUMMARY"
      ? element.hasAttribute("open")
      : true)
  );
}
export function isElementVisible(
  element: Element,
  childElement?: Element
): boolean {
  return (
    element.nodeName !== "#comment" &&
    isStyleVisible(element) &&
    isAttributeVisible(element, childElement) &&
    (!element.parentElement || isElementVisible(element.parentElement, element))
  );
}
