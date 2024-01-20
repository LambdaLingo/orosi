import type { AriaLabelingProps, ButtonProps, FocusableDOMProps } from "types";
import type { ElementType, JSXElementConstructor } from "react";

type ToggleButtonProps = {
  /** Whether the element should be selected (controlled). */
  isSelected?: boolean;
  /** Whether the element should be selected (uncontrolled). */
  defaultSelected?: boolean;
  /** Handler that is called when the element's selection state changes. */
  onChange?: (isSelected: boolean) => void;
} & ButtonProps;

export type AriaButtonElementTypeProps<T extends ElementType = "button"> = {
  /**
   * The HTML element or React element used to render the button, e.g. 'div', 'a', or `RouterLink`.
   * @default 'button'
   */
  elementType?: T | JSXElementConstructor<any>;
};

export type LinkButtonProps<T extends ElementType = "button"> = {
  /** A URL to link to if elementType="a". */
  href?: string;
  /** The target window for the link. */
  target?: string;
  /** The relationship between the linked resource and the current page. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel). */
  rel?: string;
} & AriaButtonElementTypeProps<T>;

type AriaBaseButtonProps = {
  /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
  "aria-expanded"?: boolean | "true" | "false";
  /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
  "aria-haspopup"?:
    | boolean
    | "menu"
    | "listbox"
    | "tree"
    | "grid"
    | "dialog"
    | "true"
    | "false";
  /** Identifies the element (or elements) whose contents or presence are controlled by the current element. */
  "aria-controls"?: string;
  /** Indicates the current "pressed" state of toggle buttons. */
  "aria-pressed"?: boolean | "true" | "false" | "mixed";
  /**
   * The behavior of the button when used in an HTML form.
   * @default 'button'
   */
  type?: "button" | "submit" | "reset";
} & FocusableDOMProps &
  AriaLabelingProps;

export type AriaButtonProps<T extends ElementType = "button"> = ButtonProps &
  LinkButtonProps<T> &
  AriaBaseButtonProps;
export type AriaToggleButtonProps<T extends ElementType = "button"> =
  ToggleButtonProps & AriaBaseButtonProps & AriaButtonElementTypeProps<T>;

/** @deprecated */
type LegacyButtonVariant = "cta" | "overBackground";
