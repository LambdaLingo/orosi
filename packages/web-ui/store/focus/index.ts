export const focusableElements = [
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "a[href]",
  "area[href]",
  "summary",
  "iframe",
  "object",
  "embed",
  "audio[controls]",
  "video[controls]",
  "[contenteditable]",
];

export const FOCUSABLE_ELEMENT_SELECTOR =
  focusableElements.join(":not([hidden]),") +
  ",[tabindex]:not([disabled]):not([hidden])";

export const TABBABLE_ELEMENT_SELECTOR = focusableElements.join(
  ':not([hidden]):not([tabindex="-1"]),'
);
