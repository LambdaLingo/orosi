import type { JSXElementConstructor, ReactNode } from "react";
import type { DOMAttributes } from "types/shared";

export type VisuallyHiddenProps = {
  /** The content to visually hide. */
  children?: ReactNode;

  /**
   * The element type for the container.
   * @default 'div'
   */
  elementType?: string | JSXElementConstructor<any>;

  /** Whether the element should become visible on focus, for example skip links. */
  isFocusable?: boolean;
} & DOMAttributes;

export type VisuallyHiddenAria = {
  visuallyHiddenProps: DOMAttributes;
};
